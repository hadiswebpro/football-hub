import createTeamCard from "../components/teamCard";
import { getLeagueTeams } from "../api/teams";

const CURRENT_SEASON = new Date().getFullYear();
const FEATURED_LEAGUES = [39, 140, 78, 135, 61, 2, 3, 4];

async function getAllTeams() {
    const results = await Promise.allSettled(
        FEATURED_LEAGUES.map((leagueId) => getLeagueTeams(leagueId, CURRENT_SEASON))
    );

    const teamsById = new Map();

    results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        (result.value?.response ?? []).forEach(({ team, league }) => {
            if (!team?.id || teamsById.has(team.id)) return;
            teamsById.set(team.id, {
                id: team.id,
                name: team.name ?? "Team",
                country: team.country ?? "International",
                league: league?.name ?? "Football",
                logo: team.logo ?? ""
            });
        });
    });

    if (!teamsById.size) throw new Error("No teams could be loaded.");
    return [...teamsById.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function createTeamsPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `
        <section class="directory-page">
            <div class="directory-page__top">
                <div class="directory-page__intro">
                    <span class="section-heading__eyebrow">CLUB DIRECTORY</span>
                    <h1>Teams</h1>
                    <p>Browse clubs from the competitions currently available in Football Hub.</p>
                </div>
                <input class="directory-page__search" type="search" placeholder="Search teams…" aria-label="Search teams" data-team-search disabled>
            </div>
            <div class="directory-page__content">
                <div class="directory-page__status" data-team-status>Loading teams…</div>
                <div class="teams directory-page__team-grid" data-teams></div>
            </div>
        </section>
    `;

    const target = app.querySelector("[data-teams]");
    const search = app.querySelector("[data-team-search]");
    const status = app.querySelector("[data-team-status]");
    let teams = [];

    const render = (query = "") => {
        const normalized = query.trim().toLowerCase();
        const filtered = teams.filter((team) => `${team.name} ${team.country} ${team.league}`.toLowerCase().includes(normalized));
        target.innerHTML = "";
        status.textContent = normalized ? `${filtered.length} teams found` : `${teams.length} teams`;

        if (!filtered.length) {
            target.innerHTML = `<div class="directory-page__empty"><h2>No teams found</h2><p>Try another team, country or league.</p></div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        filtered.forEach((team) => fragment.appendChild(createTeamCard(team)));
        target.appendChild(fragment);
    };

    search.addEventListener("input", (event) => render(event.target.value));

    getAllTeams()
        .then((loadedTeams) => {
            teams = loadedTeams;
            search.disabled = false;
            render();
        })
        .catch(() => {
            status.textContent = "Unable to load teams";
            target.innerHTML = `<div class="directory-page__empty"><h2>Could not load teams</h2><p>No team data was returned from the available competitions.</p></div>`;
        });
}

export default createTeamsPage;
