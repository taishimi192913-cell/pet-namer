import { z } from 'zod';
import { requireCommunityMember } from './_lib/community.js';
import { readBearerToken, readJsonBody, sendJson } from './_lib/request.js';
import { requireAuthenticatedUser } from './_lib/supabase.js';
import { verifyWriteChallenge } from './_lib/write-protection.js';

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1).max(400),
});

const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
});

function withNoStore(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

function mapComment(row, viewerId) {
  return {
    id: row.id,
    postId: row.post_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    isOwner: row.user_id === viewerId,
  };
}

export default async function handler(request, response) {
  withNoStore(response);

  if (!['POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'POST, DELETE');
    return sendJson(response, 405, { ok: false, error: 'Method not allowed' });
  }

  const accessToken = readBearerToken(request);
  const { error: authError, user, supabase } = await requireAuthenticatedUser(accessToken);
  if (authError || !user || !supabase) {
    return sendJson(response, 401, { ok: false, error: authError || 'Unauthorized' });
  }

  try {
    const { profile } = await requireCommunityMember(supabase, user);
    const body = await readJsonBody(request, { maxBytes: 32 * 1024 });

    if (request.method === 'POST') {
      await verifyWriteChallenge(request, body);
      const parsed = createCommentSchema.safeParse(body);
      if (!parsed.success) {
        return sendJson(response, 400, { ok: false, error: 'Invalid comment payload' });
      }

      const { data, error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: parsed.data.postId,
          user_id: user.id,
          author_name: profile.display_name,
          body: parsed.data.body,
        })
        .select('id, post_id, user_id, author_name, body, created_at')
        .single();

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      return sendJson(response, 200, {
        ok: true,
        comment: mapComment(data, user.id),
      });
    }

    const parsed = deleteCommentSchema.safeParse(body);
    if (!parsed.success) {
      return sendJson(response, 400, { ok: false, error: 'Invalid comment payload' });
    }

    const { error } = await supabase
      .from('community_post_comments')
      .delete()
      .eq('id', parsed.data.commentId)
      .eq('user_id', user.id);

    if (error) {
      return sendJson(response, 500, { ok: false, error: error.message });
    }

    return sendJson(response, 200, { ok: true, id: parsed.data.commentId });
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return sendJson(response, statusCode, {
      ok: false,
      error: error.message || 'Unknown server error',
    });
  }
}
