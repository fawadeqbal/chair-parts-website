# Ali Chair Parts — website

Single-page website for **Ali Chair Parts**, Kohati Bazar, Rawalpindi: office and gaming chair parts, wholesale and retail.

Static HTML + Tailwind CSS + one small JavaScript file. Tailwind is compiled at deploy time by GitHub Actions; there is no framework and no server.

## Structure

```
index.html                          The whole page (product cards generated, see below)
src/input.css                       Tailwind source: fonts, components (buttons, fields), motion
tailwind.config.js                  Design tokens: brand colours, fonts, radius, shadows
assets/css/tw.css                   Built CSS (generated — don't edit by hand)
assets/js/main.js                   Menu, filters, quote list, quick view, quote request, open/closed badge
assets/fonts/                       Self-hosted Barlow fonts (SIL Open Font License)
assets/img/                         Favicon, app icons, og-image.jpg (link preview)
tools/build-products.py             Product list → catalog cards in index.html
tools/update-structured-data.py     Page → Google structured data (JSON-LD)
sitemap.xml, robots.txt             For search engines
site.webmanifest, 404.html          App icon manifest, not-found page
.github/workflows/pages.yml         Builds CSS and deploys to GitHub Pages on every push to main
```

## Run locally

```bash
npm ci                     # once
npm run watch:css          # rebuilds assets/css/tw.css as you edit
python3 -m http.server 8080
# open http://localhost:8080
```

## How buying works on the site

1. **Find the part:** hero tiles, "What's wrong with your chair?" tiles and the sticky filter chips all filter the same catalog.
2. **Quick view:** tap a card for a larger photo and a "Check your old part" measuring guide (`MEASURE` in `main.js`).
3. **Quote list:** "Add to quote" collects parts (kept for the browser session); the header shows the count.
4. **Request a quote:** the form checks name, mobile and city, then opens WhatsApp with a structured message (parts × quantities, details, contact). Nothing is sent to a server or stored.

Single questions still go straight to WhatsApp ("Send a photo", "Ask on WhatsApp" in quick view).

## Deploy (GitHub Pages)

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`. The site is published at `https://<user>.github.io/chair-parts-website/`.

To use your own domain, add it under **Settings → Pages → Custom domain**.

## Before going live: confirm with the owner

The page is client-ready, with no visible placeholders. A few details came from the shop's public Google Maps listing or are stand-ins, so check them with the owner:

| Item | Where | Status |
|---|---|---|
| Opening hours (Sat–Thu 9am–5pm, Friday closed) | Visit section, FAQ, structured data | From the Google Maps listing — confirm |
| "Rated 5.0 on Google" | Hero | From the Google Maps listing (4 reviews at the time of writing) |
| Map pin and directions | Visit section | Pinned to the shop's Google Maps place ("Chair Parts", Shop # 0/789, Kohati Bazar) |
| Product photos | Product cards, hero tiles | Free-licensed stand-ins from Wikimedia Commons (credited in the footer). Replace with the shop's own photos |
| Prices | Product cards | Cards show "Price on request". Set `price` per product in `tools/build-products.py` to show "from Rs …" |
| Delivery | How it works, step 3 | Says "ask us about getting it sent to you" — update if the shop delivers |
| `og:image` | `<head>` | Add a 1200×630 photo for link previews on WhatsApp/Facebook |

Note: the Google listing shows a second phone number (0340-5791689). The site only uses the number on the visiting card (0300-2603791).

## Editing common things

- **Products:** edit `PRODUCTS` in `tools/build-products.py` (name, note, badge, photo, price), then run `python3 tools/build-products.py && python3 tools/update-structured-data.py`.
- **Real photos:** put them in `assets/img/parts/`, add an entry to `PHOTOS` with `"src": "assets/img/parts/<file>.webp"` (add `"fit": "contain"` for cut-outs on white), and point the product's `photo` at it. Same angle and white background for every part works best.
- **Specs (phase 3):** when the owner supplies supplier labels, add them to each product and show up to 3 chips (Fit / Strength / Size) — see the design spec.
- **Measuring guides:** `MEASURE` in `assets/js/main.js`, one list per part kind.
- **Phone / WhatsApp number:** `index.html` (`tel:` links and text) and `WHATSAPP_NUMBER` in `assets/js/main.js`.
- **Colours and fonts:** `tailwind.config.js`; shared button/field styles in `src/input.css`.
- **Photo credits:** if you replace all the Wikimedia photos, delete the "Photo credits" block in the footer.

## SEO

What's in place:

- **Title, description and headings** target "office & gaming chair parts in Rawalpindi"; the H1 includes the location.
- **Structured data** (JSON-LD in `<head>`): Store (name, address, phone, map, hours, area served, product catalog), WebSite, WebPage and FAQPage. It's generated from the page — after editing the FAQ, products, address, phone or hours, run:

  ```bash
  python3 tools/update-structured-data.py
  ```

- **Link previews** for WhatsApp/Facebook/X (`og:*`, `twitter:*`, `assets/img/og-image.jpg`).
- **Canonical URL, sitemap, robots, manifest, 404 page.**
- **Speed:** fonts self-hosted and preloaded, images sized and lazy-loaded, the map loads only when scrolled near. Lighthouse: SEO 100, Accessibility 100, Best Practices 100, Performance 94 (mobile) / 99 (desktop).

### Steps only the owner can do (they matter most for local search)

1. **Google Business Profile** — the shop is already on Google Maps as "Chair Parts". Claim it at business.google.com, rename it to **Ali Chair Parts**, add the website link, the 0300-2603791 number, photos of the shop and parts, and a fitting category (e.g. office furniture store). Keep name, address and phone exactly the same as on the website.
2. **Google Search Console** — at search.google.com/search-console add the site (URL-prefix property `https://fawadeqbal.github.io/chair-parts-website/`), verify with the HTML-tag method (paste the tag into `<head>`), then submit `sitemap.xml`.
3. **Reviews** — ask happy customers to leave a Google review; review count and recency are a major local ranking factor.
4. **Own domain** (recommended) — e.g. `alichairparts.pk`. Then replace `https://fawadeqbal.github.io/chair-parts-website/` everywhere (`index.html`, `sitemap.xml`, `robots.txt`, `tools/update-structured-data.py`) and the `/chair-parts-website/` paths in `404.html`.
5. **Local listings** — add the same name/address/phone to the shop's Facebook page, Instagram and other directories, and link them back to the website.
