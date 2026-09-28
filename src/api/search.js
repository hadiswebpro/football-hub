import { request, TTL } from "./client";

async function searchTeams(query) {
    const data = await request(`/teams?search=${encodeURIComponent(query)}`, TTL.stable);
    return data.response ?? [];
}

async function searchLeagues(query) {
    const data = await request(`/leagues?search=${encodeURIComponent(query)}`, TTL.stable);
    return data.response ?? [];
}

async function searchMatches(from, to) {
    const data = await request(`/fixtures?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, TTL.fixtures);
    return data.response ?? [];
}

export { searchTeams, searchLeagues, searchMatches };
