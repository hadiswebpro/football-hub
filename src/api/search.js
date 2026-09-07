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

    return data.response ?? [];
}

async function searchTeams(query) {
    return request(`/teams?search=${encodeURIComponent(query)}`);
}

async function searchLeagues(query) {
    return request(`/leagues?search=${encodeURIComponent(query)}`);
}

async function searchMatches(from, to) {
    return request(`/fixtures?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

export { searchTeams, searchLeagues, searchMatches };
