// Dev-only Openverse fetcher (Node 18+). NOT shipped to production.
// Strictly filters to commercially-safe licenses (cc0, pdm, by, by-sa).
// Records accurate attribution metadata for each downloaded image.
//
// Usage: node tools/fetch_openverse.mjs
import { writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";

const TARGET = "assets/img";
const CREDITS = "assets/credits.json";
const SAFE = ["cc0", "pdm", "by", "by-sa"];
const RENDERABLE = /\.(jpe?g|png|webp)(\?|$)/i;
const UA = "PatagoniaGarage-DevFetch/1.0";

// id -> ordered list of candidate queries (first good hit wins)
const SLOTS = [
  { id: "brisket",   queries: ["sliced beef brisket smoked", "smoked brisket barbecue", "beef brisket plate"] },
  { id: "ribs",      queries: ["barbecue pork ribs smoked", "smoked pork ribs rack"] },
  { id: "vacio",     queries: ["grilled flank steak sliced", "churrasco grilled beef sliced"] },
  { id: "asado",     queries: ["argentine asado grill fire", "asado parrilla fire embers"] },
  { id: "brasas",    queries: ["burning charcoal embers glow", "fireplace logs flames embers"] },
  { id: "garage",    queries: ["classic car garage workshop", "vintage cars garage"] },
  { id: "patagonia", queries: ["patagonia mountains landscape", "torres del paine patagonia"], aspect: "wide" },
  { id: "interior",  queries: ["pub bar counter night interior", "dark moody bar interior"] },
];

async function apiSearch(q, aspect) {
  let url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=${SAFE.join(",")}&mature=false&page_size=12`;
  if (aspect) url += `&aspect_ratio=${aspect}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

function pick(results) {
  return results.find(
    (r) => r.url && RENDERABLE.test(r.url) && SAFE.includes((r.license || "").toLowerCase())
  );
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2048) throw new Error("too small");
  await writeFile(dest, buf);
  return buf.length;
}

const credits = {};
for (const slot of SLOTS) {
  let done = false;
  for (const q of slot.queries) {
    try {
      const results = await apiSearch(q, slot.aspect);
      const r = pick(results);
      if (!r) { process.stdout.write(`  [${slot.id}] "${q}" -> no safe result\n`); continue; }
      const ext = (r.url.match(RENDERABLE)[1] || "jpg").toLowerCase().replace("jpeg", "jpg");
      const filename = `${slot.id}.${ext}`;
      const kb = Math.round((await download(r.url, `${TARGET}/${filename}`)) / 1024);
      credits[slot.id] = {
        src: `${TARGET}/${filename}`,
        title: r.title || "Untitled",
        creator: r.creator || "Unknown",
        creator_url: typeof r.creator_url === "string" ? r.creator_url : "",
        license: (r.license || "").toLowerCase(),
        license_version: r.license_version || "",
        license_url: r.license_url || "",
        foreign_landing_url: r.foreign_landing_url || "",
        source: r.source || "",
      };
      process.stdout.write(`  [${slot.id}] OK ${kb}KB · ${credits[slot.id].license} · ${credits[slot.id].title.slice(0, 50)}\n`);
      done = true;
      break;
    } catch (e) {
      process.stdout.write(`  [${slot.id}] "${q}" -> ${e.message}\n`);
    }
  }
  if (!done) process.stdout.write(`  [${slot.id}] !! FAILED all queries\n`);
}

await writeFile(CREDITS, JSON.stringify(credits, null, 2));
process.stdout.write(`\nWrote ${Object.keys(credits).length} credits to ${CREDITS}\n`);
