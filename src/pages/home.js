import getCompetitions from "../api/competitions";
import { getLiveMatches, getMatchesByDate } from "../api/matches";
import createHero from "../components/hero";
import createMatchCard from "../components/matchcard";
import createLeagueCard from "../components/leagueCard";

const importantLeagueIds = [1, 4, 2, 3, 39, 40, 140, 141, 135, 136, 78, 79, 61, 62];

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
        league: fixture.league?.name ?? "Football",
        status: isLive ? "LIVE" : isFinished ? "FINISHED" : "SCHEDULED",
        minute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "",
        time: isLive
            ? "Live now"
            : new Date(fixture.fixture?.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

function renderHomeSections() {
    const app = document.querySelector("#app");
    if (!app) return null;

    app.innerHTML = `
        <section class="home-section home-section--matches">
            <div class="section-heading"><span class="section-heading__eyebrow">MATCH CENTER</span><h2>Live & Upcoming</h2><p>See what's happening now and what's coming next.</p></div>
            <div class="match-view-controls" role="tablist" aria-label="Match view">
                <button class="match-view-controls__button is-active" type="button" data-match-view="live" role="tab" aria-selected="true">Live</button>
                <button class="match-view-controls__button" type="button" data-match-view="upcoming" role="tab" aria-selected="false">Upcoming</button>
            </div>
            <section class="matches matches--live"></section>
            <section class="matches matches--upcoming" hidden></section>
        </section>
        <section class="home-section home-section--leagues">
            <div class="section-heading"><span class="section-heading__eyebrow">EXPLORE</span><h2>Top Leagues</h2><p>Follow the competitions that matter most.</p></div>
            <section class="leagues"></section>
        </section>
    `;

    app.prepend(createHero());
    return { live: app.querySelector(".matches--live"), upcoming: app.querySelector(".matches--upcoming"), leagues: app.querySelector(".leagues") };
}

function setupMatchViewControls(liveContainer, upcomingContainer) {
    document.querySelectorAll("[data-match-view]").forEach((button) => {
        button.addEventListener("click", () => {
            const isLive = button.dataset.matchView === "live";
            document.querySelectorAll("[data-match-view]").forEach((item) => {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
            });
            liveContainer.hidden = !isLive;
            upcomingContainer.hidden = isLive;
        });
    });
}

function renderMatches(containers, liveFixtures, upcomingFixtures) {
    const liveMatches = liveFixtures.map(normalizeFixture);
    const upcomingMatches = upcomingFixtures
        .map(normalizeFixture)
        .filter((match) => match.status === "SCHEDULED")
        .slice(0, 12);

    if (!liveMatches.length) {
        containers.live.innerHTML = `<div class="matches__empty">No live matches right now.</div>`;
    } else {
        liveMatches.forEach((match) => containers.live.appendChild(createMatchCard(match)));
    }

    if (!upcomingMatches.length) {
        containers.upcoming.innerHTML = `<div class="matches__empty">No upcoming matches found.</div>`;
    } else {
        upcomingMatches.forEach((match) => containers.upcoming.appendChild(createMatchCard(match)));
    }

    setupMatchViewControls(containers.live, containers.upcoming);
}

async function loadCompetitions() {
    const containers = renderHomeSections();
    if (!containers) return;

    containers.live.innerHTML = `<div class="matches__empty">Loading live matches…</div>`;
    containers.upcoming.innerHTML = `<div class="matches__empty">Loading upcoming matches…</div>`;

    try {
        const [liveData, todayData, tomorrowData] = await Promise.all([
            getLiveMatches(),
            getMatchesByDate(getDate()),
            getMatchesByDate(getDate(1))
        ]);

        const today = todayData.response ?? [];
        const tomorrow = tomorrowData.response ?? [];
        renderMatches(containers, liveData.response ?? [], [...today, ...tomorrow]);
    } catch (error) {
        containers.live.innerHTML = `<div class="matches__empty">Could not load live matches. Check your API key.</div>`;
        containers.upcoming.innerHTML = `<div class="matches__empty">Could not load upcoming matches. Check your API key.</div>`;
        setupMatchViewControls(containers.live, containers.upcoming);
    }

    try {
        const data = await getCompetitions();
        if (!data?.response) return;

        data.response
            .filter((competition) => importantLeagueIds.includes(competition.league.id))
            .forEach((competition) => containers.leagues.appendChild(createLeagueCard(competition)));
    } catch {
        containers.leagues.innerHTML = `<div class="matches__empty">Could not load leagues.</div>`;
    }
}

export default loadCompetitions;
