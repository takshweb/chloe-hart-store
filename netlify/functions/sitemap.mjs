const SUPABASE_URL = "https://hmdiubuypaxjphrvskpk.supabase.co";
const SUPABASE_KEY = "sb_publishable_RIvX64bbhpWbFHVA64hMmw_eH07eiCF";
const SITE = "https://chloehart.netlify.app";
const slugify = (name) => String(name || "product").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0,70) || "product";
const slugFor = (p) => `${slugify(p.name)}-${String(p.id).slice(0,8)}`;
export default async () => {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,created_at&order=created_at.desc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) throw new Error("Could not retrieve product list");
    const products = await res.json();
    const entries = products.map(p => {
      const loc = `${SITE}/products/${slugFor(p)}`;
      const lastmod = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
      return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>${entries}</urlset>`;
    return new Response(xml, { headers: { "content-type":"application/xml; charset=utf-8", "cache-control":"public, max-age=60, s-maxage=300" } });
  } catch (err) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/</loc></url></urlset>`, { headers: { "content-type":"application/xml; charset=utf-8", "cache-control":"no-store" } });
  }
};
