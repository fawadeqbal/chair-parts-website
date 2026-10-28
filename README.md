# Ali Chair Parts — website

Single-page website for **Ali Chair Parts**, Kohati Bazar, Rawalpindi: office and gaming chair parts, wholesale and retail.

Plain HTML, CSS and a small JavaScript file. No build step, no dependencies, so it loads fast on mobile data and can be hosted anywhere.

## Structure

```
index.html              The whole page
assets/css/styles.css   Styles (mobile-first, breakpoints at 480/640/768/960/1200px)
assets/js/main.js       Mobile menu, product filters, "fix my chair" finder, WhatsApp links
assets/img/favicon.svg  Browser tab icon
.github/workflows/      Deploys to GitHub Pages on every push to main
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
