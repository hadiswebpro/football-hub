import { getLiveMatches, getMatchesByDate } from "../api/matches";
import createMatchCard from "../components/matchcard";

function getDate(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

function normalizeFixture(fixture) {
    const status = fixture.fixture?.status?.short;
    const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];
    const finishedStatuses = ["FT", "AET", "PEN"];
    const isLive = liveStatuses.includes(status);
    const isFinished = finishedStatuses.includes(status);

    return {
        fixtureId: fixture.fixture?.id,
        leagueId: fixture.league?.id,
        league: fixture.league?.name ?? "Football",
        leagueLogo: fixture.league?.logo ?? "",
        country: fixture.league?.country ?? "International",
        status: isLive ? "LIVE" : isFinished ? "FINISHED" : "SCHEDULED",
        minute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "",
        time: isLive
            ? "Live now"
            : new Date(fixture.fixture?.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: fixture.fixture?.date ?? "",
        home: {
            name: fixture.teams?.home?.name ?? "Home",
            score: fixture.goals?.home ?? null,
            logo: fixture.teams?.home?.logo ?? ""
        },
        away: {
            name: fixture.teams?.away?.name ?? "Away",
            score: fixture.goals?.away ?? null,
            logo: fixture.teams?.away?.logo ?? ""
        }
    };
}

function groupByLeague(fixtures) {
    const groups = new Map();

    fixtures
        .map(normalizeFixture)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((match) => {
            const key = match.leagueId ?? match.league;
            if (!groups.has(key)) {
                groups.set(key, {
                    id: key,
                    name: match.league,
                    logo: match.leagueLogo,
                    country: match.country,
                    matches: []
                });
            }
            groups.get(key).matches.push(match);
        });

    return [...groups.values()];
}

function renderLeagueGroups(container, fixtures, title) {
    container.innerHTML = "";
    const groups = groupByLeague(fixtures);

    if (!groups.length) {
        container.innerHTML = `<div class="matches-page__empty"><span>NO MATCHES</span><h2>No matches found</h2><p>There are no fixtures available for this date.</p></div>`;
        return;
    }

    groups.forEach((league) => {
        const section = document.createElement("section");
        section.className = "matches-page__league";
        section.innerHTML = `
            <div class="matches-page__league-heading">
                <div class="matches-page__league-title">
                    <div class="matches-page__league-logo">${league.logo ? `<img src="${league.logo}" alt="${league.name} logo">` : "⚽"}</div>
                    <div>
                        <span>${league.country}</span>
                        <h2>${league.name}</h2>
                    </div>
                </div>
                <span class="matches-page__league-count">${league.matches.length} match${league.matches.length === 1 ? "" : "es"}</span>
            </div>
            <div class="matches-page__league-scroll" tabindex="0" aria-label="${league.name} matches"></div>
        `;

        const scroll = section.querySelector(".matches-page__league-scroll");
        league.matches.forEach((match) => scroll.appendChild(createMatchCard(match)));
        container.appendChild(section);
    });

    const heading = container.querySelector(".matches-page__result-label");
    if (heading) heading.textContent = title;
}

function createMatchesPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `
        <section class="matches-page">
            <div class="matches-page__top">
                <div>
                    <span class="section-heading__eyebrow">MATCH CENTER</span>
                    <h1>Matches</h1>
                    <p>Every league. Every fixture. All in one place.</p>
                </div>
                <div class="matches-page__date-controls" role="tablist" aria-label="Match dates">
                    <button class="matches-page__date-button is-active" type="button" data-date="today" role="tab" aria-selected="true">Today</button>
                    <button class="matches-page__date-button" type="button" data-date="tomorrow" role="tab" aria-selected="false">Tomorrow</button>
                </div>
            </div>
            <div class="matches-page__summary"><span class="matches-page__result-label">TODAY</span><strong data-count>Loading…</strong></div>
            <div class="matches-page__loading" data-matches-loading>Loading matches…</div>
            <div class="matches-page__groups" data-matches-groups hidden></div>
        </section>
    `;

    const groups = app.querySelector("[data-matches-groups]");
    const loading = app.querySelector("[data-matches-loading]");
    const count = app.querySelector("[data-count]");
    const resultLabel = app.querySelector(".matches-page__result-label");
    const cache = new Map();

    const loadDate = async (dateKey) => {
        if (cache.has(dateKey)) {
            const fixtures = cache.get(dateKey);
            loading.hidden = true;
            groups.hidden = false;
            resultLabel.textContent = dateKey === "today" ? "TODAY" : "TOMORROW";
            count.textContent = `${fixtures.length} match${fixtures.length === 1 ? "" : "es"}`;
            renderLeagueGroups(groups, fixtures, resultLabel.textContent);
            return;
        }

        loading.hidden = false;
        groups.hidden = true;
        loading.textContent = `Loading ${dateKey === "today" ? "today's" : "tomorrow's"} matches…`;

        try {
            const fixtures = dateKey === "today"
                ? (await getMatchesByDate(getDate())).response ?? []
                : (await getMatchesByDate(getDate(1))).response ?? [];

            cache.set(dateKey, fixtures);
            loading.hidden = true;
            groups.hidden = false;
            resultLabel.textContent = dateKey === "today" ? "TODAY" : "TOMORROW";
            count.textContent = `${fixtures.length} match${fixtures.length === 1 ? "" : "es"}`;
            renderLeagueGroups(groups, fixtures, resultLabel.textContent);
        } catch {
            loading.hidden = false;
            groups.hidden = true;
            loading.innerHTML = `<div class="matches-page__empty"><span>API ERROR</span><h2>Could not load matches</h2><p>Please check your API key and try again.</p></div>`;
        }
    };

    app.querySelectorAll("[data-date]").forEach((button) => {
        button.addEventListener("click", () => {
            app.querySelectorAll("[data-date]").forEach((item) => {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
            });
            loadDate(button.dataset.date);
        });
    });

    loadDate("today");
}

export default createMatchesPage;
