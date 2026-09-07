const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = "";

async function getTeamSquad(teamId) {
    const response = await fetch(`${API_BASE}/players/squads?team=${encodeURIComponent(teamId)}`, {
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

export default getTeamSquad;
