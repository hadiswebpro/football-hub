function getMatchState(status) {
    if (status === "LIVE") return "live";
    if (status === "FINISHED") return "finished";
    return "scheduled";
}

function createMatchCard(match) {
    const card = document.createElement("article");
    const state = getMatchState(match.status);

    card.className = `match-card match-card--${state}`;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${match.home.name} versus ${match.away.name}`);

    card.innerHTML = `
        <div class="match-card__topline">
            <span class="match-card__league">${match.league}</span>
            <span class="match-card__status">
                <i></i>
                ${match.status === "LIVE" ? match.minute : match.status}
            </span>
        </div>

        <div class="match-card__teams">
            <div class="match-card__team">
                <div class="match-card__logo-wrap">
                    <img src="${match.home.logo}" alt="${match.home.name} logo">
                </div>
                <strong>${match.home.name}</strong>
            </div>

            <div class="match-card__score">
                <span>${match.home.score ?? "–"}</span>
                <b>:</b>
                <span>${match.away.score ?? "–"}</span>
            </div>

            <div class="match-card__team">
                <div class="match-card__logo-wrap">
                    <img src="${match.away.logo}" alt="${match.away.name} logo">
                </div>
                <strong>${match.away.name}</strong>
            </div>
        </div>

        <div class="match-card__bottom">
            <span>${match.time}</span>
            <span class="match-card__arrow" aria-hidden="true">↗</span>
        </div>
    `;

    const openCard = () => {
        sessionStorage.setItem("football-hub-selected-match", JSON.stringify(match));
        window.location.hash = "match";
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

export default createMatchCard;
