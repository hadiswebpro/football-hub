import {formatDate, getLeagueStatus} from "../utils/date";

function createLeagueCard(competition) {
  const card = document.createElement("article");

  card.classList.add("league-card");

  const currentSeason = competition.seasons.find(
    (season) => season.current === true,
  );

  const status = getLeagueStatus(currentSeason.start, currentSeason.end);

  card.innerHTML = `
        <img
            src="${competition.league.logo}"
            alt="${competition.league.name} logo"
            class="league-logo"
        >


        <div class="league-info">
            <h3>${competition.league.name}</h3>

            <p>${competition.country.name}</p>

            <span>${competition.league.type}</span>

            <p>Status: ${status}</p>

            <p>Start: ${formatDate(currentSeason.start)}</p>
           
            <p>End: ${formatDate(currentSeason.end)}</p>
        </div>
    `;

  return card;
}

export default createLeagueCard;
