import { getCurrentLeagues } from "../api/seasons";
import createLeagueCard from "../components/leagueCard";
const IMPORTANT_LEAGUES = [2, 39, 140, 135, 78, 61, 3, 848, 4];

function getLeagueSortIndex(league) {
    const id = league.league?.id;
    const index = IMPORTANT_LEAGUES.indexOf(Number(id));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function createLeagueSkeletons(count = 6) {
    return Array.from({ length: count }, () => `
        <article class="skeleton-card" aria-hidden="true">
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
        </article>
    `).join("");
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
        if (!filtered.length) { target.innerHTML = `<div class="directory-page__empty"><div><h2>No leagues found</h2><p>Try another league or country.</p></div></div>`; return; }
        filtered.forEach((competition) => target.appendChild(createLeagueCard(competition)));
    };
    const load = async () => {
        target.innerHTML = `<div class="directory-loader directory-loader--page" aria-live="polite"><span class="loader-spinner"></span><span>Loading leagues…</span></div>`;
        status.textContent = "";
        search.disabled = true;

        let timedOut = false;
        let errorTimer;

        try {
            errorTimer = window.setTimeout(() => {
                timedOut = true;
                target.innerHTML = `<div class="directory-loader directory-loader--error" role="alert"><strong>Could not load</strong><span>Check your internet connection.</span></div>`;
            }, 15000);

            const data = await getCurrentLeagues();
            leagues = [...data].sort((a, b) => getLeagueSortIndex(a) - getLeagueSortIndex(b) || (a.league?.name ?? "").localeCompare(b.league?.name ?? ""));
            if (!leagues.length) throw new Error("No leagues returned");

            window.clearTimeout(errorTimer);
            if (timedOut) return;

            search.disabled = false;
            render(search.value);
        } catch {
            window.clearTimeout(errorTimer);
            if (timedOut) return;

            target.innerHTML = `<div class="directory-loader directory-loader--error" role="alert"><strong>Could not load</strong><span>Check your internet connection.</span></div>`;
        }
    };
    search.addEventListener("input", (event) => render(event.target.value));
    load();
}

export default createLeaguesPage;
