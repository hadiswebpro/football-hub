const API_BASE = "https://v3.football.api-sports.io";
const API_URL = "https://v3.football.api-sports.io/fixtures";
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

async function getLiveMatches() {
    return request("/fixtures?live=all");
}

async function getMatchesByDate(date) {
    return request(`/fixtures?date=${encodeURIComponent(date)}`);
}

async function getLeagueFixtures(leagueId, season, next = 20) {
    return request(`/fixtures?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}&next=${encodeURIComponent(next)}`);
}

async function getLeagueRecentFixtures(leagueId, season, last = 20) {
    return request(`/fixtures?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}&last=${encodeURIComponent(last)}`);
}

async function getFixture(fixtureId) {
    return request(`/fixtures?id=${encodeURIComponent(fixtureId)}`);
}

async function getFixtureEvents(fixtureId) {
    return request(`/fixtures/events?fixture=${encodeURIComponent(fixtureId)}`);
}

async function getFixtureStatistics(fixtureId) {
    return request(`/fixtures/statistics?fixture=${encodeURIComponent(fixtureId)}`);
}

async function getFixtureLineups(fixtureId) {
    return request(`/fixtures/lineups?fixture=${encodeURIComponent(fixtureId)}`);
}

async function getFixtureDetails(fixtureId) {
    const [fixture, events, statistics, lineups] = await Promise.all([
        getFixture(fixtureId),
        getFixtureEvents(fixtureId),
        getFixtureStatistics(fixtureId),
        getFixtureLineups(fixtureId)
    ]);

    return {
        fixture: fixture.response?.[0] ?? null,
        events: events.response ?? [],
        statistics: statistics.response ?? [],
        lineups: lineups.response ?? []
    };
}

export {
    getLiveMatches,
    getMatchesByDate,
    getLeagueFixtures,
    getLeagueRecentFixtures,
    getFixture,
    getFixtureEvents,
    getFixtureStatistics,
    getFixtureLineups,
    getFixtureDetails
};

export default getMatchesByDate;
