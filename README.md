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

## Local Setup

1. Create `.env` from `.env.example`
2. Set `VITE_API_BASE_URL` to the backend URL
3. Run `npm install`
4. Run `npm run dev`

Default frontend port: `5173`

## Validation

- `npm test`
- `npm run build`

