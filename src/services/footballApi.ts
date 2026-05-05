import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ──────────────────────────────────────────────
const API_KEY = '404ed9dd4684bff265bd21acef0ade61';
const BASE_URL = 'https://v3.football.api-sports.io';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-apisports-key': API_KEY },
});

// ─── Storage Keys ────────────────────────────────────────
// Meta cache = countries + all leagues grouped by country code (refreshed once/day)
const META_CACHE_KEY = 'fb_meta_v1';
// Standings cached per league (refreshed once/day)
const standingsKey = (leagueId: string) => `fb_standings_v1_${leagueId}`;

// ─── Date helper ─────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10); // "2026-05-05"

// ─── Season helper ───────────────────────────────────────
// API-Football uses the year the season STARTED.
// 2024-25 season → season=2024.  Season starts in July/Aug.
const getCurrentSeason = (): number => {
  const month = new Date().getMonth() + 1; // 1-12
  const year = new Date().getFullYear();
  // Before July → still in season that started 2 years ago relative to current year
  // e.g. May 2026 → season 2024
  return month >= 7 ? year : year - 2;
};

// ─── Major league names (for "important" flag) ───────────
const MAJOR_NAMES = new Set([
  'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
  'Eredivisie', 'Primeira Liga', 'Super Lig', 'Scottish Premiership',
  'Jupiler Pro League', 'Championship', 'Serie B', '2. Bundesliga',
  'Liga NOS', 'Premier Liga', 'Superliga', 'Primera División',
  'Premiership', 'MLS', 'Liga MX', 'Brasileirao Serie A',
]);

// ─── In-memory runtime cache (avoid repeated AsyncStorage reads) ──
let runtimeMeta: MetaCache | null = null;

interface CountryEntry {
  code: string;
  name: string;
  championships: number;
  teams: number;
}

interface LeagueEntry {
  id: string;
  name: string;
  country: string;
  has_image: boolean;
  important: boolean;
}

interface MetaCache {
  date: string;
  countries: CountryEntry[];
  leaguesByCountry: Record<string, LeagueEntry[]>; // key = country code
}

// ─────────────────────────────────────────────────────────
// INTERNAL: Load or build the full meta cache
// Makes exactly 2 API requests (countries + leagues) once per day.
// All subsequent calls within the day read from AsyncStorage / memory.
// ─────────────────────────────────────────────────────────
async function getMetaCache(): Promise<MetaCache> {
  const today = todayStr();

  // 1. Runtime memory hit
  if (runtimeMeta && runtimeMeta.date === today) return runtimeMeta;

  // 2. AsyncStorage hit
  try {
    const stored = await AsyncStorage.getItem(META_CACHE_KEY);
    if (stored) {
      const parsed: MetaCache = JSON.parse(stored);
      if (parsed.date === today) {
        runtimeMeta = parsed;
        return runtimeMeta;
      }
    }
  } catch (e) {
    console.warn('AsyncStorage read error (meta):', e);
  }

  // 3. Cache miss → fetch from API (2 requests)
  console.log('[FootballAPI] Fetching fresh meta data (countries + leagues)...');

  // Request 1: Countries
  const countriesRes = await api.get('/countries');
  const rawCountries: any[] = countriesRes.data?.response || [];

  // Request 2: ALL leagues (includes country info per league)
  const leaguesRes = await api.get('/leagues');
  const rawLeagues: any[] = leaguesRes.data?.response || [];

  // Build leaguesByCountry map
  const leaguesByCountry: Record<string, LeagueEntry[]> = {};
  for (const entry of rawLeagues) {
    const countryCode: string | null = entry?.country?.code ?? null;
    if (!countryCode) continue; // skip "World" entries (no code)
    const league = entry.league || {};
    const name: string = league.name || 'Unknown';
    if (!leaguesByCountry[countryCode]) leaguesByCountry[countryCode] = [];
    leaguesByCountry[countryCode].push({
      id: String(league.id),
      name,
      country: countryCode,
      has_image: !!league.logo,
      important: MAJOR_NAMES.has(name),
    });
  }

  // Build countries list (only those that have at least one league)
  const countries: CountryEntry[] = rawCountries
    .filter((c: any) => c.name && c.code && leaguesByCountry[c.code]?.length > 0)
    .map((c: any) => ({
      code: c.code,
      name: c.name,
      championships: leaguesByCountry[c.code]?.length ?? 0,
      teams: 0,
    }));

  const meta: MetaCache = { date: today, countries, leaguesByCountry };

  // Persist to AsyncStorage
  try {
    await AsyncStorage.setItem(META_CACHE_KEY, JSON.stringify(meta));
    console.log(`[FootballAPI] Meta cached: ${countries.length} countries, ${rawLeagues.length} leagues`);
  } catch (e) {
    console.warn('AsyncStorage write error (meta):', e);
  }

  runtimeMeta = meta;
  return meta;
}

// ─────────────────────────────────────────────────────────
// 1. Get All Countries
// Returns: [{ code, name, championships, teams }]
// ─────────────────────────────────────────────────────────
export const getCountries = async (): Promise<CountryEntry[]> => {
  try {
    const meta = await getMetaCache();
    return meta.countries;
  } catch (err: any) {
    console.error('getCountries error:', err?.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────
// 2. Get Leagues by Country Code
// Returns: [{ id, name, country, has_image, important }]
// ─────────────────────────────────────────────────────────
export const getLeaguesByCountry = async (countryCode: string): Promise<LeagueEntry[]> => {
  try {
    const meta = await getMetaCache();
    return meta.leaguesByCountry[countryCode] || [];
  } catch (err: any) {
    console.error('getLeaguesByCountry error:', err?.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────
// 3. Get Teams / Standings for a League
// Returns: [{ team: {id, name}, position, win, draw, loss, points, goals_scored, goals_conceded, note }]
// Each league standings is cached separately (1 request per league per day).
// ─────────────────────────────────────────────────────────
export const getTeamsByLeague = async (leagueId: string): Promise<any[]> => {
  const today = todayStr();
  const cacheKey = standingsKey(leagueId);

  // 1. AsyncStorage hit
  try {
    const stored = await AsyncStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        console.log(`[FootballAPI] Standings cache hit for league ${leagueId}`);
        return parsed.teams;
      }
    }
  } catch (e) {
    console.warn('AsyncStorage read error (standings):', e);
  }

  // 2. Cache miss → fetch from API
  const season = getCurrentSeason();
  console.log(`[FootballAPI] Fetching standings for league ${leagueId}, season ${season}...`);

  try {
    const res = await api.get('/standings', {
      params: { league: leagueId, season },
    });

    const standingsGroups: any[] = res.data?.response?.[0]?.league?.standings || [];
    // Use first group (handles group-stage leagues too)
    const table: any[] = standingsGroups.length > 0 ? standingsGroups[0] : [];

    const teams = table.map((entry: any) => ({
      team: {
        id: String(entry.team?.id || ''),
        name: entry.team?.name || 'Unknown',
      },
      position: entry.rank,
      win: entry.all?.win ?? 0,
      draw: entry.all?.draw ?? 0,
      loss: entry.all?.lose ?? 0,
      points: entry.points ?? 0,
      goals_scored: entry.all?.goals?.for ?? 0,
      goals_conceded: entry.all?.goals?.against ?? 0,
      note: entry.description || null,
    }));

    // Persist standings
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({ date: today, teams }));
    } catch (e) {
      console.warn('AsyncStorage write error (standings):', e);
    }

    return teams;
  } catch (err: any) {
    console.error(`getTeamsByLeague error (league ${leagueId}):`, err?.message);
    return [];
  }
};
