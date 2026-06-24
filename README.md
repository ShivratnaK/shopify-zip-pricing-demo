# Shopify ZIP Code–Based Pricing Demo

## What this is
A demo where a customer on a Shopify product page enters a ZIP code, clicks
"Check Price," and sees a price returned from an external backend API based
on hardcoded ZIP-code pricing rules.

## Architecture
```
Shopify Product Page (storefront)
  -> ZIP input + "Check Price" button (injected via theme snippet)
  -> JS fetch() POST to backend /api/price with { zip, productId, variantId }
        -> Backend (Node/Express) looks up ZIP in a rules table
        -> Returns { zip, price }
  -> JS updates the page with the returned price
```

No Shopify Admin/Storefront API calls are required for this demo — the
ZIP/price lookup happens entirely against your own backend service, not
against Shopify's data. (See "v2 ideas" below for how to extend this to
actually update Shopify's price via the Admin API.)

## Part 1 — Backend (deploy first)

1. `cd backend`
2. `npm install`
3. Test locally: `npm start` then `curl -X POST http://localhost:3000/api/price -H "Content-Type: application/json" -d '{"zip":"75028"}'`
4. Deploy for free on Render.com (or Railway/Fly.io):
   - Push this `backend/` folder to a GitHub repo.
   - On Render: New -> Web Service -> connect repo -> Build command `npm install` -> Start command `npm start`.
   - Note the public URL Render gives you, e.g. `https://zip-price-backend.onrender.com`

## Part 2 — Shopify dev store

1. Go to https://www.shopify.com/partners and create a free Partner account
   (if you don't have one).
2. Partner Dashboard -> Stores -> Add store -> Development store.
3. In the new store's Admin, go to Products -> Add product. Create one
   sample product (e.g. "Demo Treadmill", price $1,599).
4. Online Store -> Themes -> make sure a theme (e.g. Dawn) is installed.

## Part 3 — Wire up the widget

1. Online Store -> Themes -> "..." -> Edit code.
2. Under `Snippets`, click "Add a new snippet," name it `zip-price-widget`.
3. Paste the contents of `shopify-snippet/zip-price-widget.liquid` into it.
4. **Edit the `BACKEND_URL`** line near the top of the `<script>` to your
   deployed Render URL + `/api/price`.
5. Open `Sections` -> `main-product.liquid` (name may vary by theme).
   Find where the price is rendered (search for `price` or `product.price`).
   Right after that block, add:
   ```liquid
   {% render 'zip-price-widget', product: product %}
   ```
6. Save. Click "Preview" on the theme, open the sample product page.

## Part 4 — Test

Enter these ZIP codes and confirm different prices come back:

| ZIP   | Expected Price |
|-------|-----------------|
| 75028 | $1,499.00 |
| 10001 | $1,699.00 |
| 90210 | $1,799.00 |
| (any other 5-digit ZIP) | $1,599.00 (default) |

## Part 5 — Record the demo video
Screen-record: open product page -> enter 75028 -> click Check Price -> show
price -> change to 10001 -> show price change -> change to 90210 -> show
price change again.

## v2 ideas (mention these as "next steps" if asked)
- Replace the manual theme-edit with a real **Theme App Extension** (Shopify
  CLI `shopify app generate extension --type=theme_app_extension`) so it
  installs as an app block without editing theme code directly.
- Replace hardcoded rules with a real shipping-zone/zip-to-price database.
- Use the Shopify **Admin API** to actually update a draft order or cart
  line price, rather than just displaying a quoted price.
- Add ZIP validation against a real ZIP database / distance-based pricing.
