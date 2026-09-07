import getCompetitions from "../api/competitions";
import createLeagueCard from "../components/leagueCard";
import createTeamCard from "../components/teamCard";

const TEAM_FAVORITES_KEY = "football-hub-favorite-teams";
const LEAGUE_FAVORITES_KEY = "football-hub-favorite-leagues";

function readFavorites(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function normalizeFavoriteTeam(item) {
    if (typeof item === "number" || typeof item === "string") return null;
    if (!item?.id) return null;
    return {
        id: Number(item.id),
        name: item.name ?? "Team",
        country: item.country ?? "International",
        league: item.league ?? "",
        logo: item.logo ?? ""
    };
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
    const savedTeams = readFavorites(TEAM_FAVORITES_KEY);
    const savedLeagues = readFavorites(LEAGUE_FAVORITES_KEY);
    const favoriteTeams = savedTeams.map(normalizeFavoriteTeam).filter(Boolean);
    const legacyTeamIds = savedTeams.filter((item) => typeof item === "number" || typeof item === "string").map(Number);
    const leagueIds = savedLeagues.map(Number).filter(Number.isFinite);

    teamCount.textContent = favoriteTeams.length + legacyTeamIds.length;
    leagueCount.textContent = leagueIds.length;

    const renderEmpty = (target, title, text) => {
        target.innerHTML = `<div class="favorites-page__empty"><span>★</span><h3>${title}</h3><p>${text}</p></div>`;
    };

    if (!favoriteTeams.length) {
        if (legacyTeamIds.length) {
            renderEmpty(teamsTarget, "Older favorites", "Reopen these teams from the Teams directory to refresh their saved information.");
        } else {
            renderEmpty(teamsTarget, "No favorite teams yet", "Tap the star on any team card to save it here.");
        }
    } else {
        teamsTarget.innerHTML = "";
        favoriteTeams.forEach((team) => teamsTarget.appendChild(createTeamCard(team)));
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
