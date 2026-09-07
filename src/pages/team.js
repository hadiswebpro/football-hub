import { getTeam, getTeamFixtures, getTeamRecentFixtures } from "../api/team";
import getTeamSquad from "../api/teamSquad";
import createMatchCard from "../components/matchcard";

const SELECTED_TEAM_KEY = "football-hub-selected-team";
const FAVORITES_KEY = "football-hub-favorite-teams";

function getSelectedTeam() { try { return JSON.parse(sessionStorage.getItem(SELECTED_TEAM_KEY)); } catch { return null; } }
function getFavorites() { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { return []; } }
function toggleFavorite(id) { const ids = getFavorites(); const index = ids.indexOf(id); if (index === -1) ids.push(id); else ids.splice(index, 1); localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); return ids.includes(id); }

function normalizeFixture(fixture) {
    const status = fixture.fixture?.status?.short;
    const live = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(status);
    const finished = ["FT", "AET", "PEN"].includes(status);
    return { fixtureId: fixture.fixture?.id, league: fixture.league?.name ?? "Football", status: live ? "LIVE" : finished ? "FINISHED" : "SCHEDULED", minute: fixture.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "", time: live ? "Live now" : new Date(fixture.fixture?.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: fixture.fixture?.date ?? "", home: { name: fixture.teams?.home?.name ?? "Home", score: fixture.goals?.home ?? null, logo: fixture.teams?.home?.logo ?? "" }, away: { name: fixture.teams?.away?.name ?? "Away", score: fixture.goals?.away ?? null, logo: fixture.teams?.away?.logo ?? "" } };
}

function renderMatches(container, fixtures, emptyText) {
    container.innerHTML = "";
    const matches = fixtures.map(normalizeFixture).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!matches.length) { container.innerHTML = `<div class="team-page__empty">${emptyText}</div>`; return; }
    matches.forEach((match) => container.appendChild(createMatchCard(match)));
}

function getSquadGroups(players) {
    const groups = { Goalkeepers: [], Defenders: [], Midfielders: [], Attackers: [] };
    players.forEach((player) => { const position = (player.position ?? "").toLowerCase(); if (position.includes("goalkeeper")) groups.Goalkeepers.push(player); else if (position.includes("defender")) groups.Defenders.push(player); else if (position.includes("midfielder")) groups.Midfielders.push(player); else if (position.includes("attacker") || position.includes("forward")) groups.Attackers.push(player); });
    return groups;
}

function renderSquad(target, players) {
    if (!players.length) { target.innerHTML = `<div class="team-page__empty"><h2>No squad data</h2><p>There is no player data available for this team.</p></div>`; return; }
    const groups = getSquadGroups(players);
    const sections = Object.entries(groups).filter(([, group]) => group.length).map(([title, group]) => `<section class="team-page__squad-group"><div class="team-page__squad-group-heading"><div><span>TEAM SQUAD</span><h3>${title}</h3></div><strong>${group.length}</strong></div><div class="team-page__player-grid">${group.map((player) => `<article class="team-page__player-card"><div class="team-page__player-photo"><img src="${player.photo ?? ""}" alt="${player.name ?? "Player"}" loading="lazy"><span>${player.number ?? "—"}</span></div><div class="team-page__player-info"><h4>${player.name ?? "Unknown Player"}</h4><p>${player.position ?? title}</p></div></article>`).join("")}</div></section>`).join("");
    target.innerHTML = sections || `<div class="team-page__empty"><h2>Squad positions unavailable</h2><p>Player data was returned, but positions could not be grouped.</p></div>`;
}

function calculatePerformance(fixtures, teamId) {
    const finished = fixtures.filter((item) => ["FT", "AET", "PEN"].includes(item.fixture?.status?.short));
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    finished.forEach((item) => { const isHome = item.teams?.home?.id === teamId; const scored = isHome ? item.goals?.home : item.goals?.away; const conceded = isHome ? item.goals?.away : item.goals?.home; goalsFor += Number(scored) || 0; goalsAgainst += Number(conceded) || 0; if (scored > conceded) wins++; else if (scored === conceded) draws++; else losses++; });
    return { played: finished.length, wins, draws, losses, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst };
}

function renderPerformance(target, performance) {
    const items = [["MATCHES", performance.played], ["WINS", performance.wins], ["DRAWS", performance.draws], ["LOSSES", performance.losses], ["GOALS FOR", performance.goalsFor], ["GOALS AGAINST", performance.goalsAgainst], ["GOAL DIFF", performance.goalDifference > 0 ? `+${performance.goalDifference}` : performance.goalDifference]];
    target.innerHTML = items.map(([label, value]) => `<div class="team-page__performance-card"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function createTeamPage() {
    const app = document.querySelector("#app");
    const selected = getSelectedTeam();
    if (!app) return;
    if (!selected?.id) { app.innerHTML = `<div class="team-page__empty"><h2>Team not found</h2><p>Select a team from the Teams page.</p><button type="button" data-back>Back to Teams</button></div>`; app.querySelector("[data-back]").onclick = () => { window.location.hash = "#teams"; }; return; }

    const favorite = getFavorites().includes(selected.id);
    app.innerHTML = `<section class="team-page"><button class="team-page__back" type="button" data-back>← Back to Teams</button><div class="team-page__hero"><div class="team-page__identity"><div class="team-page__logo"><img src="${selected.logo ?? ""}" alt="${selected.name ?? "Team"} logo"></div><div><span>CLUB PROFILE</span><h1>${selected.name ?? "Team"}</h1><p>${selected.country ?? "International"}${selected.league ? ` · ${selected.league}` : ""}</p></div></div><button class="team-page__favorite ${favorite ? "is-favorite" : ""}" type="button" data-favorite aria-pressed="${favorite}">${favorite ? "★ Favorited" : "☆ Favorite"}</button></div><div class="team-page__stats" data-stats><div><span>COUNTRY</span><strong>Loading…</strong></div><div><span>TEAM ID</span><strong>#${selected.id}</strong></div><div><span>TYPE</span><strong>Club</strong></div></div><section class="team-page__section"><div class="team-page__heading"><span>TEAM FORM</span><h2>Performance</h2><p>Recent results from the fixtures available for this team.</p></div><div class="team-page__performance" data-performance><div class="team-page__empty">Loading statistics…</div></div></section><section class="team-page__section"><div class="team-page__heading"><span>MATCH CENTER</span><h2>Team Matches</h2><p>Upcoming fixtures and recent results for this club.</p></div><div class="team-page__tabs"><button class="is-active" data-view="upcoming" type="button">Upcoming</button><button data-view="recent" type="button">Recent Results</button></div><div class="team-page__matches" data-upcoming>Loading matches…</div><div class="team-page__matches" data-recent hidden>Loading results…</div></section><section class="team-page__section team-page__squad-section"><div class="team-page__heading"><span>CLUB ROSTER</span><h2>Squad</h2><p>Players currently listed in this team's squad.</p></div><div class="team-page__squad" data-squad><div class="team-page__empty">Loading squad…</div></div></section></section>`;

    app.querySelector("[data-back]").onclick = () => { sessionStorage.removeItem(SELECTED_TEAM_KEY); window.location.hash = "#teams"; };
    app.querySelector("[data-favorite]").onclick = (event) => { const active = toggleFavorite(selected.id); event.currentTarget.classList.toggle("is-favorite", active); event.currentTarget.textContent = active ? "★ Favorited" : "☆ Favorite"; event.currentTarget.setAttribute("aria-pressed", String(active)); };
    app.querySelectorAll("[data-view]").forEach((button) => { button.onclick = () => { const recent = button.dataset.view === "recent"; app.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("is-active", item === button)); app.querySelector("[data-upcoming]").hidden = recent; app.querySelector("[data-recent]").hidden = !recent; }; });

    (async () => {
        try {
            const data = await getTeam(selected.id);
            const team = data.response?.[0]?.team ?? selected;
            app.querySelector("[data-stats]").innerHTML = `<div><span>COUNTRY</span><strong>${team.country ?? "International"}</strong></div><div><span>TEAM ID</span><strong>#${team.id ?? selected.id}</strong></div><div><span>TYPE</span><strong>${team.national ? "National" : "Club"}</strong></div>`;
        } catch { app.querySelector("[data-stats]").innerHTML = `<div><span>STATUS</span><strong>API unavailable</strong></div>`; }

        let recentFixtures = [];
        try {
            const season = new Date().getFullYear();
            const [upcomingData, recentData] = await Promise.all([getTeamFixtures(selected.id, season, 12), getTeamRecentFixtures(selected.id, season, 12)]);
            const finished = ["FT", "AET", "PEN"];
            recentFixtures = recentData.response ?? [];
            renderMatches(app.querySelector("[data-upcoming]"), (upcomingData.response ?? []).filter((item) => !finished.includes(item.fixture?.status?.short)), "No upcoming matches found.");
            renderMatches(app.querySelector("[data-recent]"), recentFixtures.filter((item) => finished.includes(item.fixture?.status?.short)).reverse(), "No recent results found.");
            renderPerformance(app.querySelector("[data-performance]"), calculatePerformance(recentFixtures, selected.id));
        } catch { app.querySelector("[data-upcoming]").innerHTML = `<div class="team-page__empty">Could not load team matches. Please check your API key.</div>`; app.querySelector("[data-recent]").innerHTML = `<div class="team-page__empty">Could not load team results. Please check your API key.</div>`; app.querySelector("[data-performance]").innerHTML = `<div class="team-page__empty">Could not load team statistics. Please check your API key.</div>`; }

        try { const data = await getTeamSquad(selected.id); renderSquad(app.querySelector("[data-squad]"), data.response?.[0]?.players ?? []); } catch { app.querySelector("[data-squad]").innerHTML = `<div class="team-page__empty"><h2>Could not load squad</h2><p>Please check your API key and try again.</p></div>`; }
    })();
}

export default createTeamPage;
