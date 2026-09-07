import createTeamCard from "../components/teamCard";

const teams = [
    { id: 541, name: "Real Madrid", country: "Spain", league: "La Liga", logo: "https://media.api-sports.io/football/teams/541.png" },
    { id: 529, name: "Barcelona", country: "Spain", league: "La Liga", logo: "https://media.api-sports.io/football/teams/529.png" },
    { id: 50, name: "Manchester City", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/50.png" },
    { id: 40, name: "Liverpool", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/40.png" },
    { id: 157, name: "Bayern Munich", country: "Germany", league: "Bundesliga", logo: "https://media.api-sports.io/football/teams/157.png" },
    { id: 85, name: "Paris Saint-Germain", country: "France", league: "Ligue 1", logo: "https://media.api-sports.io/football/teams/85.png" },
    { id: 42, name: "Arsenal", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/42.png" },
    { id: 33, name: "Manchester United", country: "England", league: "Premier League", logo: "https://media.api-sports.io/football/teams/33.png" }
];

function createTeamsPage() {
    const app = document.querySelector("#app");
    if (!app) return;
    app.innerHTML = `
        <section class="directory-page">
            <div class="directory-page__top">
                <div><span class="section-heading__eyebrow">CLUB DIRECTORY</span><h1>Teams</h1><p>Discover popular clubs and open their full team profiles.</p></div>
                <input class="directory-page__search" type="search" placeholder="Search teams…" aria-label="Search teams" data-team-search>
            </div>
            <div class="directory-page__content"><div class="teams directory-page__team-grid" data-teams></div></div>
        </section>
    `;

    const target = app.querySelector("[data-teams]");
    const search = app.querySelector("[data-team-search]");
    const render = (query = "") => {
        const filtered = teams.filter((team) => `${team.name} ${team.country} ${team.league}`.toLowerCase().includes(query.trim().toLowerCase()));
        target.innerHTML = "";
        if (!filtered.length) {
            target.innerHTML = `<div class="directory-page__empty"><h2>No teams found</h2><p>Try another team, country or league.</p></div>`;
            return;
        }
        filtered.forEach((team) => target.appendChild(createTeamCard(team)));
    };
    search.addEventListener("input", (event) => render(event.target.value));
    render();
}

export default createTeamsPage;
