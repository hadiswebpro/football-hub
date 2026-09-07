import createTeamCard from "../components/teamCard";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = "";
const CURRENT_SEASON = new Date().getFullYear();
const FEATURED_LEAGUES = [39, 140, 78, 135, 61, 2, 3, 4];

async function getLeagueTeams(leagueId, season) {
    const response = await fetch(`${API_BASE}/teams?league=${leagueId}&season=${season}`, {
        headers: { "x-apisports-key": API_KEY }
    });
    if (!response.ok) throw new Error(`Football API request failed: ${response.status}`);
    const data = await response.json();
    if (data.errors && Object.keys(data.errors).length > 0) throw new Error("Football API returned an error.");
    return data.response ?? [];
}

async function getAllTeams() {
    const results = await Promise.all(FEATURED_LEAGUES.map((leagueId) => getLeagueTeams(leagueId, CURRENT_SEASON)));
    const teamsById = new Map();

    results.flat().forEach(({ team, league }) => {
        if (!team?.id || teamsById.has(team.id)) return;
        teamsById.set(team.id, {
            id: team.id,
            name: team.name ?? "Team",
            country: team.country ?? "International",
            league: league?.name ?? "Football",
            logo: team.logo ?? ""
        });
    });

    return [...teamsById.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function createTeamsPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `
        <section class="directory-page">
            <div class="directory-page__top">
                <div><span class="section-heading__eyebrow">CLUB DIRECTORY</span><h1>Teams</h1><p>Browse all teams from the competitions currently available in Football Hub.</p></div>
                <input class="directory-page__search" type="search" placeholder="Search teams…" aria-label="Search teams" data-team-search disabled>
            </div>
            <div class="directory-page__content">
                <div class="directory-page__status" data-team-status>Loading all teams…</div>
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

        filtered.forEach((team) => target.appendChild(createTeamCard(team)));
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
            target.innerHTML = `<div class="directory-page__empty"><h2>Could not load teams</h2><p>Please check your API key and try again.</p></div>`;
        });
}

export default createTeamsPage;
