function createHeader() {
    const header = document.querySelector(".header");

    header.innerHTML = `
        <div class="header__container">

            <!-- Hamburger -->
            <button
                class="header__menu-btn"
                id="menuBtn"
                type="button"
                aria-label="Open menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>


            <!-- Logo -->
            <a href="#" class="header__logo">
                <span class="header__logo-icon">⚽</span>
                <span class="header__logo-text">Football Hub</span>
            </a>


            <!-- Navigation -->
            <nav class="header__nav" id="mainNav">

                <a href="#" class="header__nav-link active">
                    
                    <!-- Home SVG -->
                    <svg
                        class="header__nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>

                    <span>Home</span>
                </a>


                <a href="#" class="header__nav-link">
                    <span>Teams</span>
                </a>


                <a href="#" class="header__nav-link">
                    <span>Leagues</span>
                </a>


                <a href="#" class="header__nav-link">
                    <span>Matches</span>
                </a>

            </nav>


            <!-- Desktop Search -->
            <div class="header__search">

                <input
                    type="search"
                    id="searchInput"
                    class="header__search-input"
                    placeholder="Search teams, leagues..."
                    autocomplete="off"
                >

                <button
                    type="button"
                    class="header__search-btn"
                    id="searchBtn"
                    aria-label="Search"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </button>

            </div>


            <!-- Mobile Search Button -->
            <button
                type="button"
                class="header__mobile-search-btn"
                id="mobileSearchBtn"
                aria-label="Open search"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg>
            </button>


            <!-- Mobile Search Dropdown -->
            <div
                class="header__search-dropdown"
                id="searchDropdown"
            >
                <input
                    type="search"
                    id="mobileSearchInput"
                    placeholder="Search teams, leagues..."
                    autocomplete="off"
                >
            </div>

        </div>
    `;

    return header;
}

export default createHeader;