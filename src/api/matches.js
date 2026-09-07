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
    const encodedId = encodeURIComponent(fixtureId);

    const [fixture, events, statistics, lineups] = await Promise.all([
        request(`?id=${encodedId}`),
        request(`?id=${encodedId}&events=true`),
        request(`?id=${encodedId}&statistics=true`),
        request(`?id=${encodedId}&lineups=true`)
    ]);

    return {
        fixture: fixture.response?.[0] ?? null,
        events: events.response ?? [],
        statistics: statistics.response?.[0] ?? null,
        lineups: lineups.response ?? []
    };
}

async function getMatches() {
    return request();
}

export { getLiveMatches, getFixtureDetails };
export default getMatches;
