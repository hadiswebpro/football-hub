const FAVORITES_KEY = "football-hub-favorite-teams";
const SELECTED_TEAM_KEY = "football-hub-selected-team";

function getFavoriteTeams() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { return []; }
}

function saveFavoriteTeams(teams) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(teams)); }

function createTeamCard(team) {
    const card = document.createElement("article");
    const favoriteTeams = getFavoriteTeams();
    const favoriteId = Number(team.id);
    const isFavorite = favoriteTeams.some((item) => Number(item?.id ?? item) === favoriteId);
    card.className = "team-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${team.name}`);
    card.innerHTML = `
        <button class="team-card__favorite ${isFavorite ? "is-favorite" : ""}" type="button" aria-label="${isFavorite ? "Remove" : "Add"} ${team.name} ${isFavorite ? "from" : "to"} favorites" aria-pressed="${isFavorite}"><span aria-hidden="true">★</span></button>
        <div class="team-card__logo-wrap"><div class="team-card__ring"></div><img src="${team.logo}" alt="${team.name} logo" class="team-logo"></div>
        <div class="team-card__info"><h3>${team.name}</h3><p>${team.country ?? "International"}</p>${team.league ? `<span>${team.league}</span>` : ""}</div>
        <div class="team-card__footer"><span>View team</span><span class="team-card__arrow" aria-hidden="true">↗</span></div>
    `;

    const favoriteButton = card.querySelector(".team-card__favorite");
    favoriteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const teams = getFavoriteTeams();
        const index = teams.findIndex((item) => Number(item?.id ?? item) === favoriteId);
        if (index === -1) {
            teams.push({
                id: favoriteId,
                name: team.name,
                country: team.country ?? "International",
                league: team.league ?? "",
                logo: team.logo ?? ""
            });
        } else {
            teams.splice(index, 1);
        }
        saveFavoriteTeams(teams);
        const active = teams.some((item) => Number(item?.id ?? item) === favoriteId);
        favoriteButton.classList.toggle("is-favorite", active);
        favoriteButton.setAttribute("aria-pressed", String(active));
        favoriteButton.setAttribute("aria-label", `${active ? "Remove" : "Add"} ${team.name} ${active ? "from" : "to"} favorites`);
    });

    const openCard = () => {
        card.classList.add("is-open");
        sessionStorage.setItem(SELECTED_TEAM_KEY, JSON.stringify(team));
        window.location.hash = "#team";
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
