const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "";

async function getMatches() {
    const response = await fetch(API_URL, {
        headers: {
            "x-apisports-key": API_KEY
        }
    });

    const data = await response.json();

    return data;
}

export default getMatches;