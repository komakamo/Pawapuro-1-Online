# Pawapuro League Simulator

## Project Overview
Pawapuro League Simulator is a lightweight web experience inspired by the pennant-mode season format of baseball management games. The project uses only static assets—HTML, CSS, and vanilla JavaScript—to let you run a fictional league, simulate matchups, and watch the standings evolve over time. Everything required to explore the simulation lives in the `Index/` directory, making it easy to open locally or host on any static web server.

## Pennant-Mode Features
- **Team management:** Switch between teams, review each roster, and add or remove players with custom positions and ratings.
- **Season scheduling:** A double round-robin schedule is generated automatically so every club hosts and travels to every opponent.
- **Game-day simulation:** Each simulated day resolves a full slate of games, applies a home-field advantage, and breaks ties with extra innings logic.
- **Player stat tracking:** Individual player records accumulate games played, at-bats, hits, runs, and home runs as the season progresses.
- **Dynamic standings:** Team win/loss records, run totals, and winning percentages update after every simulation to reflect the current table.

## Running the Simulator
1. Open the repository and locate `Index/index.html`.
2. For the most reliable experience, serve the directory with a lightweight static server (examples: `npx serve Index`, `python3 -m http.server --directory Index`). Some browsers restrict ES module imports when opening files directly from the filesystem.
3. Navigate to `http://localhost:<port>/index.html` in your browser to launch the app.
4. Select a team to review its roster, add any custom players you would like, and click **Simulate Day** to advance the season.

## Development Notes
- The UI is intentionally framework-free and relies on modern CSS features such as CSS variables and grid layouts. Design tokens are declared at the top of `Index/css/styles.css` for easy theme adjustments.
- Simulation randomness uses JavaScript’s `Math.random`, so outcomes vary per session without persistent storage.
- State is stored entirely in memory. Refreshing the page resets the season, teams, and rosters.

## Contributor Guide
Future contributions are welcome! A quick tour of the project:
- `Index/index.html` provides the page structure and links in the stylesheet and main game script.
- `Index/css/styles.css` contains all visual styling, including layout, colors, and responsive tweaks.
- `Index/js/game.js` manages DOM interactions: initializing the app, handling user events, and rendering rosters, schedules, results, and standings.
- `Index/js/simulation.js` holds the simulation logic: team initialization, schedule generation, daily game resolution, and stat updates.

When extending the simulator:
- Consider whether new features belong in the UI layer (`game.js`) or the simulation core (`simulation.js`) to keep responsibilities separated.
- Add helper functions for repeated behaviors instead of expanding existing ones excessively; both JS files favor small, pure functions.
- Update the initial team data in `createInitialTeams` carefully so IDs remain unique and consistent with generated schedules.
- Include any new assets under `Index/` and reference them with relative paths so they work in static hosting environments.

## Compatibility and Limitations
- The app targets modern evergreen browsers (Chrome, Firefox, Edge, and Safari) that support ES modules and CSS grid. Internet Explorer is not supported.
- Opening the `index.html` file directly via `file://` URLs may fail to load the JavaScript modules in certain browsers; running a local web server avoids this issue.
- There is no persistence layer, audio, or mobile-specific optimization yet. Player additions and simulation results reset on reload, and small screens rely on the responsive grid rather than bespoke layouts.
