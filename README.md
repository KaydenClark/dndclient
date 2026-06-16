# dndclient

Vite + React frontend for the D&D WebApp.

## What Changed

- Migrated the old Create React App setup to Vite.
- Reworked auth so tokens persist through refreshes.
- Added protected routes for character pages.
- Rebuilt the character list and detail flows around the revived backend.
- Added derived sheet views for:
  - race, class, and subclass
  - ability scores and saving throws
  - HP, AC, initiative, and passive perception
  - attacks, proficiencies, spellcasting, spell slots, and features
- Added session-ready character sheet tools for spell slots, conditions, death saves, hit dice, and inventory.
- Added compact condition description tooltips with regression coverage.

## Local Setup

1. Create `.env` from `.env.example`
2. Set `VITE_API_BASE_URL` to the backend URL
3. Run `npm install`
4. Run `npm run dev`

Default frontend port: `5173`

## Validation

- `npm test`
- `npm run build`

Current verified baseline as of 2026-06-04:

- `npm test`: 372 tests passing across 24 test files
- `npm run build`: production build passing

Known test-output noise:

- React Router v7 future flag warnings are expected.
- `SessionReadyTools.red.test.js` still emits React `act(...)` warnings; cleanup is tracked in the workbook backlog.

