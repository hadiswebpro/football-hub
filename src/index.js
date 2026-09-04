import "./styles/main.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/cards.css";
import "./styles/match-page.css";
import "./styles/responsive.css";

import createHeader from "./components/header";
import loadCompetitions from "./pages/home";
import createMatchPage from "./pages/match";

createHeader();

function renderRoute() {
    if (window.location.hash === "#match") {
        createMatchPage();
        return;
    }

    loadCompetitions();
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
