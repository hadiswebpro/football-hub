const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "";

async function request(params = "") {
    const response = await fetch(`${API_URL}${params}`, {
        headers: {
            "x-apisports-key": API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Fixtures request failed: ${response.status}`);
    }

    return response.json();
}

async function getLiveMatches() {
    return request("?live=all");
}

async function getFixtureDetails(fixtureId) {
    const data = await request(`?id=${encodeURIComponent(fixtureId)}`);
    return data.response?.[0] ?? null;
}

async function getFixtureEvents(fixtureId) {
    const data = await request(`?id=${encodeURIComponent(fixtureId)}&events=true`);
    return data.response ?? [];
}

async function getFixtureStatistics(fixtureId) {
    const data = await request(`?id=${encodeURIComponent(fixtureId)}&statistics=true`);
    return data.response?.[0] ?? null;
}

async function getFixtureLineups(fixtureId) {
    const data = await request(`?id=${encodeURIComponent(fixtureId)}&lineups=true`);
    return data.response ?? [];
}

async function getMatches() {
    return request();
}

export {
    getLiveMatches,
    getFixtureDetails,
    getFixtureEvents,
    getFixtureStatistics,
    getFixtureLineups
};

export default getMatches;
