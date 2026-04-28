import { z } from 'zod';
import {
  COMMUNITY_BUCKET,
  createSignedUrlMap,
  requireCommunityMember,
  uploadCommunityImage,
} from './_lib/community.js';
import { readBearerToken, readJsonBody, sendJson } from './_lib/request.js';
import { requireAuthenticatedUser } from './_lib/supabase.js';
import { verifyWriteChallenge } from './_lib/write-protection.js';

const communityPostSchema = z.object({
  topic: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(800),
  imageDataUrl: z.string().trim().optional().nullable(),
});

function withNoStore(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

function mapCommentRow(row, viewerId) {
  return {
    id: row.id,
    postId: row.post_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    isOwner: row.user_id === viewerId,
  };
}

function mapPostRow(row, viewerId, extras) {
  return {
    id: row.id,
    authorName: row.author_name,
    petName: row.pet_name || '',
    petSpecies: row.pet_species || '',
    topic: row.topic,
    body: row.body,
    createdAt: row.created_at,
    imageUrl: extras.imageUrl || '',
    likeCount: extras.likeCount || 0,
    commentCount: extras.commentCount || 0,
    likedByViewer: Boolean(extras.likedByViewer),
    comments: extras.comments || [],
    isOwner: row.user_id === viewerId,
  };
}

async function hydratePosts(supabase, rows, viewerId) {
  const postIds = rows.map((row) => row.id);
  const imageUrlMap = await createSignedUrlMap(
    supabase,
    rows.map((row) => row.image_path || ''),
  );

  let likes = [];
  let comments = [];
  if (postIds.length > 0) {
    const [{ data: likeRows, error: likeError }, { data: commentRows, error: commentError }] = await Promise.all([
      supabase
        .from('community_post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds),
      supabase
        .from('community_post_comments')
        .select('id, post_id, user_id, author_name, body, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true }),
    ]);

    if (likeError) throw new Error(likeError.message);
    if (commentError) throw new Error(commentError.message);
    likes = likeRows || [];
    comments = commentRows || [];
  }

  const likesByPostId = new Map();
  likes.forEach((entry) => {
    const state = likesByPostId.get(entry.post_id) || { count: 0, likedByViewer: false };
    state.count += 1;
    if (entry.user_id === viewerId) state.likedByViewer = true;
    likesByPostId.set(entry.post_id, state);
  });

  const commentsByPostId = new Map();
  comments.forEach((entry) => {
    const list = commentsByPostId.get(entry.post_id) || [];
    list.push(mapCommentRow(entry, viewerId));
    commentsByPostId.set(entry.post_id, list);
  });

  return rows.map((row) => {
    const likeState = likesByPostId.get(row.id) || { count: 0, likedByViewer: false };
    const commentList = commentsByPostId.get(row.id) || [];
    return mapPostRow(row, viewerId, {
      imageUrl: imageUrlMap.get(row.image_path || '') || '',
      likeCount: likeState.count,
      likedByViewer: likeState.likedByViewer,
      commentCount: commentList.length,
      comments: commentList,
    });
  });
}

export default async function handler(request, response) {
  withNoStore(response);

  if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, DELETE');
    return sendJson(response, 405, { ok: false, error: 'Method not allowed' });
  }

  const accessToken = readBearerToken(request);
  const { error: authError, user, supabase } = await requireAuthenticatedUser(accessToken);
  if (authError || !user || !supabase) {
    return sendJson(response, 401, { ok: false, error: authError || 'Unauthorized' });
  }

  try {
    const { profile, clientProfile } = await requireCommunityMember(supabase, user);

    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('owner_community_posts')
        .select('id, user_id, author_name, pet_name, pet_species, topic, body, image_path, image_mime_type, created_at')
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      return sendJson(response, 200, {
        ok: true,
        viewerProfile: clientProfile,
        posts: await hydratePosts(supabase, data || [], user.id),
      });
    }

    const body = await readJsonBody(request, { maxBytes: 4 * 1024 * 1024 });

    if (request.method === 'POST') {
      await verifyWriteChallenge(request, body);
      const parsed = communityPostSchema.safeParse(body.post || {});
      if (!parsed.success) {
        return sendJson(response, 400, { ok: false, error: 'Invalid community post payload' });
      }

      const post = parsed.data;
      const upload = await uploadCommunityImage(supabase, user.id, post.imageDataUrl || '');

      const { data, error } = await supabase
        .from('owner_community_posts')
        .insert({
          user_id: user.id,
          author_name: profile.display_name,
          pet_name: profile.pet_name || null,
          pet_species: profile.pet_species || null,
          topic: post.topic,
          body: post.body,
          image_path: upload.imagePath,
          image_mime_type: upload.imageMimeType,
        })
        .select('id, user_id, author_name, pet_name, pet_species, topic, body, image_path, image_mime_type, created_at')
        .single();

      if (error) {
        if (upload.imagePath) {
          await supabase.storage.from(COMMUNITY_BUCKET).remove([upload.imagePath]);
        }
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      const [hydratedPost] = await hydratePosts(supabase, [data], user.id);
      return sendJson(response, 200, {
        ok: true,
        post: hydratedPost,
      });
    }

    const postId = typeof body.id === 'string' ? body.id : '';
    if (!postId) {
      return sendJson(response, 400, { ok: false, error: 'Missing post id' });
    }

    const { data: postRow, error: postFetchError } = await supabase
      .from('owner_community_posts')
      .select('id, user_id, image_path')
      .eq('id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (postFetchError) {
      return sendJson(response, 500, { ok: false, error: postFetchError.message });
    }

    if (!postRow) {
      return sendJson(response, 404, { ok: false, error: 'Post not found' });
    }

    const { error } = await supabase
      .from('owner_community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) {
      return sendJson(response, 500, { ok: false, error: error.message });
    }

    if (postRow.image_path) {
      await supabase.storage.from(COMMUNITY_BUCKET).remove([postRow.image_path]);
    }

    return sendJson(response, 200, { ok: true, id: postId });
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return sendJson(response, statusCode, {
      ok: false,
      error: error.message || 'Unknown server error',
    });
  }
}
