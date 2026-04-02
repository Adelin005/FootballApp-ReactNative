import axios from 'axios';

const API_KEY = 'bdba295edamsh17163e8a2ec7a55p148f00jsn5a6a20dfeaf7';
const API_HOST = 'soccer-football-info.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': API_HOST,
  },
});

// ─── 1. Get All Countries ────────────────────────────────
// Returns: [{ code: "IT", name: "Italy", championships: 25, teams: 510, ... }]
export const getCountries = async () => {
  try {
    const res = await api.get('/countries/list/', { params: { f: 'json' } });
    return res.data?.result || [];
  } catch (err: any) {
    console.error('getCountries error:', err?.message);
    return [];
  }
};

// ─── 2. Get Leagues/Championships by Country Code ────────
// countryCode = "IT", "EN", "ES", etc.
// Returns: [{ id: "52df...", name: "Italy Serie A", country: "IT", has_image: false, important: true }]
export const getLeaguesByCountry = async (countryCode: string) => {
  try {
    const res = await api.get('/championships/list/', {
      params: { c: countryCode, f: 'json' },
    });
    return res.data?.result || [];
  } catch (err: any) {
    console.error('getLeaguesByCountry error:', err?.message);
    return [];
  }
};

// ─── 3. Get Teams from a Championship/League ─────────────
// Uses /championships/view/ and extracts teams from the latest season's standings table
// Returns: [{ team: { id, name }, position, win, draw, loss, points, goals_scored, goals_conceded }]
export const getTeamsByLeague = async (leagueId: string) => {
  try {
    const res = await api.get('/championships/view/', {
      params: { i: leagueId, f: 'json' },
    });
    const resultArr = res.data?.result;
    // result is an array - get the first element
    const championship = Array.isArray(resultArr) ? resultArr[0] : resultArr;
    if (!championship?.seasons || championship.seasons.length === 0) return [];

    // Get the latest season (last in the array)
    const latestSeason = championship.seasons[championship.seasons.length - 1];
    if (!latestSeason?.groups || latestSeason.groups.length === 0) return [];

    // Extract teams from the standings table
    const table = latestSeason.groups[0]?.table || [];
    return table;
  } catch (err: any) {
    console.error('getTeamsByLeague error:', err?.message);
    return [];
  }
};