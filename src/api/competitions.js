import { request, TTL } from "./client";

async function getCompetitions() {
    return request("/leagues", TTL.reference);
}

async function searchLeagues(query) {
    return request(`/leagues?search=${encodeURIComponent(query)}`, TTL.reference);
}

export { searchLeagues };
export default getCompetitions;
