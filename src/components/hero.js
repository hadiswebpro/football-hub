function createHero() {
    const hero = document.createElement("section");
    hero.className = "hero";

    hero.innerHTML = `
        <div class="hero__pitch" aria-hidden="true">
            <div class="hero__pitch-line hero__pitch-line--top"></div>
            <div class="hero__pitch-line hero__pitch-line--bottom"></div>
            <div class="hero__center-circle"></div>
            <div class="hero__center-dot"></div>
            <div class="hero__ball">⚽</div>
        </div>

        <div class="hero__glow hero__glow--one" aria-hidden="true"></div>
        <div class="hero__glow hero__glow--two" aria-hidden="true"></div>

        <div class="hero__content">
            <span class="hero__eyebrow">THE WORLD OF FOOTBALL</span>

            <h1>Everything football.<br><span>One place.</span></h1>

            <p>
                Follow the biggest leagues, discover teams and never miss
                the next match.
            </p>

            <button class="hero__button" type="button">
                Explore Leagues
                <span aria-hidden="true">→</span>
            </button>
        </div>
    `;

    hero.querySelector(".hero__button").addEventListener("click", () => {
        document.querySelector(".leagues")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    });

    return hero;
}

export default createHero;
