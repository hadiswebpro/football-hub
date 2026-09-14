import createTeamCard from "../components/teamCard";
import { getLeagueTeams } from "../api/teams";
import { getCurrentLeagues } from "../api/seasons";

const POPULAR_LEAGUES = [39, 140, 78, 135, 61, 2, 3, 848, 4];

function getLeaguePriority(id) {
    const index = POPULAR_LEAGUES.indexOf(Number(id));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

async function getAllTeams() {
    const currentLeagues = await getCurrentLeagues();
    const featured = [...currentLeagues].sort((a, b) => getLeaguePriority(a.league.id) - getLeaguePriority(b.league.id) || (a.league.name ?? "").localeCompare(b.league.name ?? ""));
    const results = await Promise.allSettled(featured.map((competition) => {
        const season = competition.seasons.find((item) => item.current === true)?.year;
        return season ? getLeagueTeams(competition.league.id, season).then((data) => ({ data, competition, season })) : Promise.reject(new Error("No current season"));
    }));
    const teamsById = new Map();
    results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { data, competition, season } = result.value;
        (data.response ?? []).forEach(({ team }) => {
            if (!team?.id || teamsById.has(team.id)) return;
            teamsById.set(team.id, {
                id: team.id,
                name: team.name ?? "Team",
                country: team.country ?? competition.country?.name ?? "International",
                league: competition.league?.name ?? "Football",
                leagueId: competition.league?.id,
                season,
                logo: team.logo ?? ""
            });
        });
    });
    if (!teamsById.size) throw new Error("No teams could be loaded.");
    return [...teamsById.values()].sort((a, b) => getLeaguePriority(a.leagueId) - getLeaguePriority(b.leagueId) || a.name.localeCompare(b.name));
}

function createTeamsPage() {
    const app = document.querySelector("#app");
    if (!app) return;
    app.innerHTML = `<section class="directory-page"><div class="directory-page__top"><div class="directory-page__intro"><span class="section-heading__eyebrow">CLUB DIRECTORY</span><h1>Teams</h1><p>Browse clubs from competitions currently in progress.</p></div><input class="directory-page__search" type="search" placeholder="Search teams…" aria-label="Search teams" data-team-search disabled></div><div class="directory-page__content"><div class="directory-page__status" data-team-status>Loading teams…</div><div class="teams directory-page__team-grid" data-teams></div></div></section>`;
    const target = app.querySelector("[data-teams]"), search = app.querySelector("[data-team-search]"), status = app.querySelector("[data-team-status]");
    let teams = [];
    const render = (query = "") => {
        const normalized = query.trim().toLowerCase();
        const filtered = teams.filter((team) => `${team.name} ${team.country} ${team.league}`.toLowerCase().includes(normalized));
        target.innerHTML = "";
        status.textContent = normalized ? `${filtered.length} teams found` : `${teams.length} teams`;
        if (!filtered.length) { target.innerHTML = `<div class="directory-page__empty"><h2>No teams found</h2><p>Try another team, country or league.</p></div>`; return; }
        const fragment = document.createDocumentFragment();
        filtered.forEach((team) => fragment.appendChild(createTeamCard(team)));
        target.appendChild(fragment);
    };
    search.addEventListener("input", (event) => render(event.target.value));
    getAllTeams().then((loadedTeams) => { teams = loadedTeams; search.disabled = false; render(); }).catch(() => { status.textContent = "Unable to load teams"; target.innerHTML = `<div class="directory-page__empty"><h2>Could not load teams</h2><p>No current team data was returned from the available competitions.</p></div>`; });
}

export default createTeamsPage;
