import Link from "next/link";

export default function Breadcrumbs({ slug }: { slug: string[] }) {
  const crumbs = [{ label: "Home", href: "/" }, ...slug.map((seg, i) => ({
    label: seg,
    href: `/explorer/${slug.slice(0, i + 1).join("/")}`,
  }))];

  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      {crumbs.map((c, i) => (
        <span key={c.href} className="crumb-item">
          {i < crumbs.length - 1 ? (
            <Link href={c.href} className="crumb-link">{c.label}</Link>
          ) : (
            <span className="crumb-current" aria-current="page">{c.label}</span>
          )}
          {i < crumbs.length - 1 && <span className="crumb-sep" aria-hidden="true">/</span>}
        </span>
      ))}
      <style jsx>{`
        .crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2xs); font-size: var(--step--1); }
        .crumb-link { color: var(--ink-2); text-decoration: none; }
        .crumb-link:hover { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
        .crumb-current { color: var(--ink); font-weight: 600; }
        .crumb-sep { color: var(--ink-3); }
      `}</style>
    </nav>
  );
}