const FAVORITES_KEY = "football-hub-favorite-teams";

function getFavoriteTeams() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFavoriteTeams(ids) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function createTeamCard(team) {
    const card = document.createElement("article");
    const favoriteIds = getFavoriteTeams();
    const isFavorite = favoriteIds.includes(team.id);

    card.className = "team-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${team.name}`);

    card.innerHTML = `
        <button
            class="team-card__favorite ${isFavorite ? "is-favorite" : ""}"
            type="button"
            aria-label="${isFavorite ? "Remove" : "Add"} ${team.name} ${isFavorite ? "from" : "to"} favorites"
            aria-pressed="${isFavorite}"
        >
            <span aria-hidden="true">★</span>
        </button>

        <div class="team-card__logo-wrap">
            <div class="team-card__ring"></div>
            <img src="${team.logo}" alt="${team.name} logo" class="team-logo">
        </div>

        <div class="team-card__info">
            <h3>${team.name}</h3>
            <p>${team.country ?? "International"}</p>
            ${team.league ? `<span>${team.league}</span>` : ""}
        </div>

        <div class="team-card__footer">
            <span>View team</span>
            <span class="team-card__arrow" aria-hidden="true">↗</span>
        </div>
    `;

    const favoriteButton = card.querySelector(".team-card__favorite");

    favoriteButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const ids = getFavoriteTeams();
        const index = ids.indexOf(team.id);

        if (index === -1) {
            ids.push(team.id);
        } else {
            ids.splice(index, 1);
        }

        saveFavoriteTeams(ids);

        const active = ids.includes(team.id);
        favoriteButton.classList.toggle("is-favorite", active);
        favoriteButton.setAttribute("aria-pressed", String(active));
        favoriteButton.setAttribute(
            "aria-label",
            `${active ? "Remove" : "Add"} ${team.name} ${active ? "from" : "to"} favorites`,
        );
    });

    const openCard = () => {
        card.classList.add("is-open");
        card.dispatchEvent(
            new CustomEvent("team:open", {
                bubbles: true,
                detail: team,
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

export default createTeamCard;
