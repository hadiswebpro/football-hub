import { searchTeams, searchLeagues, searchMatches } from "../api/search";
import createTeamCard from "../components/teamCard";
import createLeagueCard from "../components/leagueCard";
import createMatchCard from "../components/matchcard";

function getDate(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeMatch(item) {
    return {
        id: item.fixture?.id,
        league: item.league?.name ?? "Football",
        leagueLogo: item.league?.logo ?? "",
        date: item.fixture?.date,
        timestamp: item.fixture?.timestamp,
        status: item.fixture?.status?.short ?? "NS",
        statusLong: item.fixture?.status?.long ?? "Scheduled",
        elapsed: item.fixture?.status?.elapsed,
        home: { id: item.teams?.home?.id, name: item.teams?.home?.name ?? "Home", logo: item.teams?.home?.logo ?? "" },
        away: { id: item.teams?.away?.id, name: item.teams?.away?.name ?? "Away", logo: item.teams?.away?.logo ?? "" },
        goals: { home: item.goals?.home, away: item.goals?.away }
    };
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function createSearchPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
    const query = params.get("q")?.trim() ?? "";

    app.innerHTML = `
        <section class="search-page">
            <button class="search-page__back" type="button" data-back>← Back</button>
            <div class="search-page__hero">
                <span class="section-heading__eyebrow">GLOBAL SEARCH</span>
                <h1>Search results</h1>
                <p>${query ? `Results for <strong>${escapeHtml(query)}</strong>` : "Search across teams, leagues and matches."}</p>
            </div>
            <div class="search-page__section" data-search-section="teams">
                <div class="search-page__heading"><h2>Teams</h2><span data-search-count="teams"></span></div>
                <div class="teams search-page__grid" data-search-teams><div class="search-page__loading">Searching teams…</div></div>
            </div>
            <div class="search-page__section" data-search-section="leagues">
                <div class="search-page__heading"><h2>Leagues</h2><span data-search-count="leagues"></span></div>
                <div class="leagues search-page__grid" data-search-leagues><div class="search-page__loading">Searching leagues…</div></div>
            </div>
            <div class="search-page__section" data-search-section="matches">
                <div class="search-page__heading"><h2>Matches</h2><span data-search-count="matches"></span></div>
                <div class="search-page__match-grid" data-search-matches><div class="search-page__loading">Searching matches…</div></div>
            </div>
        </section>
    `;

    app.querySelector("[data-back]").addEventListener("click", () => {
        window.location.hash = "#home";
    });

    if (!query) {
        app.querySelectorAll("[data-search-section]").forEach((section) => {
            section.querySelector("[class$='grid']")?.replaceChildren();
            const message = document.createElement("div");
            message.className = "search-page__empty";
            message.innerHTML = "<h3>Start searching</h3><p>Enter a team, league or match name in the header search.</p>";
            section.querySelector("[class$='grid']")?.appendChild(message);
        });
        return;
    }

    const renderEmpty = (target, title, text) => {
        target.innerHTML = `<div class="search-page__empty"><h3>${title}</h3><p>${text}</p></div>`;
    };

    Promise.allSettled([
        searchTeams(query),
        searchLeagues(query),
        searchMatches(getDate(-1), getDate(1))
    ]).then(([teamsResult, leaguesResult, matchesResult]) => {
        const teamsTarget = app.querySelector("[data-search-teams]");
        const leaguesTarget = app.querySelector("[data-search-leagues]");
        const matchesTarget = app.querySelector("[data-search-matches]");

        if (teamsResult.status === "fulfilled") {
            const teams = teamsResult.value.map(({ team, league }) => ({ id: team?.id, name: team?.name ?? "Team", country: team?.country ?? "International", league: league?.name ?? "", logo: team?.logo ?? "" })).filter((team) => team.id);
            app.querySelector('[data-search-count="teams"]').textContent = `${teams.length} found`;
            teamsTarget.innerHTML = "";
            if (!teams.length) renderEmpty(teamsTarget, "No teams found", "Try another team name.");
            else teams.forEach((team) => teamsTarget.appendChild(createTeamCard(team)));
        } else renderEmpty(teamsTarget, "Could not search teams", "Please check your API key and try again.");

        if (leaguesResult.status === "fulfilled") {
            const leagues = leaguesResult.value;
            app.querySelector('[data-search-count="leagues"]').textContent = `${leagues.length} found`;
            leaguesTarget.innerHTML = "";
            if (!leagues.length) renderEmpty(leaguesTarget, "No leagues found", "Try another league name.");
            else leagues.forEach((league) => leaguesTarget.appendChild(createLeagueCard(league)));
        } else renderEmpty(leaguesTarget, "Could not search leagues", "Please check your API key and try again.");

        if (matchesResult.status === "fulfilled") {
            const matches = matchesResult.value.map(normalizeMatch).filter((match) => `${match.home.name} ${match.away.name} ${match.league}`.toLowerCase().includes(query.toLowerCase()));
            app.querySelector('[data-search-count="matches"]').textContent = `${matches.length} found`;
            matchesTarget.innerHTML = "";
            if (!matches.length) renderEmpty(matchesTarget, "No matches found", "Try a team or league name that appears in a match.");
            else matches.forEach((match) => matchesTarget.appendChild(createMatchCard(match)));
        } else renderEmpty(matchesTarget, "Could not search matches", "Please check your API key and try again.");
    });
}

export default createSearchPage;
