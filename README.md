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

## Before going live: fill in the placeholders

Search the code for `TODO` and `[` to find them all.

| Placeholder | Where | What to put |
|---|---|---|
| `Rs [PRICE]` | Each product card, hero comparison card | Real price, or change to "Ask for price" |
| `Rs [NEW CHAIR]`, `Rs [SAVING]` | Hero comparison card | Typical new-chair price and the saving |
| `[SHOP HOURS]` | Visit section | Opening days and times |
| `[CONFIRM: delivery …]` | How it works, step 3 | Whether the shop delivers, and where |
| `[CONFIRM exchange policy …]` | FAQ | The shop's exchange / return rule |
| `[CONFIRM: written quotes …]` | Bulk orders | Whether institutions get written quotations |
| Map | Visit section | The map pins Kohati Bazar; swap in the shop's exact Google Maps embed |
| `og:image` | `<head>` | A 1200×630 photo for link previews on WhatsApp/Facebook |

## Editing common things

- **Phone / WhatsApp number**: the number appears in `index.html` (`tel:` links and text) and once in `assets/js/main.js` (`WHATSAPP_NUMBER`).
- **Add a product**: copy one `<li class="card" …>` block in `index.html`. Set `data-cat` to one of `gas`, `base`, `arm`, `mech`, `seat`, `chair` so the filters pick it up, and set `data-product` on its button: that text goes into the WhatsApp message.
- **Product photos**: replace the `<svg>…</svg>` inside `.card__media` with `<img src="assets/img/your-photo.jpg" alt="…" loading="lazy">` and add `object-fit: cover; width: 100%; height: 100%;` for the image.
