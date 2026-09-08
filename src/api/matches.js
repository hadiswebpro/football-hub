import { request, TTL } from "./client";

const TEHRAN_TIMEZONE = "Asia/Tehran";

async function getLiveMatches() {
    return request("/fixtures?live=all&timezone=Asia%2FTehran", TTL.live);
}

async function getMatchesByDate(date) {
    return request(`/fixtures?date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(TEHRAN_TIMEZONE)}`, TTL.fixtures);
}

async function getLeagueFixtures(leagueId, season, next = 20) {
    return request(`/fixtures?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}&next=${encodeURIComponent(next)}&timezone=${encodeURIComponent(TEHRAN_TIMEZONE)}`, TTL.fixtures);
}

async function getLeagueRecentFixtures(leagueId, season, last = 20) {
    return request(`/fixtures?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}&last=${encodeURIComponent(last)}&timezone=${encodeURIComponent(TEHRAN_TIMEZONE)}`, TTL.fixtures);
}

async function getFixture(fixtureId) {
    return request(`/fixtures?id=${encodeURIComponent(fixtureId)}&timezone=${encodeURIComponent(TEHRAN_TIMEZONE)}`, TTL.details);
}

async function getFixtureEvents(fixtureId) {
    return request(`/fixtures/events?fixture=${encodeURIComponent(fixtureId)}`, TTL.details);
}

async function getFixtureStatistics(fixtureId) {
    return request(`/fixtures/statistics?fixture=${encodeURIComponent(fixtureId)}`, TTL.details);
}

async function getFixtureLineups(fixtureId) {
    return request(`/fixtures/lineups?fixture=${encodeURIComponent(fixtureId)}`, TTL.details);
}

export {
    getLiveMatches,
    getMatchesByDate,
    getLeagueFixtures,
    getLeagueRecentFixtures,
    getFixture,
    getFixtureEvents,
    getFixtureStatistics,
    getFixtureLineups
};

export default getMatchesByDate;
