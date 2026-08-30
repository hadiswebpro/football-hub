function createLeagueCard(league) {
    const card = document.createElement("article");

    card.classList.add("league-card");

    card.innerHTML = `
        <div class="league-card__logo">
            <img 
                src="${league.logo}" 
                alt="${league.name} logo"
            >
        </div>

        <div class="league-card__content">
            <h3 class="league-card__name">
                ${league.name}
            </h3>

            <p class="league-card__country">
                ${league.country}
            </p>

            <p class="league-card__status">
                ${league.status}
            </p>
        </div>
    `;

    return card;
}

export default createLeagueCard;