import createTeamCard from "../components/teamCard";
import { getLeagueTeams } from "../api/teams";
import { getCurrentLeagues } from "../api/seasons";

const POPULAR_LEAGUES = [2, 39, 3, 848, 140, 78, 135, 61, 4];
const CACHE_KEY = "football-hub-teams-cache";
const CACHE_TTL = 1000 * 60 * 60;

function getLeaguePriority(id) {
    const index = POPULAR_LEAGUES.indexOf(Number(id));
    return index === -1 ? 999 : index;
}

function readCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached?.time && Date.now() - cached.time < CACHE_TTL) return cached.data;
    } catch {}
    return null;
}

function saveCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data })); } catch {}
}

async function getAllTeams() {
    const cached = readCache();
    if (cached?.length) return cached;

    const currentLeagues = await getCurrentLeagues();
    const competitions = [...currentLeagues].sort((a, b) =>
        getLeaguePriority(a.league.id) - getLeaguePriority(b.league.id)
    );

    const results = await Promise.allSettled(
        competitions.map(async (competition) => {
            const season = competition.seasons.find((item) => item.current)?.year;
            if (!season) throw new Error("No season");
            const data = await getLeagueTeams(competition.league.id, season);
            return { data, competition, season };
        })
    );

    const teams = [];
    const ids = new Set();

    results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { data, competition, season } = result.value;
        (data.response ?? []).forEach(({ team }) => {
            if (!team?.id || ids.has(team.id)) return;
            ids.add(team.id);
            teams.push({
                id: team.id,
                name: team.name,
                country: team.country ?? competition.country?.name ?? "International",
                league: competition.league.name,
                leagueId: competition.league.id,
                season,
                logo: team.logo ?? ""
            });
        });
    });

    const sorted = teams.sort((a, b) =>
        getLeaguePriority(a.leagueId) - getLeaguePriority(b.leagueId) ||
        a.name.localeCompare(b.name)
    );

    saveCache(sorted);
    return sorted;
}

function createTeamsPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `<section class="directory-page"><div class="directory-page__top"><div class="directory-page__intro"><span class="section-heading__eyebrow">CLUB DIRECTORY</span><h1>Teams</h1><p>Popular clubs first, then other active teams.</p></div><input class="directory-page__search" type="search" placeholder="Search teams…" aria-label="Search teams" data-team-search disabled></div><div class="directory-page__content"><div class="directory-page__status" data-team-status>Loading teams…</div><div class="teams directory-page__team-grid" data-teams></div></div></section>`;

    const target = app.querySelector("[data-teams]");
    const search = app.querySelector("[data-team-search]");
    const status = app.querySelector("[data-team-status]");
    let teams = [];

    const render = (query = "") => {
        const q = query.toLowerCase().trim();
        const filtered = teams.filter((team) => `${team.name} ${team.country} ${team.league}`.toLowerCase().includes(q));
        target.innerHTML = "";
        status.textContent = q ? `${filtered.length} teams found` : `${teams.length} teams`;
        filtered.forEach((team) => target.appendChild(createTeamCard(team)));
    };

    search.addEventListener("input", (e) => render(e.target.value));

    getAllTeams()
        .then((data) => {
            teams = data;
            search.disabled = false;
            render();
        })
        .catch(() => {
            status.textContent = "Unable to load teams";
            target.innerHTML = `<div class="directory-page__empty"><h2>Could not load teams</h2><p>No team data was returned.</p></div>`;
        });
}

export default createTeamsPage;
