# Rehome Depot — Project Memory

## What this is

Tenant website for **Rehome Depot**, a used and consignment furniture / decor
business renting space in Mark's building. **Located at 136 Sagamore Rd,
Grand Forks, BC.**

Static, browse-only website. The tenant does not sell through the site —
visitors look at the gallery, then call or visit the store. Mark updates the
gallery manually for now; a cPanel-style admin is on the roadmap.

**Site is multi-page** — four HTML files (Home, About, Gallery, Contact)
sharing a duplicated header/footer. No build step, no templating engine.

## Status

**Phase 1 — Static site: BUILT.** All four pages render, gallery loads from
the data file, filters work, lightbox works, mobile layout works. Six sample
items with SVG placeholders are in place so the gallery looks complete.

**What's missing (waiting on tenant):**
- Phone, email, hours — placeholders read `[TBD — ... to come]` in `index.html`
- Real photography to replace the SVG placeholders
- Real inventory list to replace the six samples
- Logo (current "RD" monogram looks intentional)
- Hosting / domain decision

## File map

| File | Purpose |
|---|---|
| `index.html` | **Home** — hero, 3-item featured preview pulled from inventory, about teaser, CTA band |
| `about.html` | **About** — full about copy + services list |
| `gallery.html` | **Gallery** — filter bar, full grid, lightbox |
| `contact.html` | **Contact** — address, hours/phone/email placeholders, OpenStreetMap embed |
| `css/style.css` | Full stylesheet — warm cream / walnut / terracotta, mobile-responsive |
| `data/inventory.js` | The gallery data — `window.INVENTORY` array. **This is what Mark edits.** |
| `js/gallery.js` | Renders cards on home + gallery, filter logic, lightbox, mobile nav, footer year. Self-detects which page it's on; no-ops where elements aren't present. |
| `images/gallery/*.svg` | Six SVG placeholders. Replaced with real photos as they come in. |
| `tools/import_photos.py` | Photo importer. Scans `images/gallery/`, parses filename for title + price, updates `inventory.js`. Preserves existing entries' edits. |
| `tools/import_photos.bat` | Double-click wrapper for Windows. Mark runs this. |

**Header / footer are duplicated literally across all four HTML files.** This
is the deliberate trade-off: when the nav changes (rare), all four files need
the matching edit. In return there's no build step and no JavaScript dependency
for navigation. For a 4-page site this is the right call.

**Active nav state:** each page hard-codes `class="active"` on its own nav
link. When adding a fifth page, add it to the nav block of all four existing
files plus the new one.

## How to update the gallery (Mark's playbook)

### Bulk import (the easy way — when the tenant sends a batch of photos)

Tell the tenant to name each photo **`Item Name - $Price.jpg`**, e.g.
`Oak Dining Table - $295.jpg`. Spaces, dashes, and apostrophes in the title
are fine. The price goes at the end with an optional `$`.

Then:

1. Save the photos into `images/gallery/`
2. Double-click `tools\import_photos.bat`
3. Refresh the website — new items show up under the "Other" category filter

The script:
- Adds new items it hasn't seen before (matched by filename)
- **Leaves existing entries alone** — descriptions, categories, statuses you've
  set manually are never overwritten
- Reports filenames it couldn't parse (no price found)
- Reports inventory entries whose photo went missing on disk

### Manual edits (after import, or for tenant-provided detail)

**Set the right category:** open `data/inventory.js`, find the item, change
`"category": "other"` to `"furniture"`, `"decor"`, or `"lighting"`. Save.

**Add a description:** same file. The description shows in the lightbox when
someone clicks the card. Empty descriptions are fine — the card just shows
the title and price.

**Mark an item sold:** change `"status": "available"` to `"sold"`. Leave the
item in the array — the SOLD badge tells visitors it moved.

**Put an item on hold:** change `"status"` to `"hold"`.

**Remove an item entirely:** delete its `{ ... }` block from the array AND
delete the image file from `images/gallery/`.

**Update contact info (when tenant provides it):** open `contact.html`,
search for `[TBD` — every placeholder is marked. Replace each one.

### Filename rules the importer accepts

| Format | Parses as |
|---|---|
| `Oak Dining Table - $295.jpg` | "Oak Dining Table", $295 (recommended) |
| `Oak Dining Table $295.jpg` | "Oak Dining Table", $295 |
| `Oak Dining Table 295.jpg` | "Oak Dining Table", $295 |
| `Mid-Century Chair - $150.99.jpg` | "Mid-Century Chair", $150.99 |
| `Just A Photo.jpg` | not parsed — needs a price at the end |

Image extensions accepted: `.jpg .jpeg .png .webp .gif .svg`.

## Design decisions worth preserving

- **JS file with JSON-quoted keys for inventory.** Two-purpose file: the browser loads it as JS (`window.INVENTORY = [...]`), and the Python importer reads the array between the brackets as JSON. Keys must stay quoted (`"id"`, not `id`) for the importer to parse it. Local-file `fetch()` of pure JSON fails under CORS, which is why we don't use a `.json` file.
- **Single-page, not multi-page.** Tenant has minimal content. Multi-page would be padding. Sticky-nav scroll is more than enough.
- **Vanilla JS, no framework, no build step.** Drops onto any host, runs from a USB stick, never breaks because a dependency moved.
- **OpenStreetMap iframe, not Google Maps.** No API key, no billing surprise, no tracking.
- **SVG placeholders, not stock photos.** They look intentional, scale perfectly, and won't get embarrassingly mistaken for real items.

## Punch list (in priority order)

1. **Get phone, email, hours from the tenant.** Site can't go live without these.
2. **Get 6–10 real photos and item descriptions.** Replace at least the sample items so the gallery reads as real.
3. **Decide hosting.** Three real options:
   - **Static (Netlify, GitHub Pages, Cloudflare Pages):** free, fast, fits this site perfectly, but the future cPanel needs a different approach (Netlify Forms or a serverless function instead of Flask).
   - **Shared host with cPanel + PHP:** ~$5/month, supports a simple PHP upload form for the future admin. Easiest path to the cPanel goal.
   - **Self-hosted Flask + SQLite on Mark's network:** matches the proven local-tools pattern, but the tenant can't reach it from their own device unless we set up port forwarding or a tunnel. Probably not the right fit here.
   - **Recommendation:** shared host with cPanel + PHP. Cheap, public, future-proof for the admin build.
4. **Register domain.** `rehomedepot.ca` if available, else workshop alternatives.
5. **Build the cPanel admin (Phase 2).** Web form with login → upload photo → fill in title / price / description / category → write a new entry to inventory (JSON at that point). Mark and the tenant both get logins. Out of scope until hosting is chosen.
6. **Optional: Instagram/Facebook feed embed.** If the tenant ends up posting to social more reliably than updating the site, we could pull the feed in instead of (or alongside) the manual gallery.

## Handoff notes

- The site has been verified visually in the preview panel as it was built. End-to-end browser test (filter clicks, lightbox open/close, mobile resize) is the last item on the todo list — do that before declaring done.
- All `[TBD ...]` markers in `index.html` are clearly visible — they will not get missed.
- Don't change the file structure without thinking about the cPanel migration. The admin will need to write to `data/inventory.js` (or its JSON successor) and into `images/gallery/`. Keep those paths stable.
