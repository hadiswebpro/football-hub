import getCompetitions from "../api/competitions";
import { getLiveMatches, getMatchesByDate } from "../api/matches";
import createHero from "../components/hero";
import createMatchCard from "../components/matchcard";
import createLeagueCard from "../components/leagueCard";
import createTeamCard from "../components/teamCard";

const importantLeagueIds = [1, 4, 2, 3, 39, 40, 140, 135, 78, 61];
const popularTeams = [
    { id: 541, name: "Real Madrid", country: "Spain", league: "La Liga", logo: "https://media.api-sports.io/football/teams/541.png" },
    { id: 529, name: "Barcelona", country: "Spain", league: "La Liga", logo: "https://media.api-sports.io/football/teams/529.png" },
    { id: 50, name: "Manchester City", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/50.png" },
    { id: 40, name: "Liverpool", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/40.png" },
    { id: 157, name: "Bayern Munich", country: "Germany", league: "Bundesliga", logo: "https://media.api-sports.io/football/teams/157.png" },
    { id: 85, name: "Paris Saint-Germain", country: "France", league: "Ligue 1", logo: "https://media.api-sports.io/football/teams/85.png" },
    { id: 42, name: "Arsenal", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/42.png" },
    { id: 33, name: "Manchester United", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/33.png" }
];

function getDate(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

function normalizeFixture(fixture) {
    const status = fixture.fixture?.status?.short;
    const live = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(status);
    const finished = ["FT", "AET", "PEN"].includes(status);
    return {
        fixtureId: fixture.fixture?.id,
        league: fixture.league?.name ?? "Football",
        status: live ? "LIVE" : finished ? "FINISHED" : "SCHEDULED",
        minute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "",
        time: live ? "Live now" : new Date(fixture.fixture?.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: fixture.fixture?.date ?? "",
        home: { name: fixture.teams?.home?.name ?? "Home", score: fixture.goals?.home ?? null, logo: fixture.teams?.home?.logo ?? "" },
        away: { name: fixture.teams?.away?.name ?? "Away", score: fixture.goals?.away ?? null, logo: fixture.teams?.away?.logo ?? "" }
    };
}

function renderMatchStrip(container, fixtures, emptyText) {
    container.innerHTML = "";
    if (!fixtures.length) { container.innerHTML = `<div class="home-match-strip__empty">${emptyText}</div>`; return; }
    fixtures.forEach((fixture) => container.appendChild(createMatchCard(normalizeFixture(fixture))));
}

function renderHome() {
    const app = document.querySelector("#app");
    if (!app) return null;
    app.innerHTML = `
        <section class="home-section home-section--live">
            <div class="section-heading"><span class="section-heading__eyebrow">LIVE NOW</span><h2>Live Matches</h2><p>Follow the games happening right now.</p></div>
            <div class="home-match-strip" data-live></div>
        </section>
        <section class="home-section home-section--matches">
            <div class="section-heading home-section-heading-row"><div><span class="section-heading__eyebrow">MATCH CENTER</span><h2>Matches</h2><p>A quick look at what's next and what happened yesterday.</p></div><a class="home-section__link" href="#matches">View all matches ↗</a></div>
            <div class="home-match-block"><div class="home-match-block__title"><span>UPCOMING</span><small>Today &amp; tomorrow</small></div><div class="home-match-strip" data-upcoming></div></div>
            <div class="home-match-block"><div class="home-match-block__title"><span>YESTERDAY'S RESULTS</span><small>Latest completed games</small></div><div class="home-match-strip" data-results></div></div>
        </section>
        <section class="home-section home-section--leagues">
            <div class="section-heading home-section-heading-row"><div><span class="section-heading__eyebrow">EXPLORE</span><h2>Top Leagues</h2><p>The competitions everyone is watching.</p></div><a class="home-section__link" href="#leagues">View all leagues ↗</a></div>
            <div class="home-card-strip" data-leagues></div>
        </section>
        <section class="home-section home-section--teams">
            <div class="section-heading home-section-heading-row"><div><span class="section-heading__eyebrow">FAN FAVORITES</span><h2>Popular Teams</h2><p>Keep up with the biggest clubs in world football.</p></div><a class="home-section__link" href="#teams">View all teams ↗</a></div>
            <div class="home-card-strip home-card-strip--teams" data-teams></div>
        </section>
    `;
    app.prepend(createHero());
    return { live: app.querySelector("[data-live]"), upcoming: app.querySelector("[data-upcoming]"), results: app.querySelector("[data-results]"), leagues: app.querySelector("[data-leagues]"), teams: app.querySelector("[data-teams]") };
}

async function loadCompetitions() {
    const containers = renderHome();
    if (!containers) return;
    popularTeams.slice(0, 6).forEach((team) => containers.teams.appendChild(createTeamCard(team)));
    containers.live.innerHTML = `<div class="home-match-strip__empty">Loading live matches…</div>`;
    containers.upcoming.innerHTML = `<div class="home-match-strip__empty">Loading upcoming matches…</div>`;
    containers.results.innerHTML = `<div class="home-match-strip__empty">Loading results…</div>`;

    try {
        const [liveData, todayData, tomorrowData, yesterdayData] = await Promise.all([
            getLiveMatches(), getMatchesByDate(getDate()), getMatchesByDate(getDate(1)), getMatchesByDate(getDate(-1))
        ]);
        const live = liveData.response ?? [];
        const upcoming = [...(todayData.response ?? []), ...(tomorrowData.response ?? [])].filter((item) => !["FT", "AET", "PEN"].includes(item.fixture?.status?.short)).sort((a,b) => new Date(a.fixture.date)-new Date(b.fixture.date)).slice(0,8);
        const results = (yesterdayData.response ?? []).filter((item) => ["FT", "AET", "PEN"].includes(item.fixture?.status?.short)).sort((a,b) => new Date(b.fixture.date)-new Date(a.fixture.date)).slice(0,8);
        renderMatchStrip(containers.live, live, "No live matches right now.");
        renderMatchStrip(containers.upcoming, upcoming, "No upcoming matches found.");
        renderMatchStrip(containers.results, results, "No completed matches found.");
    } catch {
        const message = `<div class="home-match-strip__empty">Could not load matches. Check your API key.</div>`;
        containers.live.innerHTML = message; containers.upcoming.innerHTML = message; containers.results.innerHTML = message;
    }

    try {
        const data = await getCompetitions();
        const competitions = (data.response ?? []).filter((item) => importantLeagueIds.includes(item.league.id)).slice(0, 6);
        competitions.forEach((competition) => containers.leagues.appendChild(createLeagueCard(competition)));
        if (!competitions.length) containers.leagues.innerHTML = `<div class="home-match-strip__empty">No leagues found.</div>`;
    } catch {
        containers.leagues.innerHTML = `<div class="home-match-strip__empty">Could not load leagues.</div>`;
    }
}

export default loadCompetitions;
