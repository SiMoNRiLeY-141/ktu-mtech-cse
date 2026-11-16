import fs from "fs";
import path from "path";
import Link from "next/link";
import { useState } from "react";
import JSZip from "jszip";
import Nav from "../../components/Nav";
import Breadcrumbs from "../../components/Breadcrumbs";
import MarkdownModal from "../../components/MarkdownModal";
import { formatBytes, fileIcon, fileUrl } from "../../lib/format";

type ExplorerPageProps = {
  params: { slug: string[] };
  directories: { name: string }[];
  files: { name: string; ext: string; size: number }[];
};

function hasFiles(dir: string): boolean {
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isFile()) return true;
      if (entry.isDirectory() && hasFiles(full)) return true;
    }
  } catch {}
  return false;
}

export async function getStaticPaths() {
  const basePath = path.join(process.cwd(), "public", "academiadrive");
  const getDirectories = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let directories: string[] = [];
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        directories.push(
          fullPath.replace(basePath, "").replace(/\\/g, "/").slice(1)
        );
        directories = directories.concat(getDirectories(fullPath));
      }
    });
    return directories;
  };
  const directories = getDirectories(basePath);
  const paths = directories.map((dir) => ({ params: { slug: dir.split("/") } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string[] } }) {
  const { slug = [] } = params;
  const basePath = path.join(process.cwd(), "public", "academiadrive", ...slug);

  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(basePath, { withFileTypes: true });
  } catch {
    return { notFound: true };
  }

  const directories = entries
    .filter((e) => e.isDirectory())
    .filter((e) => hasFiles(path.join(basePath, e.name)))
    .map((dir) => ({ name: dir.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const files = entries
    .filter((e) => e.isFile())
    .map((file) => {
      const stat = fs.statSync(path.join(basePath, file.name));
      return {
        name: file.name,
        ext: path.extname(file.name).toLowerCase().replace(/^\./, ""),
        size: stat.size,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return { props: { params, directories, files } };
}

export default function ExplorerPage({ params, directories, files }: ExplorerPageProps) {
  const { slug = [] } = params;
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [zipping, setZipping] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const toggleSelect = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === visibleFiles.length) setSelected(new Set());
    else setSelected(new Set(visibleFiles.map((f) => f.name)));
  };

  const basePathEnv = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const downloadZip = async (entries: { name: string; url: string; relPath: string }[], zipName: string) => {
    if (entries.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const e of entries) {
        const res = await fetch(e.url);
        if (!res.ok) continue;
        const blob = await res.blob();
        zip.file(e.relPath, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } finally {
      setZipping(false);
    }
  };

  const downloadSelected = () => {
    const entries = files
      .filter((f) => selected.has(f.name))
      .map((f) => ({
        name: f.name,
        url: fileUrl(slug, f.name),
        relPath: f.name,
      }));
    downloadZip(entries, "selected.zip");
  };

  const downloadFolder = async () => {
    const prefix = slug.length > 0 ? slug.join("/") + "/" : "";
    let idx: { name: string; path: string }[] = [];
    try {
      const res = await fetch(`${basePathEnv}/search-index.json`);
      idx = await res.json();
    } catch {
      idx = files.map((f) => ({ name: f.name, path: [...slug, f.name].join("/") }));
    }
    const entries = idx
      .filter((e) => e.path.startsWith(prefix))
      .map((e) => ({
        name: e.name,
        url: `${basePathEnv}/academiadrive/${e.path.split("/").map(encodeURIComponent).join("/")}`,
        relPath: e.path.slice(prefix.length),
      }));
    const folderName = slug.length > 0 ? slug[slug.length - 1] : "root";
    downloadZip(entries, `${folderName}.zip`);
  };

  const copyLink = async (name: string) => {
    const url = fileUrl(slug, name);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(name);
      setTimeout(() => setCopied((c) => (c === name ? null : c)), 1500);
    } catch {}
  };
  const visibleFiles = files;
  const visibleDirs = directories;

  return (
    <>
      <Nav />
      <main className="container">
        <div className="explorer-head">
          {slug.length > 0 && <Breadcrumbs slug={slug} />}
          <h1 className="explorer-title">
            {slug.length > 0 ? slug[slug.length - 1].replace(/_/g, " ") : "KTU M.Tech CSE"}
          </h1>
          {slug.length === 0 && (
            <p className="explorer-sub">Syllabus, notes, question papers, and projects.</p>
          )}
        </div>

        {visibleDirs.length > 0 && (
          <section className="explorer-section">
            <h2 className="section-label">Folders</h2>
            <div className="dir-grid">
              {visibleDirs.map((dir) => (
                <Link
                  key={dir.name}
                  href={`/explorer/${[...slug, dir.name].join("/")}`}
                  className="dir-card"
                >
                  <span className="dir-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </span>
                  <span className="dir-name">{dir.name.replace(/_/g, " ")}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {files.length > 0 && (
          <div className="bulk-bar">
            <label className="bulk-select-all">
              <input
                type="checkbox"
                checked={selected.size > 0 && selected.size === visibleFiles.length}
                onChange={selectAll}
                aria-label="Select all files"
              />
              <span>Select all</span>
            </label>
            <div className="bulk-actions">
              <button
                className="btn"
                onClick={downloadSelected}
                disabled={selected.size === 0 || zipping}
              >
                {zipping ? "Zipping…" : `Download selected${selected.size ? ` (${selected.size})` : ""}`}
              </button>
              <button className="btn btn-ghost" onClick={downloadFolder} disabled={zipping}>
                {zipping ? "Zipping…" : "Download folder as ZIP"}
              </button>
            </div>
          </div>
        )}

        {visibleFiles.length > 0 && (
          <section className="explorer-section">
            <h2 className="section-label">Files</h2>
            <ul className="file-list">
              {visibleFiles.map((file) => {
                const url = fileUrl(slug, file.name);
                return (
                  <li key={file.name} className="file-row">
                    <div className="file-info">
                      <input
                        type="checkbox"
                        className="file-check"
                        checked={selected.has(file.name)}
                        onChange={() => toggleSelect(file.name)}
                        aria-label={`Select ${file.name}`}
                      />
                      <span className="file-badge">{fileIcon(file.ext)}</span>
                      <div className="file-meta">
                        <span className="file-name">{file.name}</span>
                        <span className="file-sub">
                          {file.ext.toUpperCase() || "FILE"}
                          {file.size ? ` · ${formatBytes(file.size)}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button className="btn btn-ghost" onClick={() => copyLink(file.name)}>
                        {copied === file.name ? "Copied" : "Copy link"}
                      </button>
                      {(file.ext === "md" || file.ext === "markdown") && (
                        <button className="btn btn-ghost" onClick={() => setPreview({ url, name: file.name })}>
                          Preview
                        </button>
                      )}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View</a>
                      <a href={url} download className="btn">Download</a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {directories.length === 0 && files.length === 0 && (
          <div className="empty-state">
            <h2 className="empty-title">Nothing here yet</h2>
            <p className="empty-text">
              This folder has no files. Add a file under{" "}
              <code>public/academiadrive/</code> and rebuild to see it here.
            </p>
            <Link href="/" className="btn btn-primary">Back to home</Link>
          </div>
        )}


      </main>

      {preview && (
        <MarkdownModal url={preview.url} name={preview.name} onClose={() => setPreview(null)} />
      )}

      <style jsx>{`
        .explorer-head { margin-bottom: var(--space-xl); }
        .explorer-title { font-size: var(--step-4); margin: 0 0 var(--space-2xs); letter-spacing: -0.02em; }
        .explorer-sub { color: var(--ink-2); font-size: var(--step--1); margin: 0; max-width: 42ch; }
        .explorer-toolbar { margin-bottom: var(--space-l); max-width: 360px; }
        .explorer-section { margin-bottom: var(--space-xl); }
        .section-label { font-size: var(--step--1); text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3); font-family: var(--font-text); font-weight: 600; margin: 0 0 var(--space-s); }
        .dir-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-s); }
        .dir-card {
          display: flex; align-items: center; gap: var(--space-s);
          padding: var(--space-s); border: var(--border); border-radius: var(--radius);
          background: var(--surface); color: var(--ink); text-decoration: none;
          transition: border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
        }
        .dir-card:hover { border-color: var(--accent); background: var(--base); text-decoration: none; }
        .dir-icon { font-size: var(--step-1); }
        .dir-name { font-weight: 500; font-size: var(--step--1); word-break: break-word; }
        .bulk-bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-m); flex-wrap: wrap; padding: var(--space-s); border: var(--border); border-radius: var(--radius); background: var(--surface); margin-bottom: var(--space-l); }
        .bulk-select-all { display: flex; align-items: center; gap: var(--space-2xs); font-size: var(--step--1); color: var(--ink-2); cursor: pointer; }
        .bulk-actions { display: flex; gap: var(--space-2xs); flex-wrap: wrap; }
        .file-check { width: 18px; height: 18px; flex-shrink: 0; accent-color: var(--accent); }
        .file-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2xs); }
        .file-row {
          display: flex; align-items: center; justify-content: space-between; gap: var(--space-m);
          padding: var(--space-s); border: var(--border); border-radius: var(--radius);
          background: var(--surface); flex-wrap: wrap;
        }
        .file-info { display: flex; align-items: center; gap: var(--space-s); min-width: 0; }
        .file-badge {
          flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          border: var(--border); border-radius: var(--radius); font-size: 0.7rem; font-weight: 700;
          color: var(--ink-2); background: var(--base);
        }
        .file-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .file-name { font-weight: 500; font-size: var(--step--1); word-break: break-word; }
        .file-sub { color: var(--ink-3); font-size: 0.75rem; }
        .file-actions { display: flex; gap: var(--space-2xs); flex-shrink: 0; }
        .empty-state { text-align: center; padding: var(--space-2xl) var(--space-m); }
        .empty-title { font-size: var(--step-2); margin: 0 0 var(--space-s); }
        .empty-text { color: var(--ink-2); max-width: 480px; margin: 0 auto var(--space-m); }
        code { background: var(--surface); border: var(--border); border-radius: var(--radius); padding: 2px 6px; font-size: 0.85em; }
        @media (max-width: 640px) {
          .explorer-title { font-size: var(--step-3); }
          .dir-grid { grid-template-columns: 1fr; }
          .file-row { flex-direction: column; align-items: stretch; gap: var(--space-s); }
          .file-info { width: 100%; }
          .file-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
          .bulk-bar { flex-direction: column; align-items: stretch; }
          .bulk-actions { width: 100%; }
          .bulk-actions .btn { flex: 1 1 auto; }
        }
      `}</style>
    </>
  );
}