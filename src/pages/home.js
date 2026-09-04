import getCompetitions from "../api/competitions";
import createHero from "../components/hero";
import createLeagueCard from "../components/leagueCard";
import {getLeagueStatus} from "../utils/date";

const importantLeagueIds = [
    1, 4, 2, 3,
    39, 40,
    140, 141,
    135, 136,
    78, 79,
    61, 62,
];

function renderHomeSections() {
    const app = document.querySelector("#app");

    if (!app) return null;

    app.innerHTML = `
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

    return app.querySelector(".leagues");
}

async function loadCompetitions() {
    const container = renderHomeSections();
    const data = await getCompetitions();

    if (!data?.response || !container) return;

    const filteredLeagues = data.response.filter((competition) =>
        importantLeagueIds.includes(competition.league.id)
    );

    filteredLeagues.forEach((competition) => {
        const currentSeason = competition.seasons.find(
            (season) => season.current === true,
        );

        if (currentSeason) {
            getLeagueStatus(currentSeason.start, currentSeason.end);
        }

        container.appendChild(createLeagueCard(competition));
    });
}

export default loadCompetitions;
