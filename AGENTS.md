# dndclient — Agent Instructions

You are working on the React frontend for a rules-accurate D&D 5e character sheet app. Read `BLUEPRINT.md` first — it tells you what every screen looks like and what's built. This document tells you how to operate in this repo.

---

## Working Documents

Three documents orient you in this repo. Know how to use each one:

- **BLUEPRINT.md** — stable spec. What every screen looks like, how the app is structured, what's built vs. not. Rarely changes. Read it once at the start of a session.
- **GAME_PLAN.md** — forward-looking guide. Current state + next tasks. **This is a guide, not a constraint.** The code is ground truth. If the codebase contradicts the game plan, trust the code, flag the discrepancy, and update the plan before proceeding.
- **`DM Workbook/Chat Handoffs/`** — session history. Decisions made, context from previous sessions. Read the most recent one when picking up mid-project.

---

## Your Role

You write and maintain:
- React pages and components (`src/pages/`, `src/components/`)
- Routing (`src/components/navigation/Routes.js`)
- API integration layer (`src/lib/api.js`)
- Auth context (`src/context/auth.js`)
- Frontend tests (`src/**/*.test.js`)

You do not touch `dndAPI/` (backend) or `DM Workbook/` (separate app). Those have their own agents.

---

## The Prime Directive

**The frontend never implements D&D math.**

Every number on the character sheet comes from the API response. The frontend submits player choices (race, class, ability scores, equipment selections) and renders what the API returns. If the sheet needs a new derived value, add it to the backend derivation engine — not here.

This is not a suggestion. It is the architectural rule that keeps the app maintainable. Do not calculate attack bonuses, AC, spell save DCs, skill modifiers, HP, or any other D&D-derived value in a component, hook, or utility.

---

## Stack Rules

- **React 18.** Functional components and hooks only. No class components.
- **Vite 6.** Do not change the bundler.
- **React Router v6.** `createBrowserRouter` pattern. Do not upgrade to v7 without Kayden's sign-off.
- **Axios via `lib/api.js`.** Never import Axios directly in a component. All API calls go through the 7 functions in `lib/api.js`. Add new API calls there, not inline.
- **Tailwind for new components.** Do not refactor existing raw CSS unless you're already editing that file for another reason.
- **Vitest + Testing Library + jsdom.** Do not introduce Jest. Tests do not need the API running.
- **No new npm dependencies** without stating what they do and why they're needed.

---

## TDD — Required, No Exceptions

1. **Red.** Write a failing test that describes the expected behavior. Run `npm test` and confirm it fails for the right reason — not a syntax error, but because the behavior isn't there yet.
2. **Green.** Write the minimum code to make it pass. No adjacent features.
3. **Refactor.** Clean up while tests stay green. Do not change behavior.
4. **Full suite green** before committing.

**Test locations:**

| Change type | Test file |
|---|---|
| New component | New `.test.js` file alongside the component |
| New route | `Routes.test.js` |
| Auth behavior | `auth.test.js` |
| Character sheet feature | Test file alongside the relevant component |

**Current baseline: 372 tests green across 24 files.** Never start work on a red baseline. Fix it first.

Frontend tests use jsdom — they do not need the API or dev server running.

---

## Component Rules

- Single file when possible. Split only when a file exceeds ~300 lines or separation is clearly necessary.
- State ownership: keep state in the page component (`playersCharacter.js`, `CharacterNew.js`) and pass it down as props. Do not lift state into context unless it's genuinely cross-page (auth is the only current example).
- Controlled inputs only — all form fields use React state, not uncontrolled refs.
- No inline `setTimeout` or `setInterval` without a cleanup in `useEffect`.
- All async calls (API functions) wrapped in try/catch with visible error handling — show an error message, do not silently swallow errors.
- No placeholder TODO blocks without a comment explaining what goes there and why it was deferred.

---

## Character Sheet State — Three Modes

`playersCharacter.js` manages three modes: `'view'`, `'edit'`, `'levelUp'`. Before adding any feature to the character sheet, understand which mode it belongs to and which state object it reads from:

- **View mode** — reads from `character` (API response). Session tool interactions call PUT `/player/:id` directly and replace `character` with the response.
- **Edit mode** — reads from `editForm` (synced from `character` on open). On save: PUT `/player/:id` → response replaces `character`.
- **Level-Up mode** — reads from `planner` (synced from `character` on open). On save: PUT `/player/:id` → response replaces `character`.

Do not add a feature that computes derived values from `editForm` or `planner` client-side. Submit the form, let the API derive, render the response.

---

## Day-One Checklist

1. Read `BLUEPRINT.md` completely.
2. Read `GAME_PLAN.md` for current state and immediate next tasks.
3. Check git branch: `git branch`. Ask Kayden which branch is active if unclear.
4. Confirm `.env` exists. It needs `VITE_API_BASE_URL=http://localhost:5000`.
5. `npm install && npm test` — must be 372/372 green before touching anything.
6. `npm run dev` — confirm app loads at `http://localhost:5173`.
7. With `dndAPI` running: sign in, open a character, confirm the sheet renders with real data.

---

## What NOT to Do

- Do not compute D&D math in any component, hook, or utility function.
- Do not call Axios directly in a component — use `lib/api.js`.
- Do not add a new route without a test.
- Do not add a new component without a test.
- Do not duplicate D&D data (spell lists, class features, rule tables) in the frontend. Fetch from the API.
- Do not start feature work on a red baseline.
- Do not import or mix in DM Workbook components.
- Do not use `localStorage` for anything except the JWT token (`pdb-token`).
- Do not introduce new state management libraries (Redux, Zustand, etc.) without Kayden's sign-off.
