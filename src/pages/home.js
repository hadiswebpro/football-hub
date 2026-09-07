import getCompetitions from "../api/competitions";
import { getLiveMatches, getMatchesByDate } from "../api/matches";
import createHero from "../components/hero";
import createMatchCard from "../components/matchcard";
import createLeagueCard from "../components/leagueCard";
import createTeamCard from "../components/teamCard";

const importantLeagueIds = [1, 4, 2, 3, 39, 40, 140, 141, 135, 136, 78, 79, 61, 62];

const popularTeams = [
    { id: 541, name: "Real Madrid", country: "Spain", league: "La Liga", logo: "https://media.api-sports.io/football/teams/541.png" },
    { id: 529, name: "Barcelona", country: "Spain", league: "La Liga", logo: "https://media.api-sports.io/football/teams/529.png" },
    { id: 50, name: "Manchester City", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/50.png" },
    { id: 40, name: "Liverpool", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/40.png" },
    { id: 157, name: "Bayern Munich", country: "Germany", league: "Bundesliga", logo: "https://media.api-sports.io/football/teams/157.png" },
    { id: 85, name: "Paris Saint-Germain", country: "France", league: "Ligue 1", logo: "https://media.api-sports.io/football/teams/85.png" },
    { id: 42, name: "Arsenal", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/42.png" },
    { id: 33, name: "Manchester United", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/33.png" }
];

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

function renderHomeSections() {
    const app = document.querySelector("#app");
    if (!app) return null;

    app.innerHTML = `
        <section class="home-section home-section--matches">
            <div class="section-heading"><span class="section-heading__eyebrow">MATCH CENTER</span><h2>Matches</h2><p>See what's happening now, what's coming next, and the latest results.</p></div>
            <div class="match-view-controls" role="tablist" aria-label="Match view">
                <button class="match-view-controls__button is-active" type="button" data-match-view="live" role="tab" aria-selected="true">Live</button>
                <button class="match-view-controls__button" type="button" data-match-view="upcoming" role="tab" aria-selected="false">Upcoming</button>
                <button class="match-view-controls__button" type="button" data-match-view="latest" role="tab" aria-selected="false">Latest Results</button>
            </div>
            <section class="matches matches--live"></section>
            <section class="matches matches--upcoming" hidden></section>
            <section class="matches matches--latest" hidden></section>
        </section>
        <section class="home-section home-section--leagues">
            <div class="section-heading"><span class="section-heading__eyebrow">EXPLORE</span><h2>Top Leagues</h2><p>Follow the competitions that matter most.</p></div>
            <section class="leagues"></section>
        </section>
        <section class="home-section home-section--teams">
            <div class="section-heading"><span class="section-heading__eyebrow">FAN FAVORITES</span><h2>Popular Teams</h2><p>Keep up with the biggest clubs in world football.</p></div>
            <section class="teams"></section>
        </section>
    `;

    app.prepend(createHero());
    return {
        live: app.querySelector(".matches--live"),
        upcoming: app.querySelector(".matches--upcoming"),
        latest: app.querySelector(".matches--latest"),
        leagues: app.querySelector(".leagues"),
        teams: app.querySelector(".teams")
    };
}

function setupMatchViewControls(containers) {
    document.querySelectorAll("[data-match-view]").forEach((button) => {
        button.addEventListener("click", () => {
            const selectedView = button.dataset.matchView;

            document.querySelectorAll("[data-match-view]").forEach((item) => {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
            });

            containers.live.hidden = selectedView !== "live";
            containers.upcoming.hidden = selectedView !== "upcoming";
            containers.latest.hidden = selectedView !== "latest";
        });
    });
}

function renderMatches(containers, liveFixtures, upcomingFixtures) {
    const liveMatches = liveFixtures.map(normalizeFixture);
    const allUpcoming = upcomingFixtures.map(normalizeFixture);

    const upcomingMatches = allUpcoming
        .filter((match) => match.status === "SCHEDULED")
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 12);

    const latestMatches = allUpcoming
        .filter((match) => match.status === "FINISHED")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
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

    if (!latestMatches.length) {
        containers.latest.innerHTML = `<div class="matches__empty">No recent results found.</div>`;
    } else {
        latestMatches.forEach((match) => containers.latest.appendChild(createMatchCard(match)));
    }

    setupMatchViewControls(containers);
}

function renderPopularTeams(container) {
    popularTeams.forEach((team) => container.appendChild(createTeamCard(team)));
}

async function loadCompetitions() {
    const containers = renderHomeSections();
    if (!containers) return;

    containers.live.innerHTML = `<div class="matches__empty">Loading live matches…</div>`;
    containers.upcoming.innerHTML = `<div class="matches__empty">Loading upcoming matches…</div>`;
    containers.latest.innerHTML = `<div class="matches__empty">Loading latest results…</div>`;
    renderPopularTeams(containers.teams);

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
        containers.latest.innerHTML = `<div class="matches__empty">Could not load latest results. Check your API key.</div>`;
        setupMatchViewControls(containers);
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
