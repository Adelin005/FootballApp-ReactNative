import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';

const getFavoritesKey = () => {
  const userId = auth.currentUser?.uid;
  return userId ? `@football_favorites_${userId}` : '@football_favorites_anonymous';
};

export interface FavoriteTeam {
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
  position?: number;
  points?: number;
  win?: number;
  draw?: number;
  loss?: number;
  goalsScored?: number;
  goalsConceded?: number;
  note?: string;
  savedAt: number; // timestamp
}

// ─── Get all favorites ───────────────────────────────────
export const getFavorites = async (): Promise<FavoriteTeam[]> => {
  try {
    const json = await AsyncStorage.getItem(getFavoritesKey());
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (err) {
    console.error('getFavorites error:', err);
    return [];
  }
};

// ─── Check if a team is favorited ────────────────────────
export const isFavorite = async (teamId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((f) => f.teamId === teamId);
};

// ─── Add a team to favorites ─────────────────────────────
export const addFavorite = async (team: FavoriteTeam): Promise<void> => {
  try {
    const favorites = await getFavorites();
    // Don't add duplicates
    if (favorites.some((f) => f.teamId === team.teamId)) return;
    favorites.push({ ...team, savedAt: Date.now() });
    await AsyncStorage.setItem(getFavoritesKey(), JSON.stringify(favorites));
  } catch (err) {
    console.error('addFavorite error:', err);
  }
};

// ─── Remove a team from favorites ────────────────────────
export const removeFavorite = async (teamId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const updated = favorites.filter((f) => f.teamId !== teamId);
    await AsyncStorage.setItem(getFavoritesKey(), JSON.stringify(updated));
  } catch (err) {
    console.error('removeFavorite error:', err);
  }
};

// ─── Toggle favorite status ──────────────────────────────
export const toggleFavorite = async (team: FavoriteTeam): Promise<boolean> => {
  const favorites = await getFavorites();
  const exists = favorites.some((f) => f.teamId === team.teamId);
  if (exists) {
    await removeFavorite(team.teamId);
    return false; // no longer favorite
  } else {
    await addFavorite(team);
    return true; // now favorite
  }
};
