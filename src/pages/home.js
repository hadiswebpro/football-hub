import getCompetitions from "../api/competitions";
import createLeagueCard from "../components/leagueCard";

const importantLeagueIds = [
    1,   // World Cup
    4,   // Euro Championship
    2,   // Champions League
    3,   // Europa League

    39,  // Premier League
    40,  // Championship

    140, // La Liga
    141, // Segunda División

    135, // Serie A
    136, // Serie B

    78,  // Bundesliga
    79,  // 2. Bundesliga

    61,  // Ligue 1
    62,  // Ligue 2
];

async function loadCompetitions() {
    const data = await getCompetitions();

    const filteredLeagues = data.response.filter((competition) =>
    importantLeagueIds.includes(competition.league.id));

    console.log(
    filteredLeagues.map((competition) => ({
        id: competition.league.id,
        name: competition.league.name,
        country: competition.country.name,
    })))

    const container = document.querySelector(".leagues");

    filteredLeagues.forEach((competition) => {
          const card = createLeagueCard(competition);
          container.appendChild(card);
    });
}



export default loadCompetitions;