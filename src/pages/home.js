import getCompetitions from "../api/competitions";
import createLeagueCard from "../components/leagueCard";

async function loadCompetitions() {
    const data = await getCompetitions();

    console.log(data);
}

loadCompetitions();