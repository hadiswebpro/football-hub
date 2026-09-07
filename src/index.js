import "./styles/main.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/cards.css";
import "./styles/match-page.css";
import "./styles/league-page.css";
import "./styles/responsive.css";

import createHeader from "./components/header";
import loadCompetitions from "./pages/home";
import createMatchPage from "./pages/match";
import createLeaguePage from "./pages/league";

createHeader();

function renderRoute() {
    if (window.location.hash === "#match") {
        createMatchPage();
        return;
    }

    if (window.location.hash === "#league") {
        createLeaguePage();
        return;
    }

    loadCompetitions();
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
