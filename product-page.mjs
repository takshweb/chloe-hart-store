const SUPABASE_URL = "https://hmdiubuypaxjphrvskpk.supabase.co";
const SUPABASE_KEY = "sb_publishable_RIvX64bbhpWbFHVA64hMmw_eH07eiCF";
const SITE = "https://chloehart.netlify.app";

const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[c]));
const safeUrl = (v) => {
  try { const u = new URL(String(v)); return ["https:","http:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
};
const slugify = (name) => String(name || "product").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0,70) || "product";
const slugFor = (p) => `${slugify(p.name)}-${String(p.id).slice(0,8)}`;
const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

async function getProducts() {
  const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,category,description,image_url,image_urls,video_url,price,mrp,affiliate_link,store,created_at`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Product lookup failed (${res.status})`);
  return await res.json();
}
function productMarkup(p, images) {
  const imageMarkup = images.length
    ? `<div class="detail-gallery"><img class="detail-hero-media" src="${esc(images[0])}" alt="${esc(p.name)}">${images.length > 1 ? `<div class="detail-thumbs">${images.slice(0,8).map((u,i)=>`<img src="${esc(u)}" alt="${esc(p.name)} photo ${i+1}" loading="lazy">`).join("")}</div>` : ""}${safeUrl(p.video_url) ? `<video class="detail-video" controls playsinline preload="metadata" src="${esc(safeUrl(p.video_url))}"></video>` : ""}</div>`
    : `<div class="detail-gallery"><div class="detail-placeholder">🛍️</div></div>`;
  const description = p.description || `Explore ${p.name}, a handpicked ${p.category || "fashion and lifestyle"} find from Chloe Hart.`;
  const price = Number(p.price || 0), mrp = Number(p.mrp || 0);
  const discount = mrp > price && mrp > 0 ? Math.round((mrp-price)*100/mrp) : 0;
  return `<section id="detailRoot" class="detail-root"><a class="detail-back" href="/">← Back to all finds</a><article class="detail-panel">${imageMarkup}<div class="detail-copy"><span class="cat">${esc(p.category || "Find")}</span><h2>${esc(p.name)}</h2><p class="detail-description">${esc(description)}</p><div class="detail-price"><strong>${money(price)}</strong>${mrp > price ? `<s>${money(mrp)}</s><span class="detail-off">${discount}% OFF</span>` : ""}</div><a class="detail-buy btn" href="${esc(safeUrl(p.affiliate_link))}" target="_blank" rel="noopener sponsored nofollow">VIEW DEAL →</a><p class="detail-note">Some links are affiliate links. Prices may change.</p></div></article></section>`;
}
export default async (request) => {
  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.replace(/^\/products\//, "").replace(/\/$/, ""));
  try {
    const products = await getProducts();
    const p = products.find(x => slugFor(x) === slug);
    if (!p) return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Product not found | Chloe Hart</title></head><body><h1>Product not found</h1><p><a href="/">Return to Chloe Hart</a></p></body></html>`, { status: 404, headers: { "content-type":"text/html; charset=utf-8" } });

    const canonical = `${SITE}/products/${slugFor(p)}`;
    const title = `${p.name} | ${p.category || "Fashion & Lifestyle"} | Chloe Hart`;
    const description = String(p.description || `Explore ${p.name}, a handpicked ${p.category || "fashion and lifestyle"} find from Chloe Hart.`).slice(0, 155);
    const images = (Array.isArray(p.image_urls) && p.image_urls.length ? p.image_urls : (p.image_url ? [p.image_url] : [])).map(safeUrl).filter(Boolean);
    const schema = {
      "@context":"https://schema.org", "@type":"Product",
      name:p.name, description, category:p.category || undefined,
      image:images.length ? images : undefined,
      sku:String(p.id),
      offers:Number(p.price)>0 ? {"@type":"Offer",url:canonical,priceCurrency:"INR",price:String(p.price)} : undefined
    };
    const origin = url.origin;
    const shellRes = await fetch(`${origin}/index.html`);
    if (!shellRes.ok) throw new Error("Could not load storefront shell");
    let html = await shellRes.text();
    const meta = (name, content, attr="name") => {
      const re = new RegExp(`<meta\\s+${attr}="${name}"\\s+content="[^"]*"\\s*>`, "i");
      const tag = `<meta ${attr}="${name}" content="${esc(content)}">`;
      if (re.test(html)) html = html.replace(re, tag);
      else html = html.replace("</head>", `${tag}</head>`);
    };
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
    meta("description", description);
    meta("og:type", "product", "property");
    meta("og:site_name", "Chloe Hart", "property");
    meta("twitter:card", "summary_large_image");
    meta("twitter:title", title);
    meta("twitter:description", description);
    meta("og:title", title, "property");
    meta("og:description", description, "property");
    meta("og:url", canonical, "property");
    if (images[0]) meta("og:image", images[0], "property");
    html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`);
    html = html.replace("</head>", `<script type="application/ld+json" id="productSchema">${JSON.stringify(schema).replace(/</g,"\\u003c")}</script></head>`);
    html = html.replace('<header class="hero">', '<header class="hero" hidden>');
    html = html.replace('<main class="store-main">', '<main class="store-main" hidden>');
    html = html.replace('<footer>', '<footer hidden>');
    html = html.replace('<section id="detailRoot" class="detail-root" hidden></section>', productMarkup(p, images));
    return new Response(html, { headers: { "content-type":"text/html; charset=utf-8", "cache-control":"public, max-age=60, s-maxage=300" } });
  } catch (err) {
    return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Chloe Hart</title></head><body><p>Temporarily unable to load this product. <a href="/">Visit Chloe Hart</a>.</p></body></html>`, { status: 503, headers: { "content-type":"text/html; charset=utf-8", "cache-control":"no-store" } });
  }
};
