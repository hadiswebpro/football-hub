import {formatDate, getLeagueStatus} from "../utils/date";

const FAVORITES_KEY = "football-hub-favorite-leagues";

function getFavoriteLeagues() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFavoriteLeagues(ids) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function createLeagueCard(competition) {
    const card = document.createElement("article");
    card.classList.add("league-card");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${competition.league.name}`);

    const currentSeason = competition.seasons?.find(
        (season) => season.current === true,
    );

    const status = currentSeason
        ? getLeagueStatus(currentSeason.start, currentSeason.end)
        : "Unknown";

    const favoriteIds = getFavoriteLeagues();
    const isFavorite = favoriteIds.includes(competition.league.id);

    card.innerHTML = `
        <button
            class="league-card__favorite ${isFavorite ? "is-favorite" : ""}"
            type="button"
            aria-label="${isFavorite ? "Remove" : "Add"} ${competition.league.name} ${isFavorite ? "from" : "to"} favorites"
            aria-pressed="${isFavorite}"
        >
            <span aria-hidden="true">★</span>
        </button>

        <div class="league-card__topline">
            <span class="league-card__number">#${competition.league.id}</span>
            <span class="league-card__status league-card__status--${status.toLowerCase()}">
                <i></i>${status}
            </span>
        </div>

        <div class="league-card__logo-wrap">
            <div class="league-card__ring"></div>
            <img
                src="${competition.league.logo}"
                alt="${competition.league.name} logo"
                class="league-logo"
            >
        </div>

        <div class="league-info">
            <h3>${competition.league.name}</h3>
            <p class="league-card__country">${competition.country.name}</p>
            <span class="league-card__type">${competition.league.type}</span>

            ${currentSeason ? `
                <div class="league-card__dates">
                    <span>${formatDate(currentSeason.start)}</span>
                    <b>—</b>
                    <span>${formatDate(currentSeason.end)}</span>
                </div>
            ` : ""}
        </div>

        <div class="league-card__footer">
            <span>View league</span>
            <span class="league-card__arrow" aria-hidden="true">↗</span>
        </div>
    `;

    const favoriteButton = card.querySelector(".league-card__favorite");

    favoriteButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const ids = getFavoriteLeagues();
        const index = ids.indexOf(competition.league.id);

        if (index === -1) {
            ids.push(competition.league.id);
        } else {
            ids.splice(index, 1);
        }

        saveFavoriteLeagues(ids);

        const active = ids.includes(competition.league.id);
        favoriteButton.classList.toggle("is-favorite", active);
        favoriteButton.setAttribute("aria-pressed", String(active));
        favoriteButton.setAttribute(
            "aria-label",
            `${active ? "Remove" : "Add"} ${competition.league.name} ${active ? "from" : "to"} favorites`,
        );
    });

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
            if (event.target === favoriteButton) return;
            event.preventDefault();
            openCard();
        }
    });

    return card;
}

export default createLeagueCard;
