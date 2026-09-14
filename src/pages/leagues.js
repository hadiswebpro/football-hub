import { getCurrentLeagues } from "../api/seasons";
import createLeagueCard from "../components/leagueCard";

const IMPORTANT_LEAGUES = [2, 39, 140, 135, 78, 61, 3, 848, 4];

function getLeagueSortIndex(league) {
    const id = league.league?.id;
    const index = IMPORTANT_LEAGUES.indexOf(Number(id));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function createLeaguesPage() {
    const app = document.querySelector("#app");
    if (!app) return;
    app.innerHTML = `<section class="directory-page"><div class="directory-page__top"><div><span class="section-heading__eyebrow">COMPETITION DIRECTORY</span><h1>Leagues</h1><p>Browse competitions currently in progress.</p></div><input class="directory-page__search" type="search" placeholder="Search leagues…" aria-label="Search leagues" data-league-search disabled></div><div class="directory-page__content"><div class="directory-page__status" data-league-status>Loading leagues…</div><div class="leagues directory-page__grid" data-leagues></div></div></section>`;
    const target = app.querySelector("[data-leagues]"), search = app.querySelector("[data-league-search]"), status = app.querySelector("[data-league-status]");
    let leagues = [];
    const render = (query = "") => {
        const normalized = query.trim().toLowerCase();
        const filtered = leagues.filter((competition) => `${competition.league?.name ?? ""} ${competition.country?.name ?? ""}`.toLowerCase().includes(normalized));
        target.innerHTML = "";
        status.textContent = normalized ? `${filtered.length} leagues found` : `${leagues.length} leagues`;
        if (!filtered.length) { target.innerHTML = `<div class="directory-page__empty"><h2>No leagues found</h2><p>Try another league or country.</p></div>`; return; }
        filtered.forEach((competition) => target.appendChild(createLeagueCard(competition)));
    };
    search.addEventListener("input", (event) => render(event.target.value));
    getCurrentLeagues().then((data) => {
        leagues = [...data].sort((a, b) => getLeagueSortIndex(a) - getLeagueSortIndex(b) || (a.league?.name ?? "").localeCompare(b.league?.name ?? ""));
        search.disabled = false;
        render();
    }).catch(() => { status.textContent = "Unable to load leagues"; target.innerHTML = `<div class="directory-page__empty"><h2>Could not load leagues</h2><p>Please check your API key and try again.</p></div>`; });
}

export default createLeaguesPage;
