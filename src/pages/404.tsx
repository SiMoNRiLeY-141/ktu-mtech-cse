import Nav from "../components/Nav";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="container">
        <div className="empty-state" style={{ paddingTop: "var(--space-3xl)" }}>
          <h1 className="explorer-title">Page not found</h1>
          <p className="empty-text">
            The page you are looking for does not exist or has moved.
          </p>
          <Link href="/" className="btn btn-primary">Back to home</Link>
        </div>
      </main>
    </>
  );
}