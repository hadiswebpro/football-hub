import getCompetitions from "../api/competitions";
import { getTeam } from "../api/team";
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

async function loadLegacyTeams(ids) {
    const results = await Promise.allSettled(ids.map((id) => getTeam(id)));
    return results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value?.response?.[0])
        .filter(Boolean)
        .map((item) => ({
            id: Number(item.team?.id),
            name: item.team?.name ?? "Team",
            country: item.team?.country ?? "International",
            league: "",
            logo: item.team?.logo ?? ""
        }));
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
    const legacyTeamIds = savedTeams
        .filter((item) => typeof item === "number" || typeof item === "string")
        .map(Number)
        .filter(Number.isFinite);
    const leagueIds = savedLeagues.map(Number).filter(Number.isFinite);

    const renderEmpty = (target, title, text) => {
        target.innerHTML = `<div class="favorites-page__empty"><span>★</span><h3>${title}</h3><p>${text}</p></div>`;
    };

    teamCount.textContent = favoriteTeams.length + legacyTeamIds.length;
    leagueCount.textContent = leagueIds.length;

    if (favoriteTeams.length || legacyTeamIds.length) {
        teamsTarget.innerHTML = "";
        favoriteTeams.forEach((team) => teamsTarget.appendChild(createTeamCard(team)));

        if (legacyTeamIds.length) {
            const loading = document.createElement("div");
            loading.className = "favorites-page__loading";
            loading.textContent = "Restoring older favorite teams…";
            teamsTarget.appendChild(loading);

            loadLegacyTeams(legacyTeamIds).then((legacyTeams) => {
                loading.remove();
                legacyTeams.forEach((team) => teamsTarget.appendChild(createTeamCard(team)));

                const allTeams = [...favoriteTeams, ...legacyTeams];
                localStorage.setItem(TEAM_FAVORITES_KEY, JSON.stringify(allTeams));
                teamCount.textContent = allTeams.length;

                if (!allTeams.length) {
                    renderEmpty(teamsTarget, "No favorite teams yet", "Tap the star on any team card to save it here.");
                }
            });
        }
    } else {
        renderEmpty(teamsTarget, "No favorite teams yet", "Tap the star on any team card to save it here.");
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
