const API_URL = "https://v3.football.api-sports.io/leagues";
const API_KEY = "کلید خودت";

async function getCompetitions() {
    const response = await fetch(API_URL, {
        headers: {
            "x-apisports-key": API_KEY
        }
    });

    const data = await response.json();

    return data;
}

export default getCompetitions;