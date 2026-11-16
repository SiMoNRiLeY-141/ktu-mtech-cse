const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "public", "academiadrive");
const OUT = path.join(process.cwd(), "public", "search-index.json");

function walk(dir, base) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
    } else if (entry.isFile()) {
      const stat = fs.statSync(full);
      out.push({
        name: entry.name,
        path: rel,
        ext: path.extname(entry.name).toLowerCase().replace(/^\./, ""),
        size: stat.size,
      });
    }
  }
  return out;
}

const entries = walk(ROOT, ROOT);
fs.writeFileSync(OUT, JSON.stringify(entries));
console.log(`search-index: ${entries.length} files`);