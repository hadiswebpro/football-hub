import createTeamCard from "../components/teamCard";
import { getLeagueTeams, getNationalTeams } from "../api/teams";
import { getCurrentLeagues } from "../api/seasons";

const POPULAR_LEAGUES = [2, 39, 140, 135, 78, 61, 3, 848, 4, 88, 94, 71, 144, 203, 179, 207, 119, 169, 62, 128, 218, 103, 106, 113, 72, 98, 108, 233, 36, 40];
const POPULAR_TEAMS = [
    "Real Madrid", "Barcelona", "Manchester City", "Manchester United", "Liverpool", "Arsenal",
    "Bayern Munich", "Paris Saint Germain", "Chelsea", "Inter", "AC Milan", "Juventus",
    "Atletico Madrid", "Borussia Dortmund", "Tottenham", "Napoli", "Ajax", "Benfica", "Porto"
];
const POPULAR_NATIONAL_TEAMS = [
    "Brazil", "Argentina", "France", "Spain", "England", "Germany", "Portugal",
    "Italy", "Netherlands", "Belgium", "Croatia", "Uruguay", "Colombia", "Mexico",
    "United States", "Japan", "Morocco", "Iran"
];
const CACHE_KEY = "football-hub-teams-cache-v3";
const CACHE_TTL = 1000 * 60 * 60;

function getPriority(name, list) {
    const index = list.findIndex((item) => item.toLowerCase() === String(name ?? "").toLowerCase());
    return index === -1 ? 999 : index;
}

function getLeaguePriority(id) {
    const index = POPULAR_LEAGUES.indexOf(Number(id));
    return index === -1 ? 999 : index;
}

function sortTeams(a, b) {
    const aNational = String(a.type ?? "").toLowerCase() === "national";
    const bNational = String(b.type ?? "").toLowerCase() === "national";
    const aPriority = getPriority(a.name, POPULAR_TEAMS);
    const bPriority = getPriority(b.name, POPULAR_TEAMS);
    const aNationalPriority = getPriority(a.name, POPULAR_NATIONAL_TEAMS);
    const bNationalPriority = getPriority(b.name, POPULAR_NATIONAL_TEAMS);

    // Put the most recognizable teams first, while keeping national teams in the same directory.
    const aScore = Math.min(aPriority, 40 + aNationalPriority);
    const bScore = Math.min(bPriority, 40 + bNationalPriority);

    return aScore - bScore
        || Number(bNational) - Number(aNational)
        || getLeaguePriority(a.leagueId) - getLeaguePriority(b.leagueId)
        || String(a.name).localeCompare(String(b.name));
}

function readCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached?.time && Date.now() - cached.time < CACHE_TTL && Array.isArray(cached.data)) return cached.data;
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
    const selectedLeagues = currentLeagues.filter(
        (item) => item.league?.id && item.seasons?.some((season) => season.current)
    );

    const leagueResults = await Promise.allSettled(selectedLeagues.map(async (competition) => {
        const season = competition.seasons.find((item) => item.current)?.year;
        const data = await getLeagueTeams(competition.league.id, season);
        return { data, competition, season };
    }));

    let nationalResponse = [];
    try {
        nationalResponse = (await getNationalTeams()).response ?? [];
    } catch {
        // Keep club teams available if the provider rejects the national-team query.
    }

    const teams = [];
    const ids = new Set();

    leagueResults.forEach((result) => {
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
                logo: team.logo ?? "",
                type: team.national ? "national" : "club"
            });
        });
    });

    nationalResponse.forEach(({ team }) => {
        if (!team?.id || ids.has(team.id)) return;
        ids.add(team.id);
        teams.push({
            id: team.id,
            name: team.name,
            country: team.country ?? team.name ?? "International",
            league: "National Team",
            leagueId: 0,
            season: null,
            logo: team.logo ?? "",
            type: "national"
        });
    });

    const sorted = teams.sort(sortTeams);
    saveCache(sorted);
    return sorted;
}

function createTeamsPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `<section class="directory-page">
        <div class="directory-page__top">
            <div class="directory-page__intro">
                <span class="section-heading__eyebrow">TEAM DIRECTORY</span>
                <h1>Teams</h1>
                <p>National teams and clubs, with the most recognizable teams shown first.</p>
            </div>
            <input class="directory-page__search" type="search" placeholder="Search teams…" aria-label="Search teams" data-team-search disabled>
        </div>
        <div class="directory-page__content">
            <div class="directory-page__status" data-team-status>Loading teams…</div>
            <div class="teams directory-page__team-grid" data-teams></div>
        </div>
    </section>`;

    const target = app.querySelector("[data-teams]");
    const search = app.querySelector("[data-team-search]");
    const status = app.querySelector("[data-team-status]");
    let teams = [];

    const render = (query = "") => {
        const q = query.trim().toLowerCase();
        const filtered = q
            ? teams.filter((team) => [team.name, team.country, team.league].filter(Boolean).join(" ").toLowerCase().includes(q))
            : teams;

        target.innerHTML = "";
        status.textContent = q ? `${filtered.length} teams found` : `${teams.length} teams`;

        if (!filtered.length) {
            target.innerHTML = `<div class="directory-page__empty"><div><h2>No teams found</h2><p>Try another team, country or league.</p></div></div>`;
            return;
        }

        filtered.forEach((team) => target.appendChild(createTeamCard(team)));
    };

    const runSearch = (query) => {
        const q = query.trim().toLowerCase();

        if (!q) {
            render("");
            return;
        }

        const filteredTeams = teams.filter((team) => {
            const searchableText = [
                team.name,
                team.country,
                team.league
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(q);
        });

        renderLocalResults(q, filteredTeams);
    };

    search.addEventListener("input", (event) => {
        runSearch(event.target.value);
    });

    const load = async () => {
        target.innerHTML = `<div class="team-loader" aria-hidden="true"><span class="loader-spinner"></span><span>Loading teams…</span></div>`;
        status.textContent = "Loading teams…";
        search.disabled = true;

        try {
            teams = await getAllTeams();
            if (!teams.length) throw new Error("No teams returned");
            search.disabled = false;
            render(search.value);
        } catch {
            status.textContent = "Unable to load teams";
            target.innerHTML = `<div class="directory-page__empty"><div><h2>Could not load teams</h2><p>Please check your API key or connection and try again.</p><button class="ui-state__retry" type="button" data-team-retry>Retry</button></div></div>`;
            target.querySelector("[data-team-retry]")?.addEventListener("click", load);
        }
    };

    load();
}

function renderTeamSkeletons(count = 9) {
    return Array.from({ length: count }, () => `
        <article class="skeleton-card skeleton-card--team" aria-hidden="true">
            <div class="skeleton-card__top">
                <span class="skeleton skeleton--text skeleton--short"></span>
                <span class="skeleton skeleton--circle"></span>
            </div>
            <div class="skeleton-card__body">
                <span class="skeleton skeleton--logo"></span>
                <span class="skeleton skeleton--title skeleton--short"></span>
                <span class="skeleton skeleton--text skeleton--short"></span>
            </div>
            <div class="skeleton-card__footer">
                <span class="skeleton skeleton--text skeleton--short"></span>
                <span class="skeleton skeleton--text" style="width:28px"></span>
            </div>
        </article>`).join("");
}

export default createTeamsPage;
