function createHero() {
    const hero = document.createElement("section");
    hero.className = "hero";

    hero.innerHTML = `
        <div class="hero__image" aria-hidden="true"></div>
        <div class="hero__overlay" aria-hidden="true"></div>
        <div class="hero__frame" aria-hidden="true"></div>

        <div class="hero__content">
            <span class="hero__eyebrow">THE WORLD OF FOOTBALL</span>
            <h1>Everything football.<br><span>One place.</span></h1>
            <p>Follow leagues, teams and matches in one place.</p>
            <button class="hero__button" type="button">Explore Leagues <span aria-hidden="true">→</span></button>
        </div>
    `;

    hero.querySelector(".hero__button").addEventListener("click", () => {
        document.querySelector(".leagues")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return hero;
}

export default createHero;
