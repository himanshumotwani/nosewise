# nosewise

Your nose knows. We just help it choose.

A static perfume suggestor: answer 6 quick questions and get 3 perfumes that
actually fit you — or browse all 25 picks with filters for who it's for,
scent family, occasion, strength, and budget.

## Run it

No build step, no backend, no external APIs at runtime. Serve the folder
with any static server, or open `index.html` directly:

```bash
npx serve .
```

## What's inside

- `index.html` — home, quiz, results, and browse views
- `styles.css` — styling (modern, minimal)
- `catalog.js` — the 25-perfume catalog with tags and descriptions
- `app.js` — quiz flow and scoring, browse filters
- `images-opt/` — optimized bottle photos for the catalog

Budget is shown in relative tiers only — no exact prices.
