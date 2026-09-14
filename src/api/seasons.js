import { request, TTL } from "./client";

const CURRENT_LEAGUES_TTL = 24 * 60 * 60 * 1000;
let currentLeaguesCache = null;
let currentLeaguesExpiresAt = 0;
let currentLeaguesPromise = null;

async function getCurrentLeagues() {
    const now = Date.now();
    if (currentLeaguesCache && currentLeaguesExpiresAt > now) return currentLeaguesCache;
    if (currentLeaguesPromise) return currentLeaguesPromise;

    currentLeaguesPromise = request("/leagues?current=true", TTL.reference)
        .then((data) => {
            const leagues = (data.response ?? []).filter((item) => item.league?.id && item.seasons?.some((season) => season.current === true));
            currentLeaguesCache = leagues;
            currentLeaguesExpiresAt = Date.now() + CURRENT_LEAGUES_TTL;
            return leagues;
        })
        .finally(() => {
            currentLeaguesPromise = null;
        });

    return currentLeaguesPromise;
}

async function getCurrentLeague(leagueId) {
    const leagues = await getCurrentLeagues();
    return leagues.find((item) => Number(item.league?.id) === Number(leagueId)) ?? null;
}

async function getCurrentSeason(leagueId) {
    const competition = await getCurrentLeague(leagueId);
    return competition?.seasons?.find((season) => season.current === true)?.year ?? null;
}

export { getCurrentLeagues, getCurrentLeague, getCurrentSeason };
export default getCurrentLeagues;
