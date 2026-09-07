import {
    getFixtureDetails,
    getFixtureEvents,
    getFixtureStatistics,
    getFixtureLineups
} from "../api/matches";

function getSelectedMatch() {
    try {
        return JSON.parse(sessionStorage.getItem("football-hub-selected-match"));
    } catch {
        return null;
    }
}

function createEventRows(events) {
    if (!events.length) return `<div class="match-page__empty match-page__empty--small"><span>⚽</span><h2>No events yet</h2><p>There are no recorded events for this match.</p></div>`;

    return `<div class="match-page__event-list">${events.map((event) => `
        <div class="match-page__event">
            <strong>${event.time?.elapsed ?? "–"}'${event.time?.extra ? `+${event.time.extra}` : ""}</strong>
            <span class="match-page__event-icon">${event.type === "Card" ? "▰" : event.type === "subst" ? "↕" : "⚽"}</span>
            <div><b>${event.player?.name ?? event.type}</b><small>${event.detail ?? ""}${event.team?.name ? ` · ${event.team.name}` : ""}</small></div>
        </div>`).join("")}</div>`;
}

function createStatsRows(statistics, homeName, awayName) {
    if (!statistics?.teams) return `<div class="match-page__empty match-page__empty--small"><span>◉</span><h2>No statistics available</h2><p>Statistics are not available for this fixture yet.</p></div>`;

    const homeStats = statistics.teams[0]?.statistics ?? [];
    const awayStats = statistics.teams[1]?.statistics ?? [];
    const values = new Map(homeStats.map((item, index) => [item.type, [item.value, awayStats[index]?.value]]));

    return `<div class="match-page__stats"><div class="match-page__stats-head"><span>${homeName}</span><b>STATISTICS</b><span>${awayName}</span></div>${[...values.entries()].map(([name, [home, away]]) => `
        <div class="match-page__stat"><strong>${home ?? "–"}</strong><div><span>${name}</span><div class="match-page__stat-bar"><i style="width:${typeof home === "number" && typeof away === "number" && home + away ? (home / (home + away)) * 100 : 50}%"></i></div></div><strong>${away ?? "–"}</strong></div>`).join("")}</div>`;
}

function createLineupRows(lineups) {
    if (!lineups.length) return `<div class="match-page__empty match-page__empty--small"><span>XI</span><h2>Lineups unavailable</h2><p>Lineups will appear when the provider returns them.</p></div>`;

    return `<div class="match-page__lineups">${lineups.map((team) => `
        <div class="match-page__lineup"><div class="match-page__lineup-head"><img src="${team.team?.logo ?? ""}" alt=""><div><h3>${team.team?.name ?? "Team"}</h3><span>${team.formation ?? "Formation unavailable"}</span></div></div><div class="match-page__players">${(team.startXI ?? []).map(({ player }) => `<span><b>${player.number ?? ""}</b>${player.name}</span>`).join("")}</div></div>`).join("")}</div>`;
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
                <div class="match-page__field" aria-hidden="true"><span class="match-page__field-line match-page__field-line--center"></span><span class="match-page__field-circle"></span><span class="match-page__field-line match-page__field-line--left"></span><span class="match-page__field-line match-page__field-line--right"></span></div>
                <div class="match-page__glow" aria-hidden="true"></div>
                <div class="match-page__heading"><span class="match-page__eyebrow">${match.league}</span><span class="match-page__status"><i></i>${isLive ? `LIVE · ${match.minute}` : match.status}</span></div>
                <div class="match-page__teams">
                    <div class="match-page__team"><div class="match-page__logo"><img src="${match.home.logo}" alt="${match.home.name} logo"></div><h1>${match.home.name}</h1><span class="match-page__team-label">HOME</span></div>
                    <div class="match-page__center"><span class="match-page__match-label">${isLive ? "MATCH IN PLAY" : "MATCH"}</span><div class="match-page__score"><span>${match.home.score ?? "–"}</span><b>:</b><span>${match.away.score ?? "–"}</span></div><span class="match-page__time">${match.time}</span></div>
                    <div class="match-page__team"><div class="match-page__logo"><img src="${match.away.logo}" alt="${match.away.name} logo"></div><h1>${match.away.name}</h1><span class="match-page__team-label">AWAY</span></div>
                </div>
            </div>
            <div class="match-page__tabs" role="tablist" aria-label="Match details">
                <button class="match-page__tab is-active" type="button" data-panel="overview">Overview</button><button class="match-page__tab" type="button" data-panel="events">Events</button><button class="match-page__tab" type="button" data-panel="stats">Statistics</button><button class="match-page__tab" type="button" data-panel="lineups">Lineups</button>
            </div>
            <section class="match-page__content match-page__content--active" data-content="overview">
                <div class="match-page__panel match-page__panel--wide"><div class="match-page__panel-head"><div><span class="match-page__panel-label">MATCH CENTER</span><h2>Match Overview</h2></div><span class="match-page__mini-status">${isLive ? "LIVE" : match.status}</span></div><div class="match-page__overview"><div><strong>${match.home.score ?? "–"}</strong><span>${match.home.name}</span></div><div class="match-page__overview-divider"><span>VS</span></div><div><strong>${match.away.score ?? "–"}</strong><span>${match.away.name}</span></div></div></div>
                <div class="match-page__panel"><span class="match-page__panel-label">STATUS</span><h2>${isLive ? "In progress" : state === "finished" ? "Full time" : "Coming up"}</h2><p>${isLive ? `The match is currently being played at ${match.minute}.` : state === "finished" ? "This match has finished." : `Kick-off is scheduled for ${match.time}.`}</p></div>
                <div class="match-page__panel"><span class="match-page__panel-label">LIVE DATA</span><h2>Football intelligence</h2><p>Open Events, Statistics or Lineups to load the corresponding fixture data.</p></div>
            </section>
            <section class="match-page__content" data-content="events"><div class="match-page__loading">Loading events…</div></section>
            <section class="match-page__content" data-content="stats"><div class="match-page__loading">Loading statistics…</div></section>
            <section class="match-page__content" data-content="lineups"><div class="match-page__loading">Loading lineups…</div></section>
        </section>
    `;

    app.querySelector(".match-page__back").addEventListener("click", () => {
        sessionStorage.removeItem("football-hub-selected-match");
        window.location.hash = "#matches";
    });

    const loaded = new Set();
    const loadTab = async (panel) => {
        if (loaded.has(panel) || !match.fixtureId) return;
        loaded.add(panel);
        const target = app.querySelector(`[data-content="${panel}"]`);
        try {
            if (panel === "events") {
                target.innerHTML = `<div class="match-page__panel match-page__panel--wide"><span class="match-page__panel-label">TIMELINE</span><h2>Match Events</h2>${createEventRows(await getFixtureEvents(match.fixtureId))}</div>`;
            } else if (panel === "stats") {
                const data = await getFixtureStatistics(match.fixtureId);
                target.innerHTML = `<div class="match-page__panel match-page__panel--wide"><span class="match-page__panel-label">PERFORMANCE</span><h2>Match Statistics</h2>${createStatsRows(data, match.home.name, match.away.name)}</div>`;
            } else if (panel === "lineups") {
                target.innerHTML = `<div class="match-page__panel match-page__panel--wide"><span class="match-page__panel-label">SQUADS</span><h2>Starting Lineups</h2>${createLineupRows(await getFixtureLineups(match.fixtureId))}</div>`;
            }
        } catch (error) {
            target.innerHTML = `<div class="match-page__empty match-page__empty--small"><span>!</span><h2>Could not load data</h2><p>Please check your API key and try again.</p></div>`;
        }
    };

    app.querySelectorAll(".match-page__tab").forEach((tab) => tab.addEventListener("click", () => {
        const panel = tab.dataset.panel;
        app.querySelectorAll(".match-page__tab").forEach((item) => item.classList.toggle("is-active", item === tab));
        app.querySelectorAll(".match-page__content").forEach((content) => content.classList.toggle("match-page__content--active", content.dataset.content === panel));
        loadTab(panel);
    }));

    if (isLive) {
        const refresh = setInterval(async () => {
            if (!document.querySelector(".match-page")) return clearInterval(refresh);
            try {
                const latest = await getFixtureDetails(match.fixtureId);
                const fixture = latest?.fixture;
                if (!fixture) return;

                match.home.score = fixture.goals?.home;
                match.away.score = fixture.goals?.away;
                match.minute = fixture.status?.elapsed ? `${fixture.status.elapsed}'` : match.minute;

                app.querySelector(".match-page__score").innerHTML = `<span>${match.home.score ?? "–"}</span><b>:</b><span>${match.away.score ?? "–"}</span>`;
                app.querySelector(".match-page__status").innerHTML = `<i></i>LIVE · ${match.minute}`;
            } catch { /* keep the current score when refresh fails */ }
        }, 60000);
    }
}

export default createMatchPage;
