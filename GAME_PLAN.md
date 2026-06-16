# dndclient — Game Plan

**Last reviewed: 2026-06-15**

Forward-looking only. Completed work is in git history and `DM Workbook/Chat Handoffs/`. For full phase history, see `DM Workbook/GAME_PLAN_CC.md`.

---

## Current State

372 tests green across 24 files. Full character sheet working in view/edit/level-up modes. 7-step creation wizard with Standard Array / Point Buy / Roll, subrace picker, structured background and alignment, skill selector with class rule enforcement, proficiency summary in Review. Session tools (conditions, death saves, hit dice, inventory, spell slot expend/refresh) all work from view mode without opening edit form. HP bar with color thresholds, Temp HP tile, skill breakdown tooltips with expertise, spell slot rest recovery label. Phase 6D (feat/ASI UI) is blocked on the backend design doc.

---

## Deferred — Do Not Start Without the Listed Prerequisite

| Item | Blocked on |
|---|---|
| Feat/ASI UI (Phase 6D) | Backend design doc (see `dndAPI/GAME_PLAN.md`) |
| Tool proficiency and language selection | Phase 6D backend design |
| Searchable spell picker in CharacterNew wizard | Low priority — Level-Up Studio already has name filter |

---

## Next Tasks

1. **Manual browser verification** — sign in, create a Warlock at L3 (verify pact slots + "Recovers on: short rest" label), create a Paladin at L1 and L2 (verify slot counts), create a character with a Background and confirm background skills appear in FeaturesPanel, use all session tools, level up a character. Confirm a second user cannot see the first user's characters.

2. **Write a test for background skill grant display** — create a character with a background that has `skillProficiencies`, render the sheet, assert those skills appear in `FeaturesPanel`. Validates the background-to-sheet flow from the frontend's perspective.

3. **Clean up `act(...)` warnings in `SessionReadyTools.red.test.js`** — tests pass but warnings reduce signal. Find the async state updates not wrapped in `act` and fix them.

---

## Tech Debt (Fix Opportunistically)

- `syncEditForm` ability score fallback: `character?.baseAbilityScores?.str ?? character?.abilityScores?.str ?? 8` is a schema migration leftover. Simplify once old characters without `baseAbilityScores` are confirmed gone from the DB.
- Rename `equpiment/` folder to `equipment/` (typo) — fix during next edit to that area.

---

## Verification

- `npm test` after any component, route, or auth change — must stay 372/372 green.
- `npm run build` after major UI changes to catch build errors jsdom won't surface.
- Verify in a real browser for any layout or CSS change — jsdom does not catch visual regressions.
- Never start new feature work on a red baseline.
