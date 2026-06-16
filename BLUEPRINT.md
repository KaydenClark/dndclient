# dndclient — Blueprint

**Last reviewed: 2026-06-15**

This document tells you exactly what this app is, what every screen looks like, how it's structured, and what's left to build. Read this before touching any code.

---

## What This App Is

A React web app that lets D&D players build and use a living character sheet. The core promise:

> "Tell me exactly how much damage my sword does per swing based on my stats."

The frontend does **not** compute D&D rules. It submits player choices to the API, receives a fully derived character, and renders the results. If a stat isn't in the API response, it doesn't appear on the sheet. The API is the single source of truth for all math.

---

## What It Looks Like When Complete

### Home (`/`)
Public landing page. Links to Sign In and Sign Up. No character data.

### Sign In (`/signIn`)
Email + password form. On success: receives JWT, stores in `localStorage` as `pdb-token`, redirects to `/characters`.

### Sign Up (`/signUp`)
Email + username + password form. On success: auto-signs in, redirects to `/characters`.

### Character Roster (`/characters`) — Protected
A list of the user's characters. Each card shows: character name, race, class, level. Clicking a card navigates to `/characters/:id`.

No creation form on this page. Creation lives at `/characters/new`.

### Character Creation Wizard (`/characters/new`) — Protected
A 7-step tabbed wizard. Steps can be reached directly by clicking the tab or sequentially with Next/Back. State persists across tab jumps.

| Step | What it shows |
|---|---|
| 1. Name | Text input for character name. Required to advance. |
| 2. Race | Base-race select. If the chosen race group has subraces, a second select appears. Both sorted alphabetically. |
| 3. Class | Class select (sorted). Subclass select appears only when `form.level >= class.subclassLevel` — otherwise shows a hint: "Subclass picks at level X." |
| 4. Background & Alignment | Background select from compendium (126 options with 5etools). 9-alignment dropdown (no free text). |
| 5. Ability Scores | Method toggle: Standard Array / Point Buy / Roll. Standard Array = pick scores from preset list. Point Buy = 27-point budget, scores 8-15, PHB cost table, +/- controls with running budget. Roll = 4d6 drop lowest per stat, reroll individual or Roll All. |
| 6. Skill Selection | `SkillSelector` driven by `class.skillChoiceRules`. Background-granted skills are locked — they don't consume a class slot. Shows "No skill choices for this class" when appropriate. |
| 7. Review | Full character summary. Proficiency summary panel: background name + class skills + background-granted skills. Submit button. |

On submit: POST `/player` → navigate to `/characters/:id?mode=levelUp` so spell selection happens immediately.

### Character Sheet (`/characters/:id`) — Protected
The main sheet. Three modes:

**View mode (default):**
- `CharacterHeader`: name, race/class/level subtitle, back link, Edit and Level Up buttons
- `AbilityScores`: 6-stat grid with score and modifier
- `CombatStats`: AC, HP (with bar: green ≥50%, yellow <50%, red <25%), Temp HP tile (visible when >0), initiative, speed, passive perception, proficiency bonus, spell save DC, spell attack bonus. HP quick controls: Damage / Heal input + button, Set Temp HP control. All persist without entering edit mode.
- `SkillsAndSaves`: saving throws (6) + all 18 skills, each showing modifier with hover breakdown (ability mod + proficiency + expertise)
- `AttacksPanel`: equipped weapon cards — each shows weapon name, attack bonus, damage string, "Proficient / Not proficient" label
- `SpellPanel`: cantrips, known/prepared spells, spell slots (remaining/total per level), "Recovers on: short rest" or "long rest" label, expend/refresh controls
- `FeaturesPanel`: features list, weapon proficiencies, armor proficiencies, tool proficiencies ("None" when empty), languages, background-granted skills, currency (cp/sp/ep/gp/pp)
- `SessionToolsPanel`: conditions (toggle from compendium, tooltip shows description), death saves (success/failure checkboxes), hit dice (spend/restore), inventory (add name + quantity)

**Edit mode:**
Full edit form for all character inputs. Structured alignment dropdown (same 9 options as wizard). Weapon picker with proficiency marker (Proficient / Not proficient). Skill selector with class rule enforcement. On save: PUT `/player/:id` → API re-derives → response replaces all local state.

**Level-Up mode** (also reachable via `?mode=levelUp` param):
Level adjuster (1-20 via +/- and direct input). When `planner.level < class.subclassLevel`, shows a notice card: "Subclass unlocks at level X." Spell picker with name filter for large lists. On save: PUT `/player/:id` → full re-derive.

---

## Architecture

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 | Functional components + hooks |
| Bundler | Vite 6 | Dev port 5173, HMR |
| Routing | React Router v6 | `createBrowserRouter`; protected routes redirect to `/signIn` |
| HTTP client | Axios | `lib/api.js` — 7 functions wrapping all API calls |
| Styling | Raw CSS (existing) + Tailwind utility classes (new components) | Do not refactor existing CSS unless already editing the file |
| Testing | Vitest + Testing Library + jsdom | Tests do not need the API running |
| Auth | JWT stored in `localStorage` as `pdb-token` | `context/auth.js` exposes `{ token, isAuthenticated, signIn, signOut }` |

Dev port: 5173. API at `VITE_API_BASE_URL` (defaults to `http://localhost:5000`).

---

## Directory Map

```
dndclient/
├── index.html
├── vite.config.js
└── src/
    ├── App.js                              ← root: NavBar + AppRoutes
    ├── index.js                            ← ReactDOM.createRoot
    ├── App.css                             ← global styles + HP bar classes
    ├── lib/
    │   └── api.js                          ← 7 Axios functions (all API calls go here)
    ├── context/
    │   └── auth.js                         ← AuthContext: token/isAuthenticated/signIn/signOut
    ├── components/
    │   ├── const.js                        ← VITE_API_BASE_URL reader
    │   ├── navigation/
    │   │   ├── Links.js
    │   │   └── Routes.js                   ← react-router route definitions
    │   └── characters/
    │       ├── characterSheet.js           ← summary card for roster list view
    │       ├── CharacterHeader.js
    │       ├── AbilityScores.js
    │       ├── CombatStats.js              ← HP bar, HP quick controls, Temp HP
    │       ├── SkillsAndSaves.js           ← saving throws + 18 skills with breakdown tooltip
    │       ├── AttacksPanel.js
    │       ├── SpellPanel.js               ← spell slots + restRecovery label
    │       ├── FeaturesPanel.js            ← features, proficiencies, currency, background skills
    │       ├── EquipmentPanel.js
    │       ├── SessionToolsPanel.js        ← conditions, death saves, hit dice, inventory
    │       ├── EditCharacterForm.js        ← full edit mode form
    │       ├── LevelUpStudio.js            ← level adjuster + spell picker
    │       ├── SkillSelector.js            ← class-rule-enforced skill picker
    │       └── BackgroundField.js          ← structured background select with free-text fallback
    └── pages/
        ├── home/
        │   └── home.js
        ├── users/
        │   ├── SignIn.js
        │   └── SignUp.js
        └── characters/
            ├── charactersList.js           ← roster list only (no embedded create form)
            ├── CharacterNew.js             ← 7-step wizard at /characters/new
            └── playersCharacter.js         ← character sheet page (view/edit/level-up)
```

---

## Routes

```
/                   → Home (public)
/signIn             → SignIn (public)
/signUp             → SignUp (public)
/characters         → CharactersList (protected)
/characters/new     → CharacterNew (protected) — 7-step wizard
/characters/:id     → PlayersCharacter (protected) — full sheet
/characters/:id     → PlayersCharacter with ?mode=levelUp — opens Level-Up Studio
*                   → redirects to /
```

Protected routes: unauthenticated users redirect to `/signIn`.

---

## State Architecture

### Auth (`context/auth.js`)
Persists JWT in `localStorage` under key `pdb-token`. Exposes `{ token, isAuthenticated, signIn, signOut }` via Context. All protected routes check `isAuthenticated`.

### Character Sheet (`playersCharacter.js`) — three modes

| Mode | Trigger | What shows |
|---|---|---|
| `'view'` | Default on load | Read-only derived stats + session tools |
| `'edit'` | "Edit Character" button | Full `EditCharacterForm`; `editForm` state synced from character on open |
| `'levelUp'` | "Level Up" button or `?mode=levelUp` URL param | `LevelUpStudio`; `planner` state synced on open |

On save (edit or level-up): PUT `/player/:id` → API re-derives full document → response replaces all local character state. No client-side recalculation.

### Compendium Data
Loaded once on `CharacterNew` and `playersCharacter.js` mount via `GET /compendium/bootstrap`. Stored in local component state. Not global — no Redux, no context. Each page that needs compendium data fetches it.

### Character Sheet Modes for Session Tools
Session tool interactions (HP quick controls, spell slot expend/refresh, conditions toggle, death saves, hit dice, inventory) call PUT `/player/:id` directly from view mode. They do not open edit mode.

---

## API Integration

All API calls go through `lib/api.js`. Never use Axios directly in a component. The 7 functions:

```js
signIn(email, password)
signUp(email, userName, password)
getCharacters(token)
createCharacter(token, data)
getCharacter(token, id)
updateCharacter(token, id, data)
getBootstrapCompendium()
```

---

## What's Built

- Auth: sign in, sign up, JWT context, protected routes
- Character roster with scannable cards (name, race, class, level)
- 7-step creation wizard with Standard Array / Point Buy / Roll ability score methods, subrace picker, alphabetical sorts, alignment dropdown, structured background select, skill selector with class rule enforcement, proficiency summary in Review step
- Character sheet: all derived stats, HP bar with color thresholds, HP quick controls, Temp HP tile and controls, skill modifier breakdowns with hover tooltip (ability mod + proficiency + expertise), weapon attack cards with proficiency labels, spell slots with expend/refresh + rest-recovery label, features + proficiency lists + tools + currency + background skills
- Session tools: conditions toggle (with tooltip descriptions), death saves, hit dice, inventory — all from view mode without opening edit form
- Edit mode: full edit form, weapon picker with proficiency markers, skill selector, structured alignment dropdown
- Level-Up Studio: level 1-20 adjuster, spell picker with name filter, subclass early-gate notice
- Expertise: selected via `expertiseProficiencies` in edit/wizard, displayed in skill breakdown
- 372 green frontend tests across 24 files

---

## What's Not Built Yet

- **`/characters/new` wizard step for tool proficiency and language selection** — Phase 6D, blocked on backend design
- **Feat selection at ASI levels** — Phase 6D, blocked on backend design doc
- **Equipment panel in view mode** — `EquipmentPanel` exists for edit mode; view mode shows attacks but not a full equipment display
- **Searchable/filterable spell picker in wizard** — Level-Up Studio has name filter; CharacterNew step does not yet filter spells
- **Cross-user character isolation browser test** — covered in manual verification (Phase 7), no automated e2e test
- **React `act(...)` warnings in `SessionReadyTools.red.test.js`** — tests pass, warnings exist; tech debt
- **`equpiment` folder typo** — folder is `equpiment/` not `equipment/`; rename during next edit to that area

---

## Environment

Required `.env`:
```
VITE_API_BASE_URL=http://localhost:5000
```
