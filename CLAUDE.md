# PathFinder — AI Context File

Vanilla JS career guidance app for 16–18 year olds in Germany. No build step, no framework, no package.json.

## Run

```
python3 -m http.server 8080
```

Open `http://localhost:8080`. Hard-refresh (`Cmd+Shift+R`) after file changes.

## Sync

After any change, sync to the prototype folder:
```
cp -r /Users/adrianroth/pathfinder/. "/Users/adrianroth/Documents/CODE/OS Semester/PathFinder/02 Product/prototype/"
```

---

## Architecture

Single-page app. All state lives in `main.js`. Screens are pure functions that return a DOM element — they do not own state.

```
index.html          ← loads styles.css + main.js (type=module)
main.js             ← state machine + router
chat.js             ← floating AI chat button (mounted once to document.body)
styles.css          ← all styles, CSS custom properties
data/
  questions.js      ← ROUND1_QUESTIONS (10), ROUND2_QUESTIONS (5), RIASEC_MODES
  paths.js          ← ALL_PATHS (6), CERT_RANK, CLUSTER_LABELS
  colors.js         ← pathColor(id) → { border, bg, text }
  path-details.js   ← extended modal copy (partially stale)
  stories.js        ← story data (placeholder)
logic/
  matching.js       ← all scoring, ranking, filtering
screens/
  welcome.js        opener.js  quiz.js  savickas.js  blocks.js
  success-picture.js  paths.js  qualifications.js  field-narrowing.js
  comparison.js  stories.js  browse.js  map.js  path-detail-modal.js
```

---

## State

`FRESH_STATE()` in `main.js`. Key fields:

| Field | Type | Set by |
|---|---|---|
| `screen` | string | `navigate()` |
| `userMode` | `'lena'\|'malik'\|'clear'\|null` | opener; overridden to `'lena'` if `unsureCount ≥ 3` |
| `unsureCount` | number | `computeResults()` |
| `round1Answers` | `{ [idx]: optionId[] }` | quiz R1 |
| `round2Answers` | `{ [idx]: optionId[] }` | quiz R2 |
| `savickasAnswers` | `{ roleModel, story, motto }` | savickas screen |
| `blocks` | `string[]` | blocks screen |
| `blocksOther` | string | blocks screen |
| `successPicture` | string | success-picture screen |
| `riasecCounts` | `{ R,I,A,S,E,C }` | `computeResults()` |
| `lifestyle` | `{ anchor, wantsIncomeNow, studyOpen, … }` | `computeResults()` |
| `suggestedPaths` | `Path[]` (3) | `computeResults()` |
| `wildcardPaths` | `Path[]` (0–2) | `computeResults()` — lena=2, malik/clear=0, null=1 |
| `reasons` | `{ [id]: string }` | `computeResults()` |
| `quals` | object | qualifications screen |
| `filterResult` | `{ [id]: { open, note } }` | `computeResults()` + onChange |
| `selectedClusters` | `string[]` | field-narrowing screen |

`computeResults()` is called **once** when the user continues from the SUCCESS_PICTURE screen.

---

## User Flow (screen order)

```
WELCOME → OPENER → QUIZ_R1 → ROUND2_INTRO → SAVICKAS → QUIZ_R2
→ BLOCKS → SUCCESS_PICTURE → PATHS → QUALIFICATIONS → FIELD_NARROWING
→ COMPARISON → STORIES
```

Side entries from WELCOME: BROWSE, MAP.

---

## Matching Logic (`logic/matching.js`)

1. **RIASEC scoring** — each R1 answer maps to a type (R/I/A/S/E/C); `unsure` options are excluded from all counts
2. **Anchor boost** — R2Q0 picks one of 6 Schein anchors; each anchor adds numeric boosts to specific paths before sorting
3. **Lifestyle nudges** — income/study/risk answers apply post-sort adjustments in `suggestPaths()`
4. **Top 3 suggested** — `suggestPaths()` returns highest-scoring 3
5. **Wildcards** — `getWildcards()` returns next 0–2 ranked paths not in top 3
6. **Reason sentences** — `buildReasons()` names both the top RIASEC type and the anchor phrase (when selected)

Anchor → path boosts:
```
tech    → ausbildung+2, studium+1, bundeswehr+1
auto    → freelancing+3, gap-year+2
secure  → ausbildung+2, bundeswehr+3
impact  → fsj+3, studium+1
create  → freelancing+3, studium+1, gap-year+1
balance → fsj+2, gap-year+2, freelancing+1
```

---

## Quiz Data Shape

**R1** — 10 questions, single-select, adaptive (stops early if top-2 RIASEC types are consistent across 3 consecutive answers; ceiling 10). Each has `{ id, word, text, hint, why, multi: false, options[] }`. Options: 6 RIASEC + 1 unsure (`type: 'unsure'`, id ends in `_u`).

**R2** — 5 questions, always shown in full. Q0 = anchor (6 options). Q1 = income. Q2 = structure. Q3 = study openness. Q4 = risk tolerance.

---

## Path Data Shape

```js
{
  id, name, tagline, meta,
  description, riasecFit: string[],
  incomeFit: 'high'|'variable'|'low',
  typical_day, income_now, freedom, flexibility, outlook,
  minCert: string|null,
  clusters: string[],
  stories: string[],
  nextSteps: string[],          // 3 action steps shown on result card
  human_story: { name, quote, detail },
  branches?: [{ id, name, desc, meta }],  // studium only
}
```

6 paths: `ausbildung`, `studium`, `fsj`, `freelancing`, `bundeswehr`, `gap-year`.

---

## AI Chat (`chat.js`)

Floating button (`.chat-fab`) + slide-in drawer (`.chat-drawer`) mounted once to `document.body` — persists across all screen changes. Uses `claude-haiku-4-5-20251001`. API key in `localStorage` as `pf_api_key`. Context string (screen, userMode, anchor, suggested paths, etc.) is appended to the system prompt on each send via `getChatContext()` in `main.js`.

---

## CSS

All in `styles.css`. CSS custom properties in `:root`:
- `--green-text: #0D3328` (primary brand colour, used for buttons + chat FAB)
- `--green-primary: #1B5E4F`, `--green-dark: #134439`, `--green-light: #E8F5F1`
- `--bg-primary/secondary/tertiary`, `--text-primary/secondary/tertiary`
- `--border-primary/secondary/tertiary`
- `--font: 'Inter', system-ui`

---

## Key Known Gaps

- `savickasAnswers`, `successPicture`, and `blocks` are collected and shown as acknowledgement text on results — none feed into `logic/matching.js`
- Quiz flow (questions/order) is identical for all three `userMode` values — only results framing and wildcard count differ
- `data/stories.js` has placeholder content
- `data/path-details.js` is partially stale (doesn't include `nextSteps`/`human_story`)

---

## Full Detail

See `docs/PROTOTYPE_STATE.md` for the complete handoff document: all questions, full matching.js source, complete state model, brief-compliance checklist, and known gaps.
