const API_URL = "https://v3.football.api-sports.io/teams";
const API_KEY = "";

async function getTeams() {
    const response = await fetch(API_URL, {
        headers: {
            "x-apisports-key": API_KEY
        }
    });

    const data = await response.json();

    return data;
}

export default getTeams;