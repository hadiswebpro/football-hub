import { request, TTL } from "./client";

async function getLeagueTeams(leagueId, season) {
    return request(`/teams?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`, TTL.stable);
}

export { getLeagueTeams };
export default getLeagueTeams;
