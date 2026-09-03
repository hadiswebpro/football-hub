import {formatDate, getLeagueStatus} from "../utils/date";

function createLeagueCard(competition) {
  const card = document.createElement("article");
  card.classList.add("league-card");
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Open ${competition.league.name}`);

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

  const openCard = () => {
    card.classList.add("is-open");
    card.dispatchEvent(
      new CustomEvent("league:open", {
        bubbles: true,
        detail: competition,
      }),
    );
  };

  card.addEventListener("click", openCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCard();
    }
  });

  return card;
}

export default createLeagueCard;
