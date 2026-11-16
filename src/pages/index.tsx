import fs from "fs";
import path from "path";
import ExplorerPage from "./explorer/[...slug]";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async () => {
  const basePath = path.join(process.cwd(), "public/academiadrive");

  const hasFiles = (dir: string): boolean => {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isFile()) return true;
        if (entry.isDirectory() && hasFiles(full)) return true;
      }
    } catch {}
    return false;
  };

  const directories = fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => hasFiles(path.join(basePath, entry.name)))
    .map((dir) => ({ name: dir.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    props: {
      params: { slug: [] },
      directories,
      files: [],
    },
  };
};

export default function HomePage({
  directories,
  files,
}: {
  directories: { name: string }[];
  files: { name: string; ext: string; size: number }[];
}) {
  return (
    <div>
      <ExplorerPage params={{ slug: [] }} directories={directories} files={files} />
    </div>
  );
}