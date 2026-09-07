const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = "";

async function request(path) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { "x-apisports-key": API_KEY }
    });

    if (!response.ok) {
        throw new Error(`Football API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error("Football API returned an error.");
    }

    return data;
}

async function getTeam(teamId) {
    return request(`/teams?id=${encodeURIComponent(teamId)}`);
}

async function getTeamFixtures(teamId, season, next = 12) {
    return request(`/fixtures?team=${encodeURIComponent(teamId)}&season=${encodeURIComponent(season)}&next=${encodeURIComponent(next)}`);
}

async function getTeamRecentFixtures(teamId, season, last = 12) {
    return request(`/fixtures?team=${encodeURIComponent(teamId)}&season=${encodeURIComponent(season)}&last=${encodeURIComponent(last)}`);
}

export { getTeam, getTeamFixtures, getTeamRecentFixtures };
