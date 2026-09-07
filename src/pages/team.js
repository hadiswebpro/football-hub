import { getTeam, getTeamFixtures, getTeamRecentFixtures } from "../api/team";
import createMatchCard from "../components/matchcard";

const SELECTED_TEAM_KEY = "football-hub-selected-team";
const FAVORITES_KEY = "football-hub-favorite-teams";

function getSelectedTeam() {
    try { return JSON.parse(sessionStorage.getItem(SELECTED_TEAM_KEY)); } catch { return null; }
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { return []; }
}

function toggleFavorite(id) {
    const ids = getFavorites();
    const index = ids.indexOf(id);
    if (index === -1) ids.push(id); else ids.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return ids.includes(id);
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

function renderMatches(container, fixtures, emptyText) {
    container.innerHTML = "";
    const matches = fixtures.map(normalizeFixture).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!matches.length) {
        container.innerHTML = `<div class="team-page__empty">${emptyText}</div>`;
        return;
    }
    matches.forEach((match) => container.appendChild(createMatchCard(match)));
}

function createTeamPage() {
    const app = document.querySelector("#app");
    const selected = getSelectedTeam();
    if (!app) return;

    if (!selected?.id) {
        app.innerHTML = `<div class="team-page__empty"><h2>Team not found</h2><p>Select a team from the Teams page.</p><button type="button" data-back>Back to Teams</button></div>`;
        app.querySelector("[data-back]").onclick = () => { window.location.hash = "#teams"; };
        return;
    }

    const favorite = getFavorites().includes(selected.id);
    app.innerHTML = `
        <section class="team-page">
            <button class="team-page__back" type="button" data-back>← Back to Teams</button>
            <div class="team-page__hero">
                <div class="team-page__identity">
                    <div class="team-page__logo"><img src="${selected.logo ?? ""}" alt="${selected.name ?? "Team"} logo"></div>
                    <div><span>CLUB PROFILE</span><h1>${selected.name ?? "Team"}</h1><p>${selected.country ?? "International"}${selected.league ? ` · ${selected.league}` : ""}</p></div>
                </div>
                <button class="team-page__favorite ${favorite ? "is-favorite" : ""}" type="button" data-favorite aria-pressed="${favorite}">${favorite ? "★ Favorited" : "☆ Favorite"}</button>
            </div>
            <div class="team-page__stats" data-stats><div><span>COUNTRY</span><strong>Loading…</strong></div><div><span>TEAM ID</span><strong>#${selected.id}</strong></div><div><span>TYPE</span><strong>Club</strong></div></div>
            <section class="team-page__section">
                <div class="team-page__heading"><span>MATCH CENTER</span><h2>Team Matches</h2><p>Upcoming fixtures and recent results for this club.</p></div>
                <div class="team-page__tabs"><button class="is-active" data-view="upcoming" type="button">Upcoming</button><button data-view="recent" type="button">Recent Results</button></div>
                <div class="team-page__matches" data-upcoming>Loading matches…</div>
                <div class="team-page__matches" data-recent hidden>Loading results…</div>
            </section>
        </section>
    `;

    app.querySelector("[data-back]").onclick = () => { sessionStorage.removeItem(SELECTED_TEAM_KEY); window.location.hash = "#teams"; };
    app.querySelector("[data-favorite]").onclick = (event) => {
        const active = toggleFavorite(selected.id);
        event.currentTarget.classList.toggle("is-favorite", active);
        event.currentTarget.textContent = active ? "★ Favorited" : "☆ Favorite";
        event.currentTarget.setAttribute("aria-pressed", String(active));
    };

    app.querySelectorAll("[data-view]").forEach((button) => {
        button.onclick = () => {
            const recent = button.dataset.view === "recent";
            app.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("is-active", item === button));
            app.querySelector("[data-upcoming]").hidden = recent;
            app.querySelector("[data-recent]").hidden = !recent;
        };
    });

    (async () => {
        try {
            const data = await getTeam(selected.id);
            const team = data.response?.[0]?.team ?? selected;
            app.querySelector("[data-stats]").innerHTML = `<div><span>COUNTRY</span><strong>${team.country ?? "International"}</strong></div><div><span>TEAM ID</span><strong>#${team.id ?? selected.id}</strong></div><div><span>TYPE</span><strong>${team.national ? "National" : "Club"}</strong></div>`;
        } catch {
            app.querySelector("[data-stats]").innerHTML = `<div><span>STATUS</span><strong>API unavailable</strong></div>`;
        }

        try {
            const season = new Date().getFullYear();
            const [upcomingData, recentData] = await Promise.all([
                getTeamFixtures(selected.id, season, 12),
                getTeamRecentFixtures(selected.id, season, 12)
            ]);
            const finished = ["FT", "AET", "PEN"];
            renderMatches(app.querySelector("[data-upcoming]"), (upcomingData.response ?? []).filter((item) => !finished.includes(item.fixture?.status?.short)), "No upcoming matches found.");
            renderMatches(app.querySelector("[data-recent]"), (recentData.response ?? []).filter((item) => finished.includes(item.fixture?.status?.short)).reverse(), "No recent results found.");
        } catch {
            app.querySelector("[data-upcoming]").innerHTML = `<div class="team-page__empty">Could not load team matches. Please check your API key.</div>`;
            app.querySelector("[data-recent]").innerHTML = `<div class="team-page__empty">Could not load team results. Please check your API key.</div>`;
        }
    })();
}

export default createTeamPage;
