import { formatDate, getLeagueStatus } from "../utils/date";
import { getLeagueFixtures, getLeagueRecentFixtures } from "../api/matches";
import createMatchCard from "../components/matchcard";

const SELECTED_LEAGUE_KEY = "football-hub-selected-league";
const FAVORITES_KEY = "football-hub-favorite-leagues";

function getSelectedLeague() {
    try {
        return JSON.parse(sessionStorage.getItem(SELECTED_LEAGUE_KEY));
    } catch {
        return null;
    }
}

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function normalizeFixture(item) {
    const fixture = item.fixture ?? {};
    const league = item.league ?? {};
    const teams = item.teams ?? {};
    const goals = item.goals ?? {};
    const status = fixture.status?.short;
    const isLive = ["1H", "HT", "2H", "ET", "BT", "P"].includes(status);
    const isFinished = ["FT", "AET", "PEN"].includes(status);
    const date = fixture.date;

    return {
        fixtureId: fixture.id,
        date,
        league: league.name ?? "League",
        status: isLive ? "LIVE" : isFinished ? "FINISHED" : "SCHEDULED",
        minute: fixture.status?.elapsed ? `${fixture.status.elapsed}'` : "",
        time: date ? new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "–",
        home: {
            name: teams.home?.name ?? "Home",
            logo: teams.home?.logo ?? "",
            score: goals.home
        },
        away: {
            name: teams.away?.name ?? "Away",
            logo: teams.away?.logo ?? "",
            score: goals.away
        }
    };
}

function renderFixtureGrid(target, fixtures, emptyMessage) {
    if (!fixtures.length) {
        target.innerHTML = `<div class="league-page__empty league-page__empty--inline"><span>NO DATA</span><h2>No matches found</h2><p>${emptyMessage}</p></div>`;
        return;
    }

    target.innerHTML = "";
    fixtures.forEach((fixture) => target.appendChild(createMatchCard(fixture)));
}

async function loadLeagueMatches(app, competition) {
    const season = competition.seasons?.find((item) => item.current === true) ?? competition.seasons?.[0];
    const leagueId = competition.league.id;
    const upcomingTarget = app.querySelector("[data-fixtures='upcoming']");
    const recentTarget = app.querySelector("[data-fixtures='recent']");

    if (!season?.year) {
        const message = `<div class="league-page__empty league-page__empty--inline"><span>SEASON UNAVAILABLE</span><h2>Fixtures unavailable</h2><p>This competition does not have a season selected yet.</p></div>`;
        upcomingTarget.innerHTML = message;
        recentTarget.innerHTML = message;
        return;
    }

    upcomingTarget.innerHTML = `<div class="league-page__loading">Loading upcoming matches…</div>`;
    recentTarget.innerHTML = `<div class="league-page__loading">Loading recent results…</div>`;

    try {
        const [upcomingData, recentData] = await Promise.all([
            getLeagueFixtures(leagueId, season.year, 12),
            getLeagueRecentFixtures(leagueId, season.year, 12)
        ]);

        const upcoming = (upcomingData.response ?? [])
            .map(normalizeFixture)
            .filter((fixture) => fixture.status === "SCHEDULED")
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const recent = (recentData.response ?? [])
            .map(normalizeFixture)
            .filter((fixture) => fixture.status === "FINISHED")
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        renderFixtureGrid(upcomingTarget, upcoming, "There are no upcoming fixtures available for this season.");
        renderFixtureGrid(recentTarget, recent, "There are no completed results available for this season.");

        const upcomingCount = app.querySelector("[data-count='upcoming']");
        const recentCount = app.querySelector("[data-count='recent']");
        upcomingCount.textContent = `${upcoming.length} fixture${upcoming.length === 1 ? "" : "s"}`;
        recentCount.textContent = `${recent.length} result${recent.length === 1 ? "" : "s"}`;
    } catch (error) {
        upcomingTarget.innerHTML = `<div class="league-page__empty league-page__empty--inline"><span>API ERROR</span><h2>Could not load matches</h2><p>Please check your API key and try again.</p></div>`;
        recentTarget.innerHTML = `<div class="league-page__empty league-page__empty--inline"><span>API ERROR</span><h2>Could not load results</h2><p>Please check your API key and try again.</p></div>`;
    }
}

function createLeaguePage() {
    const app = document.querySelector("#app");
    const competition = getSelectedLeague();

    if (!app || !competition?.league) return;

    const currentSeason = competition.seasons?.find((season) => season.current === true) ?? competition.seasons?.[0];
    const status = currentSeason ? getLeagueStatus(currentSeason.start, currentSeason.end) : "Unknown";
    const isFavorite = getFavorites().includes(competition.league.id);

    app.innerHTML = `
        <section class="league-page">
            <button class="league-page__back" type="button"><span aria-hidden="true">←</span> Back to leagues</button>
            <header class="league-page__hero">
                <div class="league-page__hero-glow" aria-hidden="true"></div>
                <div class="league-page__logo"><img src="${competition.league.logo}" alt="${competition.league.name} logo"></div>
                <div class="league-page__identity">
                    <span class="league-page__eyebrow">FOOTBALL COMPETITION</span>
                    <h1>${competition.league.name}</h1>
                    <p>${competition.country?.name ?? "International"} <span>•</span> ${competition.league.type ?? "League"}</p>
                </div>
                <button class="league-page__favorite ${isFavorite ? "is-favorite" : ""}" type="button" aria-pressed="${isFavorite}">
                    <span aria-hidden="true">★</span><span>Favorite</span>
                </button>
            </header>

            <div class="league-page__meta">
                <div><span>SEASON</span><strong>${currentSeason?.year ?? "—"}</strong></div>
                <div><span>STATUS</span><strong class="league-page__status league-page__status--${status.toLowerCase()}"><i></i>${status}</strong></div>
                <div><span>START</span><strong>${currentSeason ? formatDate(currentSeason.start) : "—"}</strong></div>
                <div><span>END</span><strong>${currentSeason ? formatDate(currentSeason.end) : "—"}</strong></div>
            </div>

            <nav class="league-page__tabs" role="tablist" aria-label="League details">
                <button class="league-page__tab is-active" type="button" data-panel="overview">Overview</button>
                <button class="league-page__tab" type="button" data-panel="matches">Matches</button>
                <button class="league-page__tab" type="button" data-panel="table">Table</button>
                <button class="league-page__tab" type="button" data-panel="teams">Teams</button>
            </nav>

            <section class="league-page__content is-active" data-content="overview">
                <div class="league-page__section-heading">
                    <span>LEAGUE CENTER</span>
                    <h2>${competition.league.name}</h2>
                    <p>Follow the latest fixtures and results from this competition.</p>
                </div>
                <div class="league-page__overview-grid">
                    <article class="league-page__panel league-page__panel--featured"><span class="league-page__panel-label">UPCOMING</span><div class="league-page__panel-icon">→</div><h3>Upcoming matches</h3><p>Jump to the next fixtures from this competition.</p><button class="league-page__panel-link" type="button" data-jump="matches">View fixtures ↗</button></article>
                    <article class="league-page__panel"><span class="league-page__panel-label">RESULTS</span><div class="league-page__panel-icon">✓</div><h3>Recent results</h3><p>Review the latest completed matches and scores.</p><button class="league-page__panel-link" type="button" data-jump="matches">View results ↗</button></article>
                    <article class="league-page__panel"><span class="league-page__panel-label">STANDINGS</span><div class="league-page__panel-icon">#</div><h3>League table</h3><p>Track the teams competing for the top positions.</p><button class="league-page__panel-link" type="button" data-jump="table">Open table ↗</button></article>
                </div>
            </section>

            <section class="league-page__content" data-content="matches">
                <div class="league-page__section-heading"><span>FIXTURES</span><h2>League Matches</h2><p>Upcoming fixtures and the latest completed results.</p></div>
                <div class="league-page__fixture-section"><div class="league-page__fixture-heading"><h3>Upcoming</h3><span data-count="upcoming">Loading…</span></div><div class="league-page__fixture-grid" data-fixtures="upcoming"></div></div>
                <div class="league-page__fixture-section"><div class="league-page__fixture-heading"><h3>Recent Results</h3><span data-count="recent">Loading…</span></div><div class="league-page__fixture-grid" data-fixtures="recent"></div></div>
            </section>
            <section class="league-page__content" data-content="table"><div class="league-page__empty"><span>02</span><h2>League Table</h2><p>Standings data will be connected in the next step.</p></div></section>
            <section class="league-page__content" data-content="teams"><div class="league-page__empty"><span>03</span><h2>League Teams</h2><p>Team data will be connected in the next step.</p></div></section>
        </section>
    `;

    const activatePanel = (panel) => {
        app.querySelectorAll(".league-page__tab").forEach((item) => item.classList.toggle("is-active", item.dataset.panel === panel));
        app.querySelectorAll(".league-page__content").forEach((content) => content.classList.toggle("is-active", content.dataset.content === panel));
    };

    app.querySelector(".league-page__back").addEventListener("click", () => {
        sessionStorage.removeItem(SELECTED_LEAGUE_KEY);
        window.location.hash = "";
    });

    app.querySelector(".league-page__favorite").addEventListener("click", (event) => {
        const ids = getFavorites();
        const index = ids.indexOf(competition.league.id);
        if (index === -1) ids.push(competition.league.id);
        else ids.splice(index, 1);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
        const active = ids.includes(competition.league.id);
        event.currentTarget.classList.toggle("is-favorite", active);
        event.currentTarget.setAttribute("aria-pressed", String(active));
    });

    app.querySelectorAll(".league-page__tab").forEach((tab) => tab.addEventListener("click", () => activatePanel(tab.dataset.panel)));
    app.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => activatePanel(button.dataset.jump)));

    loadLeagueMatches(app, competition);
}

export default createLeaguePage;
