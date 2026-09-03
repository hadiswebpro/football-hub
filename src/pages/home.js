import getCompetitions from "../api/competitions";
import createLeagueCard from "../components/leagueCard";
import {formatDate, getLeagueStatus} from "../utils/date";

const importantLeagueIds = [
    1, 4, 2, 3,
    39, 40,
    140, 141,
    135, 136,
    78, 79,
    61, 62,
];

function showLeagueModal(competition) {
    document.querySelector(".league-modal")?.remove();

    const season = competition.seasons.find((item) => item.current === true);
    const status = season
        ? getLeagueStatus(season.start, season.end)
        : "Unknown";

    const modal = document.createElement("div");
    modal.className = "league-modal";
    modal.innerHTML = `
        <div class="league-modal__backdrop"></div>
        <div class="league-modal__content" role="dialog" aria-modal="true" aria-label="${competition.league.name}">
            <button class="league-modal__close" type="button" aria-label="Close">×</button>
            <img src="${competition.league.logo}" alt="${competition.league.name} logo" class="league-modal__logo">
            <h2>${competition.league.name}</h2>
            <p>${competition.country.name}</p>
            <span>${competition.league.type}</span>
            <strong>Status: ${status}</strong>
            ${season ? `<small>${formatDate(season.start)} — ${formatDate(season.end)}</small>` : ""}
        </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector(".league-modal__close").addEventListener("click", close);
    modal.querySelector(".league-modal__backdrop").addEventListener("click", close);

    const handleEscape = (event) => {
        if (event.key === "Escape") {
            close();
            document.removeEventListener("keydown", handleEscape);
        }
    };

    document.addEventListener("keydown", handleEscape);
}

async function loadCompetitions() {
    const data = await getCompetitions();
    const container = document.querySelector(".leagues");

    if (!data?.response || !container) return;

    const filteredLeagues = data.response.filter((competition) =>
        importantLeagueIds.includes(competition.league.id)
    );

    filteredLeagues.forEach((competition) => {
        container.appendChild(createLeagueCard(competition));
    });

    container.addEventListener("league:open", (event) => {
        showLeagueModal(event.detail);
    });
}

export default loadCompetitions;
