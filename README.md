# Subrata Mallick — Portfolio

Static site (HTML, CSS, JavaScript). No build step.

## Files
- `index.html`, `styles.css`, `script.js` — the site
- `assets/` — resume and certificate PDFs (replace a file, keep its name, to update it)
- `vercel.json` — Vercel settings

## Deploy on Vercel
**Option A — GitHub (recommended)**
1. Create a new GitHub repository and upload everything in this folder.
2. Go to vercel.com/new, import the repository.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Click Deploy.

**Option B — Vercel CLI**
```
npm i -g vercel
cd portfolio
vercel --prod
```

## Themes
Dawn 05:00–08:00, Day 08:00–16:00, Evening 16:00–19:00, Night 19:00–05:00 (visitor's local time).
Visitors can override it with the theme button; edit `themeForHour()` in `script.js` to change the hours.
