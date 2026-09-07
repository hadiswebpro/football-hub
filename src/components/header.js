function createHeader() {
    const header = document.querySelector(".header");
    header.innerHTML = `
        <div class="header__container">
            <button class="header__menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
            <a href="#" class="header__logo"><span class="header__logo-icon">⚽</span><span class="header__logo-text">Football Hub</span></a>
            <nav class="header__nav" id="mainNav">
                <a href="#" class="header__nav-link" data-route="home"><span>Home</span></a>
                <a href="#teams" class="header__nav-link" data-route="teams"><span>Teams</span></a>
                <a href="#leagues" class="header__nav-link" data-route="leagues"><span>Leagues</span></a>
                <a href="#matches" class="header__nav-link" data-route="matches"><span>Matches</span></a>
                <a href="#favorites" class="header__nav-link" data-route="favorites"><span>Favorites</span></a>
            </nav>
            <div class="header__search"><input type="search" id="searchInput" class="header__search-input" placeholder="Search teams, leagues, matches..." autocomplete="off"><button type="button" class="header__search-btn" id="searchBtn" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></button></div>
            <button type="button" class="header__mobile-search-btn" id="mobileSearchBtn" aria-label="Open search" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></button>
            <div class="header__search-dropdown" id="searchDropdown"><input type="search" id="mobileSearchInput" placeholder="Search teams, leagues, matches..." autocomplete="off"></div>
        </div>`;

    const menuBtn = document.querySelector("#menuBtn");
    const mainNav = document.querySelector("#mainNav");
    const searchInput = document.querySelector("#searchInput");
    const searchBtn = document.querySelector("#searchBtn");
    const mobileSearchBtn = document.querySelector("#mobileSearchBtn");
    const searchDropdown = document.querySelector("#searchDropdown");
    const mobileSearchInput = document.querySelector("#mobileSearchInput");

    const openSearch = (value) => {
        const query = value.trim();
        if (!query) return;
        window.location.hash = `#search?q=${encodeURIComponent(query)}`;
    };

    const closeMenu = () => { mainNav.classList.remove("is-open"); menuBtn.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Open menu"); };
    menuBtn.addEventListener("click", () => { const open = mainNav.classList.toggle("is-open"); menuBtn.classList.toggle("is-open", open); menuBtn.setAttribute("aria-expanded", open); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); });
    mainNav.querySelectorAll(".header__nav-link").forEach((link) => link.addEventListener("click", closeMenu));
    searchBtn.addEventListener("click", () => openSearch(searchInput.value));
    searchInput.addEventListener("keydown", (event) => { if (event.key === "Enter") openSearch(searchInput.value); });
    mobileSearchBtn.addEventListener("click", () => { const open = searchDropdown.classList.toggle("is-open"); mobileSearchBtn.setAttribute("aria-expanded", open); if (open) mobileSearchInput.focus(); });
    mobileSearchInput.addEventListener("keydown", (event) => { if (event.key === "Enter") openSearch(mobileSearchInput.value); });

    const updateActiveNav = () => {
        const hash = window.location.hash;
        const activeRoute = ["#team", "#teams"].includes(hash) ? "teams" : ["#league", "#leagues"].includes(hash) ? "leagues" : hash === "#matches" ? "matches" : hash === "#favorites" ? "favorites" : "home";
        mainNav.querySelectorAll(".header__nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === activeRoute));
    };
    window.addEventListener("hashchange", updateActiveNav);
    updateActiveNav();
    return header;
}
export default createHeader;
