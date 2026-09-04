import getCompetitions from "../api/competitions";
import createHero from "../components/hero";
import createLeagueCard from "../components/leagueCard";
import createMatchCard from "../components/matchcard";

const importantLeagueIds = [
    1, 4, 2, 3,
    39, 40,
    140, 141,
    135, 136,
    78, 79,
    61, 62,
];

const demoMatches = [
    {
        league: "Premier League",
        status: "LIVE",
        minute: "67'",
        time: "Live now",
        home: {
            name: "Arsenal",
            score: 2,
            logo: "https://media.api-sports.io/football/teams/42.png",
        },
        away: {
            name: "Chelsea",
            score: 1,
            logo: "https://media.api-sports.io/football/teams/49.png",
        },
    },
    {
        league: "La Liga",
        status: "SCHEDULED",
        time: "20:00",
        home: {
            name: "Real Madrid",
            score: null,
            logo: "https://media.api-sports.io/football/teams/541.png",
        },
        away: {
            name: "Barcelona",
            score: null,
            logo: "https://media.api-sports.io/football/teams/529.png",
        },
    },
    {
        league: "Premier League",
        status: "SCHEDULED",
        time: "22:30",
        home: {
            name: "Liverpool",
            score: null,
            logo: "https://media.api-sports.io/football/teams/40.png",
        },
        away: {
            name: "Manchester City",
            score: null,
            logo: "https://media.api-sports.io/football/teams/50.png",
        },
    },
];

function renderHomeSections() {
    const app = document.querySelector("#app");

    if (!app) return null;

    app.innerHTML = `
        <section class="home-section home-section--matches">
            <div class="section-heading">
                <span class="section-heading__eyebrow">MATCH CENTER</span>
                <h2>Live & Upcoming</h2>
                <p>See what's happening now and what's coming next.</p>
            </div>
            <section class="matches"></section>
        </section>

        <section class="home-section home-section--leagues">
            <div class="section-heading">
                <span class="section-heading__eyebrow">EXPLORE</span>
                <h2>Top Leagues</h2>
                <p>Follow the competitions that matter most.</p>
            </div>
            <section class="leagues"></section>
        </section>
    `;

    app.prepend(createHero());

    return {
        matches: app.querySelector(".matches"),
        leagues: app.querySelector(".leagues"),
    };
}

function renderDemoMatches(container) {
    if (!container) return;

    demoMatches.forEach((match) => {
        container.appendChild(createMatchCard(match));
    });
}

async function loadCompetitions() {
    const containers = renderHomeSections();

    if (!containers) return;

    renderDemoMatches(containers.matches);

    const data = await getCompetitions();

    if (!data?.response) return;

    const filteredLeagues = data.response.filter((competition) =>
        importantLeagueIds.includes(competition.league.id)
    );

    filteredLeagues.forEach((competition) => {
        containers.leagues.appendChild(createLeagueCard(competition));
    });
}

export default loadCompetitions;
