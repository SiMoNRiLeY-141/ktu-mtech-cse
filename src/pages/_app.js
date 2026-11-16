import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import PWARegister from "../components/PWARegister";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${fraunces.variable} ${inter.variable}`} style={{ fontFamily: "var(--font-text)" }}>
      <PWARegister />
      <Component {...pageProps} />
      <footer className="site-footer">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-m)", flexWrap: "wrap", fontSize: "var(--step--1)", color: "var(--ink-3)" }}>
          <span>KTU M.Tech CSE Resource Hub · community-driven</span>
          <span>
            Add a file under <code>public/academiadrive/</code> and open a PR ·{" "}
            <a href="https://github.com/shadil-rayyan/ktu-mtech-cse" target="_blank" rel="noopener noreferrer">GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default MyApp;