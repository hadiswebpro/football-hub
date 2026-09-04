function getSelectedMatch() {
    try {
        return JSON.parse(sessionStorage.getItem("football-hub-selected-match"));
    } catch {
        return null;
    }
}

function createMatchPage() {
    const app = document.querySelector("#app");
    const match = getSelectedMatch();

    if (!app || !match) return;

    const state = match.status === "LIVE"
        ? "live"
        : match.status === "FINISHED"
            ? "finished"
            : "scheduled";

    app.innerHTML = `
        <section class="match-page">
            <button class="match-page__back" type="button">
                <span aria-hidden="true">←</span>
                Back
            </button>

            <div class="match-page__hero match-page__hero--${state}">
                <div class="match-page__glow" aria-hidden="true"></div>
                <span class="match-page__eyebrow">${match.league}</span>
                <span class="match-page__status">
                    <i></i>
                    ${match.status === "LIVE" ? match.minute : match.status}
                </span>

                <div class="match-page__teams">
                    <div class="match-page__team">
                        <div class="match-page__logo">
                            <img src="${match.home.logo}" alt="${match.home.name} logo">
                        </div>
                        <h1>${match.home.name}</h1>
                    </div>

                    <div class="match-page__center">
                        <div class="match-page__score">
                            <span>${match.home.score ?? "–"}</span>
                            <b>:</b>
                            <span>${match.away.score ?? "–"}</span>
                        </div>
                        <span class="match-page__time">${match.time}</span>
                    </div>

                    <div class="match-page__team">
                        <div class="match-page__logo">
                            <img src="${match.away.logo}" alt="${match.away.name} logo">
                        </div>
                        <h1>${match.away.name}</h1>
                    </div>
                </div>
            </div>

            <div class="match-page__grid">
                <section class="match-page__panel">
                    <span class="match-page__panel-label">MATCH CENTER</span>
                    <h2>Match Overview</h2>
                    <p>Detailed match statistics, events and lineups will appear here when live match data is connected.</p>
                </section>

                <section class="match-page__panel">
                    <span class="match-page__panel-label">STATUS</span>
                    <h2>${match.status === "LIVE" ? "In progress" : match.status === "FINISHED" ? "Full time" : "Coming up"}</h2>
                    <p>${match.status === "LIVE" ? `The match is currently in progress at ${match.minute}.` : match.status === "FINISHED" ? "This match has finished." : `Kick-off is scheduled for ${match.time}.`}</p>
                </section>
            </div>
        </section>
    `;

    app.querySelector(".match-page__back").addEventListener("click", () => {
        sessionStorage.removeItem("football-hub-selected-match");
        window.location.hash = "";
        window.location.reload();
    });
}

export default createMatchPage;
