CHLOE HART — SEO-FRIENDLY PRODUCT URL DEPLOY

Deploy this project through a Git-connected Netlify site or Netlify CLI/API so Netlify builds and publishes the Functions. A plain static-only upload will not deploy the serverless product-page and sitemap functions.

Upload the CONTENTS of this folder to the project repository root (not the enclosing folder).
Keep this structure:
  index.html
  _redirects
  robots.txt
  netlify.toml
  netlify/functions/product-page.mjs
  netlify/functions/sitemap.mjs

What this does:
- Product cards open clean URLs such as /products/cotton-short-kurti-XXXXXXXX.
- Each product URL gets server-rendered title, description, canonical URL, Open Graph tags and Product JSON-LD.
- /sitemap.xml is generated from the current public products table, so newly added products appear automatically.
- The homepage and admin panel remain in index.html; existing Supabase products/media and theme toggle are retained.

After deploy:
1. Open https://chloehart.netlify.app/sitemap.xml and check that product URLs appear.
2. In Google Search Console, submit sitemap.xml again (same sitemap URL) if needed.
3. Use URL Inspection on one /products/... URL and Request Indexing.

Note: These are crawlable product pages; Google still decides whether/when to index them. Product details and prices can change; keep descriptions accurate.


Important deployment note: Netlify Functions are built from the functions directory during a Netlify build. Connect the project to a Git repository (recommended) or deploy with Netlify CLI/API. Do not use a static-only file upload if you want dynamic product URLs and the live sitemap.
