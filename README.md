# Frostbox

A shared fridge/freezer + shopping list app, installable to an iPhone home screen.

## Project structure

```
index.html                 Markup shell only — no logic
css/styles.css              All styles

js/
  app.js                    Entry point: screen registry + render loop
  state.js                  Single shared app state object
  render-bus.js              Tiny pub/sub so any module can trigger a re-render
  local-storage.js           Device-local persistence (which household, language)
  firebase-config.js         ⚠️  THE ONLY FILE YOU NEED TO EDIT — paste your keys here
  firebase-service.js        All Firestore reads/writes — the only file that knows about Firebase
  household-session.js       Start/join/leave household, wires live data to state
  reminders.js               Expiry reminder checking
  i18n.js                    English + Arabic strings, t() lookup
  formatting.js              Language-aware date/label/expiry-chip formatting
  constants.js                Food & shopping categories
  utils.js                   Pure helpers (ids, dates, escaping) — no app dependencies
  toast.js / share.js        Small single-purpose UI actions

  views/
    shell.js                 Shared bits (logo, language switch button)
    onboarding.js             Start/join screen
    setup.js                  "Firebase not configured yet" screen
    main.js                   Composes the tabbed screen (sticky header/footer + scroll body)
    fridge.js                 Fridge tab
    shopping.js                Shopping tab
    household.js               Household/settings tab
    item-form.js               Add/edit fridge item
    shop-item-form.js          Add/edit shopping item
```

## Why it's organized this way

- **One responsibility per file.** `firebase-service.js` only talks to Firestore — no DOM, no
  app state. `utils.js` has zero dependencies and could be unit tested with no setup.
- **No circular imports.** Dependencies only flow one direction:
  `state/utils/constants` → `i18n/formatting` → `firebase-service` →
  `household-session/reminders` → `views` → `app.js`. Nothing further down the list ever
  imports something further up.
- **Views don't call `render()` directly.** They call `requestRender()` from `render-bus.js`.
  This is what lets views trigger a re-render without importing `app.js` (which imports the
  views) — avoiding a circular import.
- **Every view exports the same shape**: `render()`/`bind()`, or for tabs,
  `renderHeader()`/`renderBody()`/`bind()`. `app.js` and `main.js` don't need to know
  anything about a screen's internals to display it.

## Editing

Only `js/firebase-config.js` needs your real values — everything else should just work.
Firebase's web config values are not secrets; access is controlled by your Firestore
security rules, not by hiding these keys.

## Deploying

This is a static site — no build step. Upload the **whole folder** (keeping the `css/` and
`js/` subfolders intact) to GitHub Pages, Netlify, or any static host. Opening `index.html`
directly as a `file://` URL will NOT work — ES modules require being served over
http(s), so it needs real hosting (even a simple `python3 -m http.server` locally works
for testing).
