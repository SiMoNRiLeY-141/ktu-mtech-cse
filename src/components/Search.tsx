import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Entry = { name: string; path: string; ext: string; size: number };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Search() {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function ensureIndex() {
    if (index) return;
    try {
      const res = await fetch(`${basePath}/search-index.json`);
      const data = await res.json();
      setIndex(data);
    } catch {
      setIndex([]);
    }
  }

  const results = (index || []).filter((e) => {
    const hay = (e.name + " " + e.path).toLowerCase();
    return q.trim().length > 0 && hay.includes(q.trim().toLowerCase());
  }).slice(0, 12);

  const parentPath = (p: string) => {
    const parts = p.split("/");
    parts.pop();
    return parts.join("/");
  };

  return (
    <div ref={wrapRef} className="search-wrap">
      <input
        className="input search-input"
        type="search"
        placeholder="Search materials…"
        value={q}
        onFocus={() => { setOpen(true); ensureIndex(); }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); ensureIndex(); }}
        aria-label="Search study materials"
      />
      {open && q.trim().length > 0 && (
        <div className="search-results" role="listbox">
          {index === null ? (
            <div className="search-empty">Loading…</div>
          ) : results.length === 0 ? (
            <div className="search-empty">No matches for “{q}”.</div>
          ) : (
            results.map((r) => {
              const url = `${basePath}/academiadrive/${r.path.split("/").map(encodeURIComponent).join("/")}`;
              const folder = parentPath(r.path);
              return (
                <div key={r.path} className="search-item">
                  <div className="search-item-main">
                    <span className="search-item-name">{r.name}</span>
                    <span className="search-item-path">{r.path}</span>
                  </div>
                  <div className="search-item-actions">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="search-action">View</a>
                    <a href={url} download className="search-action">Download</a>
                    {folder && (
                      <Link href={`/explorer/${folder}`} className="search-action" onClick={() => setOpen(false)}>
                        Folder
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      <style jsx>{`
        .search-wrap { position: relative; width: 100%; max-width: 420px; }
        .search-input { padding-right: var(--space-s); }
        .search-results {
          position: absolute; top: calc(100% + var(--space-3xs)); left: 0; right: 0;
          background: var(--surface); border: var(--border); border-radius: var(--radius);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08); max-height: 60vh; overflow: auto;
          z-index: 20;
        }
        .search-item { padding: var(--space-2xs) var(--space-s); border-bottom: var(--border); }
        .search-item:last-child { border-bottom: none; }
        .search-item-main { display: flex; flex-direction: column; gap: 2px; }
        .search-item-name { font-weight: 500; color: var(--ink); font-size: var(--step--1); word-break: break-word; }
        .search-item-path { color: var(--ink-3); font-size: 0.75rem; }
        .search-item-actions { display: flex; gap: var(--space-2xs); margin-top: var(--space-3xs); }
        .search-action { font-size: 0.75rem; color: var(--accent); text-decoration: none; }
        .search-action:hover { text-decoration: underline; }
        .search-empty { padding: var(--space-s); color: var(--ink-3); font-size: var(--step--1); }
      `}</style>
    </div>
  );
}