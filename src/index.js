import "./styles/main.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/cards.css";
import "./styles/match-page.css";
import "./styles/matches-page.css";
import "./styles/league-page.css";
import "./styles/league-teams.css";
import "./styles/team-page.css";
import "./styles/directory-page.css";
import "./styles/home-sections.css";
import "./styles/favorites-page.css";
import "./styles/search-page.css";
import "./styles/responsive.css";

import createHeader from "./components/header";
import loadCompetitions from "./pages/home";
import createMatchPage from "./pages/match";
import createMatchesPage from "./pages/matches";
import createLeaguePage from "./pages/league";
import createTeamPage from "./pages/team";
import createTeamsPage from "./pages/teams";
import createLeaguesPage from "./pages/leagues";
import createFavoritesPage from "./pages/favorites";
import createSearchPage from "./pages/search";

createHeader();

function renderRoute() {
    const hash = window.location.hash;
    if (hash === "#match") { createMatchPage(); return; }
    if (hash === "#matches") { createMatchesPage(); return; }
    if (hash === "#league") { createLeaguePage(); return; }
    if (hash === "#team") { createTeamPage(); return; }
    if (hash === "#teams") { createTeamsPage(); return; }
    if (hash === "#leagues") { createLeaguesPage(); return; }
    if (hash === "#favorites") { createFavoritesPage(); return; }
    if (hash.startsWith("#search")) { createSearchPage(); return; }
    loadCompetitions();
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
