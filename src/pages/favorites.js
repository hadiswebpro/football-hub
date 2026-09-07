import getCompetitions from "../api/competitions";
import { getTeam } from "../api/team";
import createLeagueCard from "../components/leagueCard";
import createTeamCard from "../components/teamCard";

const TEAM_FAVORITES_KEY = "football-hub-favorite-teams";
const LEAGUE_FAVORITES_KEY = "football-hub-favorite-leagues";

function readIds(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

async function loadFavoriteTeams(ids) {
    const results = await Promise.all(ids.map(async (id) => {
        try {
            const data = await getTeam(id);
            const team = data.response?.[0]?.team;
            if (!team) return null;
            return {
                id: team.id,
                name: team.name ?? "Team",
                country: team.country ?? "International",
                logo: team.logo ?? ""
            };
        } catch {
            return null;
        }
    }));
    return results.filter(Boolean);
}

async function loadFavoriteLeagues(ids) {
    try {
        const data = await getCompetitions();
        return (data.response ?? []).filter((item) => ids.includes(item.league?.id));
    } catch {
        return [];
    }
}

function createFavoritesPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `
        <section class="favorites-page">
            <div class="favorites-page__heading">
                <span class="section-heading__eyebrow">YOUR COLLECTION</span>
                <h1>Favorites</h1>
                <p>Your favorite teams and leagues, all in one place.</p>
            </div>
            <section class="favorites-page__section">
                <div class="favorites-page__section-head"><div><span>TEAMS</span><h2>Favorite Teams</h2></div><strong data-team-count>0</strong></div>
                <div class="favorites-page__grid favorites-page__grid--teams" data-favorite-teams></div>
            </section>
            <section class="favorites-page__section">
                <div class="favorites-page__section-head"><div><span>COMPETITIONS</span><h2>Favorite Leagues</h2></div><strong data-league-count>0</strong></div>
                <div class="favorites-page__grid favorites-page__grid--leagues" data-favorite-leagues></div>
            </section>
        </section>
    `;

    const teamsTarget = app.querySelector("[data-favorite-teams]");
    const leaguesTarget = app.querySelector("[data-favorite-leagues]");
    const teamCount = app.querySelector("[data-team-count]");
    const leagueCount = app.querySelector("[data-league-count]");
    const teamIds = readIds(TEAM_FAVORITES_KEY);
    const leagueIds = readIds(LEAGUE_FAVORITES_KEY);

    teamCount.textContent = teamIds.length;
    leagueCount.textContent = leagueIds.length;

    const renderEmpty = (target, title, text) => {
        target.innerHTML = `<div class="favorites-page__empty"><span>★</span><h3>${title}</h3><p>${text}</p></div>`;
    };

    if (!teamIds.length) {
        renderEmpty(teamsTarget, "No favorite teams yet", "Tap the star on any team card to save it here.");
    } else {
        teamsTarget.innerHTML = `<div class="favorites-page__loading">Loading favorite teams…</div>`;
        loadFavoriteTeams(teamIds).then((teams) => {
            teamCount.textContent = teams.length;
            if (!teams.length) renderEmpty(teamsTarget, "No favorite teams found", "Your saved teams could not be loaded.");
            else {
                teamsTarget.innerHTML = "";
                teams.forEach((team) => teamsTarget.appendChild(createTeamCard(team)));
            }
        });
    }

    if (!leagueIds.length) {
        renderEmpty(leaguesTarget, "No favorite leagues yet", "Tap the star on any league card to save it here.");
    } else {
        leaguesTarget.innerHTML = `<div class="favorites-page__loading">Loading favorite leagues…</div>`;
        loadFavoriteLeagues(leagueIds).then((leagues) => {
            leagueCount.textContent = leagues.length;
            if (!leagues.length) renderEmpty(leaguesTarget, "No favorite leagues found", "Your saved leagues could not be loaded.");
            else {
                leaguesTarget.innerHTML = "";
                leagues.forEach((league) => leaguesTarget.appendChild(createLeagueCard(league)));
            }
        });
    }
}

export default createFavoritesPage;
