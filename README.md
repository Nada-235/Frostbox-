# Frostbox

A shared fridge/freezer + shopping list app, installable to an iPhone home screen.

Built with **React**, **Tailwind CSS**, and **Vite**, syncing over **Firebase Firestore**.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

Only `src/lib/firebase-config.js` needs your real Firebase values — everything else works out of the box.
Firebase's web config values are not secrets; access is controlled by your Firestore
security rules, not by hiding these keys.

## Project structure

```
index.html                     Vite entry — mounts <App/> into #app
src/
  main.jsx                     ReactDOM root
  App.jsx                      App init (Firebase/session bootstrap) + screen switch
  index.css                    Tailwind import + design tokens (@theme) + base overrides

  app/
    AppContext.jsx              Single shared app state, as a React Context + reducer
    useHouseholdSession.js      Start/join/resume/leave household
    useReminders.js             Expiry reminder checking (on data change + every 60s)

  lib/
    firebase-config.js          ⚠️  THE ONLY FILE YOU NEED TO EDIT — paste your keys here
    firebase.js                 All Firestore reads/writes — the only file that knows about Firebase
    localStorage.js             Device-local persistence (which household, language)
    i18n.js                     English + Arabic strings, t() lookup
    formatting.js                Language-aware date/label/expiry-chip formatting
    constants.js                 Food & shopping categories
    utils.js                     Pure helpers (ids, dates) — no app dependencies
    toast.js / share.js          Small single-purpose UI actions
    useT.js                      t()/heading-font hooks bound to the current language

  components/
    Shell.jsx                    Logo, language-switch button
    Toast.jsx                    Toast host (subscribes to lib/toast.js)
    ui.jsx                       Small shared UI atoms (Switch, CatChip, SegButton, ...)

  screens/
    Onboarding.jsx                Start/join screen
    Setup.jsx                     "Firebase not configured yet" screen
    Main.jsx                      Tabbed shell (sticky header/footer + scroll body)
    ItemForm.jsx                  Add/edit fridge item
    ShopItemForm.jsx              Add/edit shopping item
    tabs/
      Fridge.jsx                  Fridge tab
      Shopping.jsx                 Shopping tab
      Household.jsx                Household/settings tab
```

## Why it's organized this way

- **One responsibility per file/hook.** `lib/firebase.js` only talks to Firestore — no
  components import Firestore directly. `lib/utils.js` has zero dependencies.
- **Single source of truth.** `app/AppContext.jsx` mirrors the original app's single shared
  `state` object, now as a Context + reducer — components read what they need and dispatch
  actions instead of mutating state directly.
- **Screens mirror the original view modules**: a tab exports `TabHeader`/`TabBody` (rendered
  in the sticky header vs. the scrollable body), single-page screens render themselves whole.
- **Styling is Tailwind utility classes** against a small custom theme (`src/index.css`
  `@theme` block) matching the app's original color palette and type scale. RTL is handled by
  `dir="rtl"` plus Tailwind's logical-property utilities (`ps-`, `pe-`, `start-`, `end-`, the
  `rtl:` variant) so most components don't need direction-specific overrides.

## Deploying

`npm run build` produces a static `dist/` folder — upload it to GitHub Pages, Netlify, Vercel,
or any static host. There's no server-side code; Firestore is reached directly from the browser
over your Firestore security rules.
