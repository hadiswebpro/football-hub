import "./styles/main.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/cards.css";
import "./styles/match-page.css";
import "./styles/matches-page.css";
import "./styles/league-page.css";
import "./styles/league-teams.css";
import "./styles/team-page.css";
import "./styles/responsive.css";

import createHeader from "./components/header";
import loadCompetitions from "./pages/home";
import createMatchPage from "./pages/match";
import createMatchesPage from "./pages/matches";
import createLeaguePage from "./pages/league";
import createTeamPage from "./pages/team";

createHeader();

function renderRoute() {
    if (window.location.hash === "#match") { createMatchPage(); return; }
    if (window.location.hash === "#matches") { createMatchesPage(); return; }
    if (window.location.hash === "#league") { createLeaguePage(); return; }
    if (window.location.hash === "#team") { createTeamPage(); return; }
    loadCompetitions();
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
