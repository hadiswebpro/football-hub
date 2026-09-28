import { request, TTL } from "./client";

async function getLeagueTeams(leagueId, season) {
    return request(`/teams?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`, TTL.stable);
}

async function getNationalTeams() {
    return request("/teams?type=national", TTL.reference);
}

async function searchTeams(query) {
    return request(`/teams?search=${encodeURIComponent(query)}`, TTL.stable);
}

export { getLeagueTeams, getNationalTeams, searchTeams };
export default getLeagueTeams;
