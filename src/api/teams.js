import { request, TTL } from "./client";

async function getLeagueTeams(leagueId, season, page = 1) {
    return request(`/teams?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}&page=${page}`, TTL.stable);
}

async function getNationalTeams() {
    return request("/teams?type=national", TTL.reference);
}

async function searchTeams(query, page = 1) {
    return request(`/teams?search=${encodeURIComponent(query)}&page=${page}`, TTL.stable);
}

export { getLeagueTeams, getNationalTeams, searchTeams };
export default getLeagueTeams;
