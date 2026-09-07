import { formatDate, getLeagueStatus } from "../utils/date";

const SELECTED_LEAGUE_KEY = "football-hub-selected-league";

function getSelectedLeague() {
    try {
        return JSON.parse(sessionStorage.getItem(SELECTED_LEAGUE_KEY));
    } catch {
        return null;
    }
}

function createLeaguePage() {
    const app = document.querySelector("#app");
    const competition = getSelectedLeague();

    if (!app || !competition?.league) return;

    const currentSeason = competition.seasons?.find((season) => season.current === true)
        ?? competition.seasons?.[0];
    const status = currentSeason
        ? getLeagueStatus(currentSeason.start, currentSeason.end)
        : "Unknown";
    const favoriteIds = JSON.parse(localStorage.getItem("football-hub-favorite-leagues") || "[]");
    const isFavorite = favoriteIds.includes(competition.league.id);

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
                    <p>Your competition dashboard is ready. Match, table and team data will be connected next.</p>
                </div>
                <div class="league-page__overview-grid">
                    <article class="league-page__panel league-page__panel--featured"><span class="league-page__panel-label">UPCOMING</span><div class="league-page__panel-icon">→</div><h3>Upcoming matches</h3><p>See the next fixtures from this competition.</p><span class="league-page__coming">Coming next</span></article>
                    <article class="league-page__panel"><span class="league-page__panel-label">RESULTS</span><div class="league-page__panel-icon">✓</div><h3>Recent results</h3><p>Review the latest completed matches and scores.</p><span class="league-page__coming">Coming next</span></article>
                    <article class="league-page__panel"><span class="league-page__panel-label">STANDINGS</span><div class="league-page__panel-icon">#</div><h3>Table summary</h3><p>Track the teams competing for the top positions.</p><span class="league-page__coming">Coming next</span></article>
                </div>
            </section>

            <section class="league-page__content" data-content="matches"><div class="league-page__empty"><span>01</span><h2>League Matches</h2><p>Fixture data will be connected here in the next step.</p></div></section>
            <section class="league-page__content" data-content="table"><div class="league-page__empty"><span>02</span><h2>League Table</h2><p>Standings data will be connected here in the next step.</p></div></section>
            <section class="league-page__content" data-content="teams"><div class="league-page__empty"><span>03</span><h2>League Teams</h2><p>Team data will be connected here in the next step.</p></div></section>
        </section>
    `;

    app.querySelector(".league-page__back").addEventListener("click", () => {
        sessionStorage.removeItem(SELECTED_LEAGUE_KEY);
        window.location.hash = "";
    });

    const favoriteButton = app.querySelector(".league-page__favorite");
    favoriteButton.addEventListener("click", () => {
        const ids = JSON.parse(localStorage.getItem("football-hub-favorite-leagues") || "[]");
        const index = ids.indexOf(competition.league.id);
        if (index === -1) ids.push(competition.league.id);
        else ids.splice(index, 1);
        localStorage.setItem("football-hub-favorite-leagues", JSON.stringify(ids));
        const active = ids.includes(competition.league.id);
        favoriteButton.classList.toggle("is-favorite", active);
        favoriteButton.setAttribute("aria-pressed", String(active));
    });

    app.querySelectorAll(".league-page__tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            const panel = tab.dataset.panel;
            app.querySelectorAll(".league-page__tab").forEach((item) => item.classList.toggle("is-active", item === tab));
            app.querySelectorAll(".league-page__content").forEach((content) => content.classList.toggle("is-active", content.dataset.content === panel));
        });
    });
}

export default createLeaguePage;
