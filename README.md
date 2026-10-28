# Ali Chair Parts — website

Single-page website for **Ali Chair Parts**, Kohati Bazar, Rawalpindi: office and gaming chair parts, wholesale and retail.

Plain HTML, CSS and a small JavaScript file. No build step, no dependencies, so it loads fast on mobile data and can be hosted anywhere.

## Structure

```
index.html                          The whole page
assets/css/styles.css               Styles (mobile-first, breakpoints at 480/640/768/960/1200px)
assets/js/main.js                   Mobile menu, product filters, finder, WhatsApp links, open/closed badge
assets/fonts/                       Self-hosted Barlow fonts (SIL Open Font License)
assets/img/                         Favicon, app icons, og-image.jpg (link preview)
sitemap.xml, robots.txt             For search engines
site.webmanifest, 404.html          App icon manifest, not-found page
tools/update-structured-data.py     Rebuilds the Google structured data from the page
.github/workflows/                  Deploys to GitHub Pages on every push to main
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

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
| Product photos | Product cards, hero card | Free-licensed stand-ins from Wikimedia Commons (credited in the footer). Replace with the shop's own photos |
| Prices | Product cards | Every card says "Ask today's price" and opens WhatsApp. Add real prices if the owner wants them shown |
| Delivery | How it works, step 3 | Says "ask us about getting it sent to you" — update if the shop delivers |
| `og:image` | `<head>` | Add a 1200×630 photo for link previews on WhatsApp/Facebook |

Note: the Google listing shows a second phone number (0340-5791689). The site only uses the number on the visiting card (0300-2603791).

## Editing common things

- **Phone / WhatsApp number**: the number appears in `index.html` (`tel:` links and text) and once in `assets/js/main.js` (`WHATSAPP_NUMBER`).
- **Add a product**: copy one `<li class="card" …>` block in `index.html`. Set `data-cat` to one of `gas`, `base`, `arm`, `mech`, `seat`, `chair` so the filters pick it up, and set `data-product` on its button: that text goes into the WhatsApp message.
- **Product photos**: put the photo in `assets/img/` and point the card's `<img src>` at it (remove the `srcset` attribute). Square-ish photos around 800px wide work best. Add `card__img--contain` to the image's class for cut-out product shots on white.
- **Photo credits**: if you replace all the Wikimedia photos, delete the "Photo credits" block in the footer.

## SEO

What's in place:

- **Title, description and headings** target "office & gaming chair parts in Rawalpindi"; the H1 includes the location.
- **Structured data** (JSON-LD in `<head>`): Store (name, address, phone, map, hours, area served, product catalog), WebSite, WebPage and FAQPage. It's generated from the page — after editing the FAQ, products, address, phone or hours, run:

  ```bash
  python3 tools/update-structured-data.py
  ```

- **Link previews** for WhatsApp/Facebook/X (`og:*`, `twitter:*`, `assets/img/og-image.jpg`).
- **Canonical URL, sitemap, robots, manifest, 404 page.**
- **Speed:** fonts self-hosted and preloaded, hero photo preloaded, images sized and lazy-loaded. Lighthouse: SEO 100, Accessibility 100, Best Practices 100, Performance 98 (mobile) / 100 (desktop).

### Steps only the owner can do (they matter most for local search)

1. **Google Business Profile** — the shop is already on Google Maps as "Chair Parts". Claim it at business.google.com, rename it to **Ali Chair Parts**, add the website link, the 0300-2603791 number, photos of the shop and parts, and a fitting category (e.g. office furniture store). Keep name, address and phone exactly the same as on the website.
2. **Google Search Console** — at search.google.com/search-console add the site (URL-prefix property `https://fawadeqbal.github.io/chair-parts-website/`), verify with the HTML-tag method (paste the tag into `<head>`), then submit `sitemap.xml`.
3. **Reviews** — ask happy customers to leave a Google review; review count and recency are a major local ranking factor.
4. **Own domain** (recommended) — e.g. `alichairparts.pk`. Then replace `https://fawadeqbal.github.io/chair-parts-website/` everywhere (`index.html`, `sitemap.xml`, `robots.txt`, `tools/update-structured-data.py`) and the `/chair-parts-website/` paths in `404.html`.
5. **Local listings** — add the same name/address/phone to the shop's Facebook page, Instagram and other directories, and link them back to the website.
