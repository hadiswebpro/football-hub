# ⚽ Football Hub

A modern football dashboard built from scratch with **Vanilla JavaScript** and **Webpack**.

Football Hub brings competitions, matches, leagues, teams, standings, search, favorites, and match details into one responsive interface — powered by live football data.

### ✨ Live Demo

**[Open Football Hub →](https://hadiswebpro.github.io/football-hub/)**

> The live app requires an API key for the football-data provider. The key is intentionally not committed to the repository.

---

## 🚀 Features

- 🏆 Browse football competitions and leagues
- ⚽ View upcoming, recent, and live matches
- 📊 Explore league standings
- 🏟️ Open team profiles and squads
- 🔎 Search for teams and leagues
- ⭐ Save favorite teams and competitions
- 📋 Match details, events, statistics, and lineups
- 📱 Responsive layout for desktop and mobile
- ⚡ Client-side caching with `localStorage`
- 🧭 Hash-based navigation for a lightweight SPA experience
- 🎨 Custom responsive UI with reusable CSS
- 🔄 Loading states and polished UI feedback

---

## 🛠️ Tech Stack

- **JavaScript (ES6+)**
- **Webpack 5**
- **HTML5**
- **CSS3**
- **CSS Loader**
- **Style Loader**
- **Webpack Dev Server**
- **Football API**
- **GitHub Pages**
- **GitHub Actions**

---

## 📁 Project Structure

```text
football-hub/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── favicon/
├── images/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── favicon.js
│   ├── index.js
│   └── template.html
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
├── package.json
└── README.md
```

---

## 💻 Run Locally

Clone the repository:

```bash
git clone https://github.com/hadiswebpro/football-hub.git
cd football-hub
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

---

## 🔐 API Key

Football Hub uses the **API-Sports / Football API**.

The API key should **never be committed to Git**.

For local development, keep the key outside the repository and provide it through your local development setup.

For production, remember that this project is a static frontend. A secret placed into the JavaScript bundle during the build can still be discovered by anyone using the site.

The secure production architecture is:

```text
Browser
   ↓
Your frontend
   ↓
Your backend / serverless proxy
   ↓
Football API
```

The backend keeps the real API key private and makes the API request on behalf of the frontend.

---

## 🌐 Deployment

The project is deployed automatically with **GitHub Actions**.

Every push to `main`:

1. Installs dependencies
2. Runs the production build
3. Publishes the `dist` directory to `gh-pages`

Live site:

**https://hadiswebpro.github.io/football-hub/**

---

## 🎯 What I Practiced

This project was built to practice real-world frontend development concepts, including:

- Modular JavaScript
- Async/await and API requests
- DOM manipulation
- Event handling
- Client-side routing
- State-like application data management
- Caching and request deduplication
- Responsive design
- Webpack configuration
- Production builds
- Git and GitHub
- Continuous deployment with GitHub Actions

---

## 👤 Author

**Hadis**

Built with curiosity, football, and a lot of JavaScript. ⚽

