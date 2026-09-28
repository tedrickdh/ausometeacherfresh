// Create route-specific HTML so crawlers and link previews receive the right
// title, description, canonical, and useful page text before JavaScript runs.
const fs = require("fs");
const path = require("path");
const pages = require("../src/seo-pages.json");

const site = "https://au-someteacher.com";
const build = path.resolve(__dirname, "../build");
const template = fs.readFileSync(path.join(build, "index.html"), "utf8");
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

function tag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Missing ${label} in built HTML`);
  return html.replace(pattern, replacement);
}

const publicPaths = Object.keys(pages).filter((route) => !pages[route].noindex);
for (const [route, page] of Object.entries(pages)) {
  const url = `${site}${route}`;
  const title = escapeHTML(page.title);
  const description = escapeHTML(page.description);
  const canonical = escapeHTML(url);
  let html = template;
  html = tag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "title");
  html = tag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`, "description");
  html = tag(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/, `<meta name="robots" content="${page.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`, "robots");
  html = tag(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`, "canonical");
  for (const [property, value] of [["og:title", title], ["og:description", description], ["og:url", canonical]]) {
    const pattern = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*\\/>`);
    html = tag(html, pattern, `<meta property="${property}" content="${value}" />`, property);
  }
  for (const [name, value] of [["twitter:title", title], ["twitter:description", description]]) {
    const pattern = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*\\/>`);
    html = tag(html, pattern, `<meta name="${name}" content="${value}" />`, name);
  }

  // The React app replaces this content on load. It remains readable with JS off.
  const links = publicPaths.map((item) => `<a href="${escapeHTML(item)}">${escapeHTML(pages[item].heading)}</a>`).join(" · ");
  const fallback = `<main style="max-width:60rem;margin:3rem auto;padding:1rem;font:18px/1.6 Arial,sans-serif"><h1>${escapeHTML(page.heading)}</h1><p>${escapeHTML(page.intro)}</p><nav aria-label="Explore Au-Some Teacher">${links}</nav></main>`;
  html = tag(html, /<div id="root"><\/div>/, `<div id="root">${fallback}</div>`, "React root");

  const output = route === "/" ? path.join(build, "index.html") : path.join(build, "_seo", `${route.slice(1)}.html`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map((route) => `  <url><loc>${site}${route}</loc></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(build, "sitemap.xml"), sitemap);
console.log(`Generated HTML for ${Object.keys(pages).length} routes and sitemap for ${publicPaths.length} public pages.`);
