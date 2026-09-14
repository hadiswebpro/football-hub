import { getMatchesByDate } from "../api/matches";
import createMatchCard from "../components/matchcard";

const TEHRAN_TIMEZONE = "Asia/Tehran";

function getTehranDate(offset = 0) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TEHRAN_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const values = Object.fromEntries(parts.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
    const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + offset));
    return date.toISOString().slice(0, 10);
}

function normalizeFixture(fixture) {
    const status = fixture.fixture?.status?.short;
    const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];
    const finishedStatuses = ["FT", "AET", "PEN"];
    const isLive = liveStatuses.includes(status);
    const isFinished = finishedStatuses.includes(status);
    return { fixtureId: fixture.fixture?.id, leagueId: fixture.league?.id, league: fixture.league?.name ?? "Football", leagueLogo: fixture.league?.logo ?? "", country: fixture.league?.country ?? "International", status: isLive ? "LIVE" : isFinished ? "FINISHED" : "SCHEDULED", minute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "", time: isLive ? "Live now" : new Date(fixture.fixture?.date).toLocaleTimeString("en-GB", { timeZone: TEHRAN_TIMEZONE, hour: "2-digit", minute: "2-digit" }), date: fixture.fixture?.date ?? "", home: { id: fixture.teams?.home?.id, name: fixture.teams?.home?.name ?? "Home", score: fixture.goals?.home ?? null, logo: fixture.teams?.home?.logo ?? "" }, away: { id: fixture.teams?.away?.id, name: fixture.teams?.away?.name ?? "Away", score: fixture.goals?.away ?? null, logo: fixture.teams?.away?.logo ?? "" } };
}

function getLeaguePriority(id) {
    const order = [2, 39, 140, 135, 78, 61, 3, 848, 4];
    const index = order.indexOf(Number(id));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function groupByLeague(fixtures) {
    const groups = new Map();
    fixtures.map(normalizeFixture).sort((a, b) => getLeaguePriority(a.leagueId) - getLeaguePriority(b.leagueId) || new Date(a.date) - new Date(b.date)).forEach((match) => {
        const key = match.leagueId ?? match.league;
        if (!groups.has(key)) groups.set(key, { id: key, name: match.league, logo: match.leagueLogo, country: match.country, matches: [] });
        groups.get(key).matches.push(match);
    });
    return [...groups.values()].sort((a, b) => getLeaguePriority(a.id) - getLeaguePriority(b.id) || a.name.localeCompare(b.name));
}

function renderLeagueGroups(container, fixtures, query = "") {
    container.innerHTML = "";
    const normalizedQuery = query.trim().toLowerCase();
    const filteredFixtures = fixtures.filter((fixture) => { if (!normalizedQuery) return true; const match = normalizeFixture(fixture); return `${match.home.name} ${match.away.name} ${match.league} ${match.country}`.toLowerCase().includes(normalizedQuery); });
    const groups = groupByLeague(filteredFixtures);
    if (!groups.length) { container.innerHTML = `<div class="matches-page__empty"><div><span>NO MATCHES</span><h2>No matches found</h2><p>There are no matches for this date or search.</p></div></div>`; return; }
    groups.forEach((league) => {
        const section = document.createElement("section");
        section.className = "matches-page__league";
        section.innerHTML = `<div class="matches-page__league-heading"><div class="matches-page__league-title"><div class="matches-page__league-logo">${league.logo ? `<img src="${league.logo}" alt="${league.name} logo">` : "⚽"}</div><div><span>${league.country}</span><h2>${league.name}</h2></div></div><span class="matches-page__league-count">${league.matches.length} match${league.matches.length === 1 ? "" : "es"}</span></div><div class="matches-page__league-scroll" tabindex="0" aria-label="${league.name} matches"></div>`;
        const scroll = section.querySelector(".matches-page__league-scroll");
        league.matches.forEach((match) => scroll.appendChild(createMatchCard(match)));
        container.appendChild(section);
    });
}

function createMatchesPage() {
    const app = document.querySelector("#app");
    if (!app) return;
    app.innerHTML = `<section class="matches-page"><div class="directory-page__top"><div><span class="section-heading__eyebrow">MATCH CENTER</span><h1>Matches</h1><p>Follow the matches happening yesterday, today and tomorrow.</p></div><input class="directory-page__search" type="search" placeholder="Search teams or leagues…" aria-label="Search matches" data-match-search></div><div class="matches-page__date-row"><div class="matches-page__date-controls" role="tablist" aria-label="Match dates"><button class="matches-page__date-button" type="button" data-date="yesterday" role="tab" aria-selected="false">Yesterday</button><button class="matches-page__date-button is-active" type="button" data-date="today" role="tab" aria-selected="true">Today</button><button class="matches-page__date-button" type="button" data-date="tomorrow" role="tab" aria-selected="false">Tomorrow</button></div></div><div class="matches-page__summary"><span class="matches-page__result-label">TODAY</span><strong data-count>Loading…</strong></div><div class="matches-page__loading" data-matches-loading>Loading matches…</div><div class="matches-page__groups" data-matches-groups hidden></div></section>`;
    const groups = app.querySelector("[data-matches-groups]"), loading = app.querySelector("[data-matches-loading]"), count = app.querySelector("[data-count]"), resultLabel = app.querySelector(".matches-page__result-label"), search = app.querySelector("[data-match-search]"), cache = new Map();
    const labels = { yesterday: "YESTERDAY", today: "TODAY", tomorrow: "TOMORROW" }, offsets = { yesterday: -1, today: 0, tomorrow: 1 };
    let activeFixtures = [];
    const renderCurrent = () => { const normalizedQuery = search.value.trim().toLowerCase(); const visible = activeFixtures.filter((fixture) => { if (!normalizedQuery) return true; const match = normalizeFixture(fixture); return `${match.home.name} ${match.away.name} ${match.league} ${match.country}`.toLowerCase().includes(normalizedQuery); }); count.textContent = `${visible.length} match${visible.length === 1 ? "" : "es"}`; renderLeagueGroups(groups, activeFixtures, search.value); };
    const loadDate = async (dateKey) => {
        if (cache.has(dateKey)) { activeFixtures = cache.get(dateKey); loading.hidden = true; groups.hidden = false; resultLabel.textContent = labels[dateKey]; renderCurrent(); return; }
        loading.hidden = false; groups.hidden = true; loading.innerHTML = `<div>Loading ${dateKey === "today" ? "today's" : dateKey === "yesterday" ? "yesterday's" : "tomorrow's"} matches…</div>`;
        try {
            activeFixtures = (await getMatchesByDate(getTehranDate(offsets[dateKey]))).response ?? [];
            cache.set(dateKey, activeFixtures);
            loading.hidden = true; groups.hidden = false; resultLabel.textContent = labels[dateKey]; renderCurrent();
        } catch {
            loading.hidden = false; groups.hidden = true;
            loading.innerHTML = `<div class="matches-page__empty"><div><span>API ERROR</span><h2>Could not load matches</h2><p>Please check your API key or connection and try again.</p><button class="ui-state__retry" type="button" data-match-retry>Retry</button></div></div>`;
            loading.querySelector("[data-match-retry]").addEventListener("click", () => loadDate(dateKey));
        }
    };
    search.addEventListener("input", renderCurrent);
    app.querySelectorAll("[data-date]").forEach((button) => button.addEventListener("click", () => { app.querySelectorAll("[data-date]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-selected", String(active)); }); loadDate(button.dataset.date); }));
    loadDate("today");
}

export default createMatchesPage;
