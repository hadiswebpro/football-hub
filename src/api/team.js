import { request, TTL } from "./client";

async function getTeam(teamId) {
    return request(`/teams?id=${encodeURIComponent(teamId)}`, TTL.reference);
}

async function searchTeams(query) {
    return request(`/teams?search=${encodeURIComponent(query)}`, TTL.reference);
}

async function getTeamFixtures(teamId, season, next = 12) {
    return request(`/fixtures?team=${encodeURIComponent(teamId)}&season=${encodeURIComponent(season)}&next=${encodeURIComponent(next)}`, TTL.fixtures);
}

async function getTeamRecentFixtures(teamId, season, last = 12) {
    return request(`/fixtures?team=${encodeURIComponent(teamId)}&season=${encodeURIComponent(season)}&last=${encodeURIComponent(last)}`, TTL.fixtures);
}

export { getTeam, searchTeams, getTeamFixtures, getTeamRecentFixtures };
