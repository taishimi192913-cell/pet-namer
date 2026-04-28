import { randomUUID } from 'node:crypto';
import { createHttpError } from './request.js';

export const COMMUNITY_BUCKET = 'community-media';
export const MAX_COMMUNITY_IMAGE_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

function fallbackDisplayName(user) {
  if (typeof user?.user_metadata?.display_name === 'string' && user.user_metadata.display_name.trim()) {
    return user.user_metadata.display_name.trim().slice(0, 60);
  }
  if (typeof user?.email === 'string' && user.email.includes('@')) {
    return user.email.split('@')[0].slice(0, 60);
  }
  return 'シッポミ member';
}

export async function getOrCreateProfile(supabase, user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, username, bio, pet_name, pet_species, avatar_url, is_pet_owner')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw createHttpError(500, error.message);

  if (data) {
    return data;
  }

  const payload = {
    id: user.id,
    email: user.email || null,
    display_name: fallbackDisplayName(user),
  };

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, email, display_name, username, bio, pet_name, pet_species, avatar_url, is_pet_owner')
    .single();

  if (insertError) throw createHttpError(500, insertError.message);
  return inserted;
}

export function profileToClient(profile) {
  return {
    id: profile.id,
    email: profile.email || '',
    displayName: profile.display_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    petName: profile.pet_name || '',
    petSpecies: profile.pet_species || '',
    avatarUrl: profile.avatar_url || '',
    isPetOwner: Boolean(profile.is_pet_owner),
    isComplete: Boolean(
      profile.is_pet_owner &&
      profile.display_name &&
      profile.username &&
      profile.pet_name &&
      profile.pet_species
    ),
  };
}

export async function requireCommunityMember(supabase, user) {
  const profile = await getOrCreateProfile(supabase, user);
  const clientProfile = profileToClient(profile);

  if (!clientProfile.isComplete) {
    throw createHttpError(403, 'ペットを飼っている飼い主プロフィールの設定が必要です');
  }

  return { profile, clientProfile };
}

function hasValidImageSignature(mimeType, buffer) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return buffer.length >= 8
      && buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47
      && buffer[4] === 0x0d
      && buffer[5] === 0x0a
      && buffer[6] === 0x1a
      && buffer[7] === 0x0a;
  }

  if (mimeType === 'image/webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
}

export function parseImageDataUrl(dataUrl) {
  if (!dataUrl) return null;
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw createHttpError(400, '画像データの形式が正しくありません');
  }

  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i);
  if (!match) {
    throw createHttpError(400, '画像データの形式が正しくありません');
  }

  const mimeType = match[1].toLowerCase();
  const extension = ALLOWED_IMAGE_TYPES.get(mimeType);
  if (!extension) {
    throw createHttpError(400, 'JPEG / PNG / WebP の画像だけ投稿できます');
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength === 0) {
    throw createHttpError(400, '画像が空です');
  }

  if (buffer.byteLength > MAX_COMMUNITY_IMAGE_BYTES) {
    throw createHttpError(413, '画像は2.5MB以下で投稿してください');
  }

  if (!hasValidImageSignature(mimeType, buffer)) {
    throw createHttpError(400, '画像データの種類が一致しません');
  }

  return { mimeType, extension, buffer };
}

export async function ensureCommunityBucket(supabase) {
  const { data, error } = await supabase.storage.getBucket(COMMUNITY_BUCKET);
  if (!error && data) return;

  const { error: createError } = await supabase.storage.createBucket(COMMUNITY_BUCKET, {
    public: false,
    fileSizeLimit: MAX_COMMUNITY_IMAGE_BYTES,
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES.keys()],
  });

  if (createError && !/already exists/i.test(createError.message || '')) {
    throw createHttpError(500, createError.message);
  }
}

export async function uploadCommunityImage(supabase, userId, imageDataUrl) {
  const parsed = parseImageDataUrl(imageDataUrl);
  if (!parsed) return { imagePath: null, imageMimeType: null };

  await ensureCommunityBucket(supabase);
  const imagePath = `${userId}/${Date.now()}-${randomUUID()}.${parsed.extension}`;
  const { error } = await supabase.storage
    .from(COMMUNITY_BUCKET)
    .upload(imagePath, parsed.buffer, {
      contentType: parsed.mimeType,
      upsert: false,
    });

  if (error) throw createHttpError(500, error.message);
  return { imagePath, imageMimeType: parsed.mimeType };
}

export async function createSignedUrlMap(supabase, imagePaths) {
  const uniquePaths = [...new Set(imagePaths.filter(Boolean))];
  if (uniquePaths.length === 0) return new Map();

  const { data, error } = await supabase.storage
    .from(COMMUNITY_BUCKET)
    .createSignedUrls(uniquePaths, 60 * 60);

  if (error) throw createHttpError(500, error.message);

  return new Map((data || []).map((entry) => [entry.path, entry.signedUrl || '']));
}
