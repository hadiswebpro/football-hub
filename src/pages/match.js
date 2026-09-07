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

    const state = match.status === "LIVE" ? "live" : match.status === "FINISHED" ? "finished" : "scheduled";
    const isLive = state === "live";

    app.innerHTML = `
        <section class="match-page">
            <button class="match-page__back" type="button"><span aria-hidden="true">←</span> Back to matches</button>

            <div class="match-page__hero match-page__hero--${state}">
                <div class="match-page__field" aria-hidden="true">
                    <span class="match-page__field-line match-page__field-line--center"></span>
                    <span class="match-page__field-circle"></span>
                    <span class="match-page__field-line match-page__field-line--left"></span>
                    <span class="match-page__field-line match-page__field-line--right"></span>
                </div>
                <div class="match-page__glow" aria-hidden="true"></div>

                <div class="match-page__heading">
                    <span class="match-page__eyebrow">${match.league}</span>
                    <span class="match-page__status"><i></i>${isLive ? `LIVE · ${match.minute}` : match.status}</span>
                </div>

                <div class="match-page__teams">
                    <div class="match-page__team">
                        <div class="match-page__logo"><img src="${match.home.logo}" alt="${match.home.name} logo"></div>
                        <h1>${match.home.name}</h1>
                        <span class="match-page__team-label">HOME</span>
                    </div>

                    <div class="match-page__center">
                        <span class="match-page__match-label">${isLive ? "MATCH IN PLAY" : "MATCH"}</span>
                        <div class="match-page__score"><span>${match.home.score ?? "–"}</span><b>:</b><span>${match.away.score ?? "–"}</span></div>
                        <span class="match-page__time">${match.time}</span>
                    </div>

                    <div class="match-page__team">
                        <div class="match-page__logo"><img src="${match.away.logo}" alt="${match.away.name} logo"></div>
                        <h1>${match.away.name}</h1>
                        <span class="match-page__team-label">AWAY</span>
                    </div>
                </div>
            </div>

            <div class="match-page__tabs" role="tablist" aria-label="Match details">
                <button class="match-page__tab is-active" type="button" data-panel="overview">Overview</button>
                <button class="match-page__tab" type="button" data-panel="events">Events</button>
                <button class="match-page__tab" type="button" data-panel="stats">Statistics</button>
                <button class="match-page__tab" type="button" data-panel="lineups">Lineups</button>
            </div>

            <section class="match-page__content match-page__content--active" data-content="overview">
                <div class="match-page__panel match-page__panel--wide">
                    <div class="match-page__panel-head"><div><span class="match-page__panel-label">MATCH CENTER</span><h2>Match Overview</h2></div><span class="match-page__mini-status">${isLive ? "LIVE" : match.status}</span></div>
                    <div class="match-page__overview">
                        <div><strong>${match.home.score ?? "–"}</strong><span>${match.home.name}</span></div>
                        <div class="match-page__overview-divider"><span>VS</span></div>
                        <div><strong>${match.away.score ?? "–"}</strong><span>${match.away.name}</span></div>
                    </div>
                </div>
                <div class="match-page__panel"><span class="match-page__panel-label">STATUS</span><h2>${isLive ? "In progress" : state === "finished" ? "Full time" : "Coming up"}</h2><p>${isLive ? `The match is currently being played at ${match.minute}.` : state === "finished" ? "This match has finished." : `Kick-off is scheduled for ${match.time}.`}</p></div>
                <div class="match-page__panel"><span class="match-page__panel-label">NEXT DATA</span><h2>Match insights</h2><p>Goals, cards, substitutions and detailed statistics will appear here when the live match API is connected.</p></div>
            </section>

            <section class="match-page__content" data-content="events"><div class="match-page__empty"><span>⚽</span><h2>Match Events</h2><p>Goals, cards and substitutions will be shown here.</p></div></section>
            <section class="match-page__content" data-content="stats"><div class="match-page__empty"><span>◉</span><h2>Statistics</h2><p>Possession, shots, passes and other match statistics will be shown here.</p></div></section>
            <section class="match-page__content" data-content="lineups"><div class="match-page__empty"><span>XI</span><h2>Lineups</h2><p>Starting XI and substitutes will be shown here.</p></div></section>
        </section>
    `;

    app.querySelector(".match-page__back").addEventListener("click", () => {
        sessionStorage.removeItem("football-hub-selected-match");
        window.location.hash = "";
        window.location.reload();
    });

    const tabs = app.querySelectorAll(".match-page__tab");
    const contents = app.querySelectorAll(".match-page__content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const panel = tab.dataset.panel;
            tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
            contents.forEach((content) => content.classList.toggle("match-page__content--active", content.dataset.content === panel));
        });
    });
}

export default createMatchPage;
