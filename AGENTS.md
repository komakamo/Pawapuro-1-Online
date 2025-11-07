# Pawapuro-1-Online Repository Conventions

## Directory layout
- `Index/` contains all web assets that ship with the static build.
  - `Index/index.html` defines the markup shell and script/style imports.
  - `Index/css/` stores all styling. Keep shared tokens (colors, spacing, fonts) near the top of `styles.css`.
  - `Index/js/` is split between UI orchestration (`game.js`) and core simulation logic (`simulation.js`).
- Top-level documentation (like `README.md` and this file) lives in the repository root.
- Place any new static assets (images, fonts, JSON seeds) beneath `Index/` and reference them with relative URLs so they work when the app is hosted statically.

## JavaScript guidelines
- Use ES modules with explicit named exports. Add new simulation helpers to `simulation.js` and import them in `game.js` as needed.
- Prefer `const` for bindings that are never reassigned and `let` otherwise; avoid `var`.
- Stick to four-space indentation and keep functions small and focused. When logic grows, extract helpers instead of expanding existing functions.
- Keep `game.js` responsible for DOM/state orchestration (rendering rosters, handling events, formatting output) and `simulation.js` responsible for pure data transformations (team factories, schedule generation, stat updates).
- When updating team data, modify `createInitialTeams` in `simulation.js`. Ensure every team and player keeps a stable `id`, and update derived structures (like schedules) through existing helpers instead of manual mutations.
- Use template literals for HTML snippets and prefer descriptive variable names (`homeTeam`, `currentDayIndex`, etc.).
- Document non-obvious logic with brief comments directly above the relevant block.

## HTML guidelines
- Maintain semantic structure in `index.html` (headings in order, buttons for actions, tables for tabular data).
- Favor descriptive `aria` labels or `aria-live` regions when adding interactive elements so the static simulator stays accessible.
- Defer new scripts to the bottom of `body` and load them as ES modules (`type="module"`).

## CSS guidelines
- Follow the existing four-space indentation and group related selectors together.
- Use CSS custom properties for theme values and prefer utility classes over inline styles.
- Keep class names in lowercase kebab-case (e.g., `.schedule-card`).
- Add responsive tweaks with mobile-first media queries appended to the bottom of `styles.css`.

## Extending the web game
- Add or tweak gameplay rules inside `simulation.js`; expose new capabilities via exported functions so `game.js` can orchestrate them.
- When introducing new UI features, add event wiring and rendering updates in `game.js`. Avoid duplicating state—derive from the single `state` object when possible.
- Update schedule or standings views by extending the existing render helpers (`renderSchedule`, `renderStandings`, etc.) or by adding parallel helpers that follow the same pattern (generate markup, then inject into cached DOM nodes).
- Place reusable DOM queries inside the `elements` map near the top of `game.js` to keep selectors centralized.
- If a change requires persisted configuration (e.g., custom league setups), store defaults in a new module under `Index/js/` and import it rather than hardcoding values in the UI layer.

## Pull request expectations
- Provide a summary of functional changes, affected files, and any new assets.
- List manual or automated checks you ran (e.g., opening the app locally, running `npm` tooling if added).
- Note any follow-up work or limitations so reviewers understand current constraints.
- Keep commits focused and descriptive; group related file changes together.
