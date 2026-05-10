import { createClient } from '@supabase/supabase-js';
import { NativeModules } from 'react-native';
import type { FiltersState, PreferenceProfile, SwipeCandidate, SwipeRecord } from './types';

declare const process: {
  env?: Record<string, string | undefined>;
} | undefined;

declare const require: (moduleName: string) => { default?: StorageApi } & StorageApi;

const SESSION_KEY = 'sippomi-ios/session-v3';
const FAVORITES_KEY = 'sippomi-ios/favorites-v3';

const supabaseUrl = process?.env?.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process?.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

type StorageApi = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryStorage: StorageApi = {
  async getItem(key) {
    return memoryStore.get(key) ?? null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
  },
  async removeItem(key) {
    memoryStore.delete(key);
  },
};

function getStorage(): StorageApi {
  if (!NativeModules.RNCAsyncStorage) {
    return memoryStorage;
  }

  try {
    const asyncStorageModule = require('@react-native-async-storage/async-storage');
    return asyncStorageModule.default ?? asyncStorageModule;
  } catch {
    return memoryStorage;
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: getStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  : null;

export type PersistedSession = {
  filters: FiltersState;
  preference: PreferenceProfile;
  queue: SwipeCandidate[];
  swipes: SwipeRecord[];
  saved: SwipeCandidate[];
  seenKeys: string[];
};

export async function loadPersistedSession() {
  try {
    const storage = getStorage();
    const raw = await storage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as PersistedSession;
    } catch (error) {
      console.error('Failed to parse persisted session', error);
      await storage.removeItem(SESSION_KEY);
      return null;
    }
  } catch (error) {
    console.error('Failed to load persisted session', error);
    return null;
  }
}

export async function savePersistedSession(session: PersistedSession) {
  try {
    await getStorage().setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save persisted session', error);
  }
}

export async function loadFavoriteCandidates() {
  try {
    const storage = getStorage();
    const raw = await storage.getItem(FAVORITES_KEY);
    if (!raw) return [] as SwipeCandidate[];

    try {
      return JSON.parse(raw) as SwipeCandidate[];
    } catch (error) {
      console.error('Failed to parse favorite candidates', error);
      await storage.removeItem(FAVORITES_KEY);
      return [] as SwipeCandidate[];
    }
  } catch (error) {
    console.error('Failed to load favorite candidates', error);
    return [] as SwipeCandidate[];
  }
}

export async function saveFavoriteCandidate(candidate: SwipeCandidate) {
  try {
    const favorites = await loadFavoriteCandidates();
    const nextFavorites = [
      candidate,
      ...favorites.filter((entry) => entry.key !== candidate.key),
    ].slice(0, 50);
    await getStorage().setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
  } catch (error) {
    console.error('Failed to save favorite candidate locally', error);
    return { target: 'local' as const };
  }

  if (!supabase) {
    return { target: 'local' as const };
  }

  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      return { target: 'local' as const };
    }

    const { error } = await supabase
      .from('favorite_names')
      .upsert({
        user_id: data.session.user.id,
        name: candidate.item.name,
        reading: candidate.item.reading || null,
        species: candidate.item.species,
        reason_parts: candidate.reasonParts,
        scores: candidate.scores,
      });

    if (error) {
      console.error('Failed to save favorite candidate to Supabase', error);
    }

    return { target: error ? 'local' as const : 'supabase' as const };
  } catch (error) {
    console.error('Failed to save favorite candidate remotely', error);
    return { target: 'local' as const };
  }
}
