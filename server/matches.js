import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FALLBACK_PATH = path.join(ROOT, 'data', 'openfootball-2026-27.json');
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();
const LIVE_URL = 'https://api.football-data.org/v4/competitions/BL1/matches?status=LIVE';

function cacheSlot(key) {
  if (!cache.has(key)) cache.set(key, { data: null, fetchedAt: null, expiresAt: 0 });
  return cache.get(key);
}

async function requestProviderJSON(url) {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) throw new Error('football-data token unavailable');
  const response = await fetch(url, {
    headers: { 'X-Auth-Token': token, Accept: 'application/json' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`football-data HTTP ${response.status}`);
  return response.json();
}

async function cachedProviderJSON(key, url) {
  const slot = cacheSlot(key);
  if (slot.data && slot.expiresAt > Date.now()) return { data: slot.data, fetchedAt: slot.fetchedAt, stale: false, cached: true };
  try {
    const data = await requestProviderJSON(url);
    const fetchedAt = new Date().toISOString();
    slot.data = data;
    slot.fetchedAt = fetchedAt;
    slot.expiresAt = Date.now() + CACHE_MS;
    return { data, fetchedAt, stale: false, cached: false };
  } catch (error) {
    if (slot.data) return { data: slot.data, fetchedAt: slot.fetchedAt, stale: true, cached: true, error: error.message };
    throw error;
  }
}

function convertProviderMatch(item) {
  const home = item?.homeTeam?.name;
  const away = item?.awayTeam?.name;
  if (!home || !away || !item?.utcDate) return null;
  const status = String(item.status || '').toUpperCase();
  const completed = ['FINISHED', 'AWARDED'].includes(status);
  const fullTime = item.score?.fullTime || {};
  return {
    id: String(item.id || `${item.utcDate}-${home}-${away}`),
    date: item.utcDate,
    timeKnown: true,
    home,
    away,
    homeCrest: item.homeTeam?.crest || null,
    awayCrest: item.awayTeam?.crest || null,
    homeScore: completed ? fullTime.home : undefined,
    awayScore: completed ? fullTime.away : undefined,
    completed,
    live: false,
    status: completed ? 'FINISHED' : 'SCHEDULED',
    venue: item.venue || null,
    matchday: item.matchday || null
  };
}

function isHsvMatch(match) {
  return /hamburg/i.test(`${match.home} ${match.away}`);
}

function groupNormalized(hsv) {
  const relevant = hsv.filter(isHsvMatch);
  const now = Date.now();
  const recent = relevant
    .filter((match) => match.completed && new Date(match.date).getTime() <= now)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 2);
  const next = relevant
    .filter((match) => !match.completed && !match.live && new Date(match.date).getTime() >= now - 4 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2);
  const current = relevant
    .filter((match) => match.live)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return { recent, next, current };
}

function matchGroups(matches) {
  return groupNormalized(matches.map(convertProviderMatch).filter(Boolean));
}

function berlinOffset(date, time) {
  const probe = new Date(`${date}T${time}:00Z`);
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', timeZoneName: 'longOffset' })
    .formatToParts(probe).find((part) => part.type === 'timeZoneName')?.value || 'GMT+01:00';
  let offset = name.replace(/^GMT/, '');
  if (offset === '') offset = '+00:00';
  return offset;
}

function convertFallbackMatch(item) {
  if (!item || !(item.team1 === 'Hamburger SV' || item.team2 === 'Hamburger SV')) return null;
  const hasTime = /^\d{2}:\d{2}$/.test(String(item.time || ''));
  const time = hasTime ? item.time : '12:00';
  const ft = item.score?.ft;
  const completed = Array.isArray(ft) && ft.length >= 2 && ft.slice(0, 2).every((score) => Number.isFinite(Number(score)));
  const date = String(item.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const round = String(item.round || '').match(/(\d+)/);
  return {
    id: `openfootball-${date}-${item.team1}-${item.team2}`,
    date: `${date}T${time}:00${berlinOffset(date, time)}`,
    timeKnown: hasTime,
    home: item.team1,
    away: item.team2,
    homeCrest: null,
    awayCrest: null,
    homeScore: completed ? Number(ft[0]) : undefined,
    awayScore: completed ? Number(ft[1]) : undefined,
    completed,
    live: false,
    status: completed ? 'FINISHED' : 'SCHEDULED',
    venue: null,
    matchday: round ? Number(round[1]) : null
  };
}

async function fallbackMatches() {
  const json = JSON.parse(await fs.readFile(FALLBACK_PATH, 'utf8'));
  const all = (Array.isArray(json.matches) ? json.matches : []).map(convertFallbackMatch).filter(Boolean);
  const groups = groupNormalized(all);
  const completed = all.filter((match) => match.completed).sort((a, b) => new Date(b.date) - new Date(a.date));
  return {
    ...groups,
    lastResultDate: completed[0]?.date || null,
    source: 'OpenFootball (Fallback)',
    fetchedAt: null,
    stale: true,
    delayed: false,
    fallback: true,
    notice: 'Fallback-Quelldaten sind lückenhaft; keine vollständige Tabelle verfügbar.'
  };
}

function normalizeTable(response) {
  const standings = Array.isArray(response?.standings) ? response.standings : [];
  const total = standings.find((item) => item.type === 'TOTAL') || standings[0];
  if (!Array.isArray(total?.table)) return [];
  return total.table.map((row) => ({
    position: Number(row.position),
    name: String(row.team?.name || ''),
    crest: typeof row.team?.crest === 'string' ? row.team.crest : null,
    played: Number(row.playedGames || 0),
    won: Number(row.won || 0),
    draw: Number(row.draw || 0),
    lost: Number(row.lost || 0),
    goalsFor: Number(row.goalsFor || 0),
    goalsAgainst: Number(row.goalsAgainst || 0),
    goalDifference: Number(row.goalDifference || 0),
    points: Number(row.points || 0)
  })).filter((row) => row.name && Number.isFinite(row.position));
}

export async function getBundesligaData() {
  const now = new Date();
  const from = new Date(now.getTime() - 60 * 86400000).toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 60 * 86400000).toISOString().slice(0, 10);
  const matchesUrl = new URL('https://api.football-data.org/v4/competitions/BL1/matches');
  matchesUrl.searchParams.set('dateFrom', from);
  matchesUrl.searchParams.set('dateTo', to);
  matchesUrl.searchParams.set('limit', '100');
  const standingsUrl = 'https://api.football-data.org/v4/competitions/BL1/standings';

  const [matchResult, liveResult, standingsResult] = await Promise.allSettled([
    cachedProviderJSON('matches', matchesUrl.toString()),
    cachedProviderJSON('live', LIVE_URL),
    cachedProviderJSON('standings', standingsUrl)
  ]);

  let matches;
  let liveMatches = [];
  if (matchResult.status === 'fulfilled') {
    matches = matchResult.value;
    if (liveResult.status === 'fulfilled') liveMatches = Array.isArray(liveResult.value.data?.matches) ? liveResult.value.data.matches : [];
    const listed = Array.isArray(matches.data?.matches) ? matches.data.matches : [];
    const byId = new Map([...listed, ...liveMatches].map((item) => [String(item.id), item]));
    const groups = matchGroups([...byId.values()]);
    const fetchedAt = [matches.fetchedAt, liveResult.status === 'fulfilled' ? liveResult.value.fetchedAt : null]
      .filter(Boolean).sort().at(-1) || null;
    matches = {
      ...groups,
      source: 'football-data.org Free Tier',
      fetchedAt,
      stale: matches.stale,
      delayed: true,
      fallback: false,
      notice: 'Free-Tier-Ergebnisse sind verzögert und keine Echtzeit-Livescores.'
    };
  } else {
    matches = await fallbackMatches();
  }

  let standings;
  if (standingsResult.status === 'fulfilled') {
    standings = {
      table: normalizeTable(standingsResult.value.data),
      source: 'football-data.org Free Tier',
      fetchedAt: standingsResult.value.fetchedAt,
      stale: standingsResult.value.stale,
      delayed: true,
      fallback: false,
      notice: 'Kostenlose Tabellendaten können verzögert sein.'
    };
  } else {
    standings = {
      table: [],
      source: matches.fallback ? 'OpenFootball (Fallback)' : 'football-data.org Free Tier',
      fetchedAt: null,
      stale: true,
      delayed: true,
      fallback: true,
      notice: 'Keine verlässliche vollständige Tabelle verfügbar.'
    };
  }

  return { matches, standings, cacheMinutes: CACHE_MS / 60000 };
}
