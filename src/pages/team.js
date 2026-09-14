import { getLiveMatches, getFixtureLineups } from "../api/matches";
import { getTeam, getTeamFixtures, getTeamRecentFixtures } from "../api/team";
import { getCurrentSeason } from "../api/seasons";
import getTeamSquad from "../api/teamSquad";
import createMatchCard from "../components/matchcard";

const SELECTED_TEAM_KEY = "football-hub-selected-team";
const FAVORITES_KEY = "football-hub-favorite-teams";
const TEHRAN_TIMEZONE = "Asia/Tehran";
const FINISHED_STATUSES = ["FT", "AET", "PEN"];
const LIVE_STATUSES = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];

function getSelectedTeam() {
    try { return JSON.parse(sessionStorage.getItem(SELECTED_TEAM_KEY)); } catch { return null; }
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { return []; }
}

function toggleFavorite(team) {
    const favorites = getFavorites();
    const id = Number(team.id);
    const index = favorites.findIndex((item) => Number(item?.id ?? item) === id);
    if (index === -1) favorites.push({ id, name: team.name, country: team.country ?? "International", league: team.league ?? "", logo: team.logo ?? "" });
    else favorites.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites.some((item) => Number(item?.id ?? item) === id);
}

function formatMatchTime(date) {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString("en-GB", { timeZone: TEHRAN_TIMEZONE, hour: "2-digit", minute: "2-digit" });
}

function formatMatchDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", { timeZone: TEHRAN_TIMEZONE, day: "2-digit", month: "short", year: "numeric" });
}

function normalizeFixture(fixture) {
    const status = fixture.fixture?.status?.short;
    const live = LIVE_STATUSES.includes(status);
    const finished = FINISHED_STATUSES.includes(status);
    return {
        fixtureId: fixture.fixture?.id,
        league: fixture.league?.name ?? "Football",
        status: live ? "LIVE" : finished ? "FINISHED" : "SCHEDULED",
        minute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "",
        time: live ? "Live now" : formatMatchTime(fixture.fixture?.date),
        date: fixture.fixture?.date ?? "",
        dateLabel: formatMatchDate(fixture.fixture?.date),
        home: { id: fixture.teams?.home?.id, name: fixture.teams?.home?.name ?? "Home", score: fixture.goals?.home ?? null, logo: fixture.teams?.home?.logo ?? "" },
        away: { id: fixture.teams?.away?.id, name: fixture.teams?.away?.name ?? "Away", score: fixture.goals?.away ?? null, logo: fixture.teams?.away?.logo ?? "" }
    };
}

function renderMatches(container, fixtures, emptyText, sortDirection = "asc") {
    container.innerHTML = "";
    const matches = fixtures.map(normalizeFixture).sort((a, b) => sortDirection === "desc" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    if (!matches.length) { container.innerHTML = `<div class="team-page__empty">${emptyText}</div>`; return; }
    matches.forEach((match) => container.appendChild(createMatchCard(match)));
}

function getSquadGroups(players) {
    const groups = { Goalkeepers: [], Defenders: [], Midfielders: [], Attackers: [] };
    players.forEach((player) => {
        const position = (player.position ?? "").toLowerCase();
        if (position.includes("goalkeeper")) groups.Goalkeepers.push(player);
        else if (position.includes("defender")) groups.Defenders.push(player);
        else if (position.includes("midfielder")) groups.Midfielders.push(player);
        else if (position.includes("attacker") || position.includes("forward")) groups.Attackers.push(player);
    });
    return groups;
}

function renderSquad(target, players) {
    if (!players.length) { target.innerHTML = `<div class="team-page__empty"><h2>No squad data</h2><p>There is no player data available for this team.</p></div>`; return; }
    const groups = getSquadGroups(players);
    const sections = Object.entries(groups).filter(([, group]) => group.length).map(([title, group]) => `<section class="team-page__squad-group"><div class="team-page__squad-group-heading"><div><span>TEAM SQUAD</span><h3>${title}</h3></div><strong>${group.length}</strong></div><div class="team-page__player-grid">${group.map((player) => `<article class="team-page__player-card"><div class="team-page__player-photo"><img src="${player.photo ?? ""}" alt="${player.name ?? "Player"}" loading="lazy"><span>${player.number ?? "—"}</span></div><div class="team-page__player-info"><h4>${player.name ?? "Unknown Player"}</h4><p>${player.position ?? title}</p></div></article>`).join("")}</div></section>`).join("");
    target.innerHTML = sections || `<div class="team-page__empty"><h2>Squad positions unavailable</h2><p>Player data was returned, but positions could not be grouped.</p></div>`;
}

function calculatePerformance(fixtures, teamId) {
    const finished = fixtures.filter((item) => FINISHED_STATUSES.includes(item.fixture?.status?.short));
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    finished.forEach((item) => {
        const isHome = Number(item.teams?.home?.id) === Number(teamId);
        const scored = Number(isHome ? item.goals?.home : item.goals?.away);
        const conceded = Number(isHome ? item.goals?.away : item.goals?.home);
        goalsFor += Number.isFinite(scored) ? scored : 0;
        goalsAgainst += Number.isFinite(conceded) ? conceded : 0;
        if (scored > conceded) wins++;
        else if (scored === conceded) draws++;
        else losses++;
    });
    return { played: finished.length, wins, draws, losses, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst };
}

function renderPerformance(target, performance) {
    const items = [["MATCHES", performance.played], ["WINS", performance.wins], ["DRAWS", performance.draws], ["LOSSES", performance.losses], ["GOALS FOR", performance.goalsFor], ["GOALS AGAINST", performance.goalsAgainst], ["GOAL DIFF", performance.goalDifference > 0 ? `+${performance.goalDifference}` : performance.goalDifference]];
    target.innerHTML = items.map(([label, value]) => `<div class="team-page__performance-card"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function renderLineup(target, lineup, teamId) {
    const teamLineup = (lineup ?? []).find((item) => Number(item.team?.id) === Number(teamId)) ?? lineup?.[0];
    if (!teamLineup) { target.innerHTML = `<div class="team-page__empty">No lineup data is available for the latest match.</div>`; return; }
    const starters = (teamLineup.startXI ?? []).slice(0, 11);
    const substitutes = (teamLineup.substitutes ?? []).slice(0, 7);
    target.innerHTML = `<div class="team-page__lineup-card"><div class="team-page__lineup-meta"><strong>${teamLineup.team?.name ?? "Latest lineup"}</strong><span>${teamLineup.formation ?? "Formation unavailable"}</span></div><div class="team-page__lineup-list"><div><span>STARTING XI</span>${starters.map((item) => `<div class="team-page__lineup-player"><span>${item.player?.number ?? "—"}</span><strong>${item.player?.name ?? "Player"}</strong><small>${item.pos ?? ""}</small></div>`).join("")}</div><div><span>SUBSTITUTES</span>${substitutes.map((item) => `<div class="team-page__lineup-player"><span>${item.player?.number ?? "—"}</span><strong>${item.player?.name ?? "Player"}</strong><small>${item.pos ?? ""}</small></div>`).join("")}</div></div></div>`;
}

function createTeamPage() {
    const app = document.querySelector("#app");
    let selected = getSelectedTeam();
    if (!app) return;
    if (!selected?.id) {
        app.innerHTML = `<div class="team-page__empty"><h2>Team not found</h2><p>Select a team from the Teams page.</p><button type="button" data-back>Back to Teams</button></div>`;
        app.querySelector("[data-back]").onclick = () => { window.location.hash = "#teams"; };
        return;
    }

    const favorite = getFavorites().some((item) => Number(item?.id ?? item) === Number(selected.id));
    app.innerHTML = `<section class="team-page"><button class="team-page__back" type="button" data-back>← Back to Teams</button><div class="team-page__hero"><div class="team-page__identity"><div class="team-page__logo"><img src="${selected.logo ?? ""}" alt="${selected.name ?? "Team"} logo"></div><div><span>CLUB PROFILE</span><h1>${selected.name ?? "Team"}</h1><p>${selected.country ?? "International"}${selected.league ? ` · ${selected.league}` : ""}</p></div></div><button class="team-page__favorite ${favorite ? "is-favorite" : ""}" type="button" data-favorite aria-pressed="${favorite}">${favorite ? "★ Favorited" : "☆ Favorite"}</button></div><div class="team-page__stats" data-stats><div><span>COUNTRY</span><strong>${selected.country ?? "International"}</strong></div><div><span>TEAM ID</span><strong>#${selected.id}</strong></div><div><span>TYPE</span><strong>Club</strong></div></div><section class="team-page__section"><div class="team-page__heading"><span>TEAM FORM</span><h2>Performance</h2><p>Recent results from the fixtures available for this team.</p></div><div class="team-page__performance" data-performance><div class="team-page__empty">Loading statistics…</div></div></section><section class="team-page__section"><div class="team-page__heading"><span>MATCH CENTER</span><h2>Team Matches</h2><p>Live matches, upcoming fixtures and recent results for this club.</p></div><div class="team-page__tabs"><button class="is-active" data-view="live" type="button">Live</button><button data-view="upcoming" type="button">Upcoming</button><button data-view="recent" type="button">Recent Results</button></div><div class="team-page__matches" data-live>Loading live matches…</div><div class="team-page__matches" data-upcoming hidden>Loading matches…</div><div class="team-page__matches" data-recent hidden>Loading results…</div></section><section class="team-page__section"><div class="team-page__heading"><span>LATEST LINEUP</span><h2>Lineup</h2><p>Starting XI and substitutes from the latest available match.</p></div><div class="team-page__lineup" data-lineup><div class="team-page__empty">Loading lineup…</div></div></section><section class="team-page__section team-page__squad-section"><div class="team-page__heading"><span>CLUB ROSTER</span><h2>Squad</h2><p>Players currently listed in this team's squad.</p></div><div class="team-page__squad" data-squad><div class="team-page__empty">Loading squad…</div></div></section></section>`;

    app.querySelector("[data-back]").onclick = () => { sessionStorage.removeItem(SELECTED_TEAM_KEY); window.location.hash = "#teams"; };
    app.querySelector("[data-favorite]").onclick = (event) => { const active = toggleFavorite(selected); event.currentTarget.classList.toggle("is-favorite", active); event.currentTarget.textContent = active ? "★ Favorited" : "☆ Favorite"; event.currentTarget.setAttribute("aria-pressed", String(active)); };
    app.querySelectorAll("[data-view]").forEach((button) => button.onclick = () => { const view = button.dataset.view; app.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("is-active", item === button)); app.querySelector("[data-live]").hidden = view !== "live"; app.querySelector("[data-upcoming]").hidden = view !== "upcoming"; app.querySelector("[data-recent]").hidden = view !== "recent"; });

    const squadTarget = app.querySelector("[data-squad]");
    getTeamSquad(selected.id).then((data) => renderSquad(squadTarget, data.response?.[0]?.players ?? [])).catch(() => { squadTarget.innerHTML = `<div class="team-page__empty"><h2>Squad unavailable</h2><p>Squad data is not available right now.</p></div>`; });

    (async () => {
        const [teamResult, seasonResult, liveResult] = await Promise.allSettled([
            getTeam(selected.id),
            selected.season ? Promise.resolve(Number(selected.season)) : selected.leagueId ? getCurrentSeason(selected.leagueId) : Promise.resolve(null),
            getLiveMatches()
        ]);

        if (teamResult.status === "fulfilled") {
            const apiTeam = teamResult.value?.response?.[0]?.team;
            if (apiTeam) {
                selected = { ...selected, name: apiTeam.name ?? selected.name, country: apiTeam.country ?? selected.country, logo: apiTeam.logo ?? selected.logo };
                sessionStorage.setItem(SELECTED_TEAM_KEY, JSON.stringify(selected));
                app.querySelector(".team-page__identity h1").textContent = selected.name;
                app.querySelector(".team-page__identity p").textContent = `${selected.country ?? "International"}${selected.league ? ` · ${selected.league}` : ""}`;
            }
        }

        const season = seasonResult.status === "fulfilled" ? Number(seasonResult.value) : null;
        if (season && !selected.season) {
            selected.season = season;
            sessionStorage.setItem(SELECTED_TEAM_KEY, JSON.stringify(selected));
        }

        if (!season) {
            app.querySelector("[data-live]").innerHTML = liveResult.status === "fulfilled" ? `<div class="team-page__empty">No live match for this team right now.</div>` : `<div class="team-page__empty">Could not load live matches right now.</div>`;
            app.querySelector("[data-upcoming]").innerHTML = `<div class="team-page__empty">Current season could not be resolved for this team.</div>`;
            app.querySelector("[data-recent]").innerHTML = `<div class="team-page__empty">Current season could not be resolved for this team.</div>`;
            app.querySelector("[data-performance]").innerHTML = `<div class="team-page__empty">Current season could not be resolved for this team.</div>`;
            app.querySelector("[data-lineup]").innerHTML = `<div class="team-page__empty">No lineup data is available.</div>`;
            return;
        }

        const teamId = Number(selected.id);
        const [liveMatches, upcomingResult, recentResult] = await Promise.allSettled([
            Promise.resolve(liveResult.status === "fulfilled" ? liveResult.value : getLiveMatches()),
            getTeamFixtures(teamId, season, 8),
            getTeamRecentFixtures(teamId, season, 8)
        ]);

        const liveData = liveMatches.status === "fulfilled" ? liveMatches.value : null;
        const upcomingData = upcomingResult.status === "fulfilled" ? upcomingResult.value : null;
        const recentData = recentResult.status === "fulfilled" ? recentResult.value : null;
        const live = (liveData?.response ?? []).filter((item) => Number(item.teams?.home?.id) === teamId || Number(item.teams?.away?.id) === teamId);
        const upcomingRaw = (upcomingData?.response ?? []).filter((item) => !FINISHED_STATUSES.includes(item.fixture?.status?.short) && !LIVE_STATUSES.includes(item.fixture?.status?.short));
        const recentRaw = (recentData?.response ?? []).filter((item) => FINISHED_STATUSES.includes(item.fixture?.status?.short));
        const liveIds = new Set(live.map((item) => item.fixture?.id));
        const upcoming = upcomingRaw.filter((item) => !liveIds.has(item.fixture?.id));

        renderMatches(app.querySelector("[data-live]"), live, liveMatches.status === "fulfilled" ? "No live match for this team right now." : "Could not load live matches right now.");
        renderMatches(app.querySelector("[data-upcoming]"), upcoming, upcomingResult.status === "fulfilled" ? "No upcoming matches found." : "Could not load upcoming matches right now.");
        renderMatches(app.querySelector("[data-recent]"), recentRaw, recentResult.status === "fulfilled" ? "No recent results found." : "Could not load recent results right now.", "desc");
        if (recentResult.status === "fulfilled") renderPerformance(app.querySelector("[data-performance]"), calculatePerformance(recentRaw, teamId));
        else app.querySelector("[data-performance]").innerHTML = `<div class="team-page__empty">Could not load team performance right now.</div>`;

        const latestFixture = recentRaw[0] ?? upcomingRaw[0];
        if (!latestFixture?.fixture?.id) {
            app.querySelector("[data-lineup]").innerHTML = `<div class="team-page__empty">No match is available to load a lineup from.</div>`;
            return;
        }
        try {
            const lineupData = await getFixtureLineups(latestFixture.fixture.id);
            renderLineup(app.querySelector("[data-lineup]"), lineupData.response ?? [], teamId);
        } catch {
            app.querySelector("[data-lineup]").innerHTML = `<div class="team-page__empty">Lineup data is not available for the latest match.</div>`;
        }
    })().catch(() => {
        app.querySelector("[data-live]").innerHTML = `<div class="team-page__empty">Could not load live matches right now.</div>`;
        app.querySelector("[data-upcoming]").innerHTML = `<div class="team-page__empty">Could not load upcoming matches right now.</div>`;
        app.querySelector("[data-recent]").innerHTML = `<div class="team-page__empty">Could not load recent results right now.</div>`;
        app.querySelector("[data-performance]").innerHTML = `<div class="team-page__empty">Could not load team performance right now.</div>`;
        app.querySelector("[data-lineup]").innerHTML = `<div class="team-page__empty">Could not load lineup right now.</div>`;
    });
}

export default createTeamPage;
