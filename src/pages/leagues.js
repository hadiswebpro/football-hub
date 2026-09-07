import getCompetitions from "../api/competitions";
import createLeagueCard from "../components/leagueCard";

function createLeaguesPage() {
    const app = document.querySelector("#app");
    if (!app) return;

    app.innerHTML = `
        <section class="directory-page">
            <div class="directory-page__top">
                <div><span class="section-heading__eyebrow">EXPLORE</span><h1>Leagues</h1><p>Explore the competitions followed by football fans around the world.</p></div>
            </div>
            <div class="directory-page__content" data-leagues><div class="directory-page__loading">Loading leagues…</div></div>
        </section>
    `;

    const target = app.querySelector("[data-leagues]");
    getCompetitions().then((data) => {
        const competitions = data.response ?? [];
        if (!competitions.length) {
            target.innerHTML = `<div class="directory-page__empty"><h2>No leagues found</h2><p>There is no league data available right now.</p></div>`;
            return;
        }
        target.innerHTML = `<div class="leagues directory-page__grid"></div>`;
        const grid = target.querySelector(".leagues");
        competitions.forEach((competition) => grid.appendChild(createLeagueCard(competition)));
    }).catch(() => {
        target.innerHTML = `<div class="directory-page__empty"><h2>Could not load leagues</h2><p>Please check your API key and try again.</p></div>`;
    });
}

export default createLeaguesPage;
