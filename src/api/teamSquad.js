import { request, TTL } from "./client";

async function getTeamSquad(teamId) {
    return request(`/players/squads?team=${encodeURIComponent(teamId)}`, TTL.stable);
}

export default getTeamSquad;
