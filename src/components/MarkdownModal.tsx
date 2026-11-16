import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

type Props = { url: string; name: string; onClose: () => void };

export default function MarkdownModal({ url, name, onClose }: Props) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.text();
      })
      .then((t) => {
        if (!cancelled) { setContent(t); setLoading(false); }
      })
      .catch((e) => {
        if (!cancelled) { setError(String(e)); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="md-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={name}>
      <div className="md-panel" onClick={(e) => e.stopPropagation()}>
        <div className="md-head">
          <h2 className="md-title">{name}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">Close</button>
        </div>
        <div className="md-body">
          {loading && <p className="meta">Loading…</p>}
          {error && <p className="meta">{error}</p>}
          {!loading && !error && (
            <div className="md-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .md-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          padding: var(--space-m); z-index: 50;
        }
        .md-panel {
          background: var(--base); border: var(--border); border-radius: var(--radius);
          width: 100%; max-width: 820px; max-height: 85vh; display: flex; flex-direction: column;
          overflow: hidden;
        }
        .md-head { display: flex; align-items: center; justify-content: space-between; padding: var(--space-s) var(--space-m); border-bottom: var(--border); }
        .md-title { font-size: var(--step-1); margin: 0; }
        .md-body { padding: var(--space-m); overflow: auto; }
        .md-content { line-height: 1.6; }
        .md-content h1, .md-content h2, .md-content h3 { margin-top: var(--space-m); }
        .md-content pre { background: var(--surface); border: var(--border); border-radius: var(--radius); padding: var(--space-s); overflow: auto; }
        .md-content code { background: var(--surface); border: var(--border); border-radius: var(--radius); padding: 1px 5px; font-size: 0.9em; }
        .md-content pre code { border: none; background: none; padding: 0; }
        .md-content a { color: var(--accent); }
        .md-content img { max-width: 100%; }
        .md-content table { border-collapse: collapse; width: 100%; }
        .md-content th, .md-content td { border: var(--border); padding: var(--space-2xs) var(--space-xs); }
      `}</style>
    </div>
  );
}