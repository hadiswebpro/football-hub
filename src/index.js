import "./styles/main.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/cards.css";
import "./styles/responsive.css";

import createHeader from "./components/header";
import loadCompetitions from "./pages/home";

createHeader();
loadCompetitions();
