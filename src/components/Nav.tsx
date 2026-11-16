import Link from "next/link";
import { useEffect, useState } from "react";
import Search from "./Search";

const REPO_URL = "https://github.com/shadil-rayyan/ktu-mtech-cse";

export default function Nav() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-brand">
          <span className="nav-mark">KTU</span>
          <span className="nav-title">M.Tech CSE — Resource Hub</span>
        </Link>
        <div className="nav-search">
          <Search />
        </div>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/explorer" className="nav-link">Browse</Link>
          <a href={REPO_URL} className="nav-link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <button
            type="button"
            className="btn btn-ghost nav-toggle"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
      <style jsx>{`
        .nav { position: sticky; top: 0; z-index: 10; background: var(--base); border-bottom: var(--border); }
        .nav-inner { display: flex; align-items: center; gap: var(--space-m); padding-top: var(--space-s); padding-bottom: var(--space-s); flex-wrap: wrap; }
        .nav-brand { display: flex; align-items: baseline; gap: var(--space-2xs); color: var(--ink); text-decoration: none; flex-shrink: 0; }
        .nav-mark { font-family: var(--font-display); font-size: var(--step-2); font-weight: 700; letter-spacing: -0.02em; }
        .nav-title { font-size: var(--step--1); color: var(--ink-2); }
        .nav-search { flex: 1 1 260px; min-width: 180px; max-width: 420px; }
        .nav-links { display: flex; align-items: center; gap: var(--space-s); flex-shrink: 0; }
        .nav-link { color: var(--ink-2); font-size: var(--step--1); text-decoration: none; }
        .nav-link:hover { color: var(--ink); text-decoration: none; }
        .nav-toggle { font-size: var(--step--1); }
        @media (max-width: 640px) { .nav-mark { font-size: var(--step-1); } .nav-title { display: none; } .nav-search { order: 3; flex-basis: 100%; max-width: none; } .nav-links { gap: var(--space-xs); } }
      `}</style>
    </header>
  );
}