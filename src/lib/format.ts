export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileUrl(slug: string[], name: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/academiadrive/${[...slug, name].map((s) => encodeURIComponent(s)).join("/")}`;
}

export function fileIcon(ext: string): string {
  const map: Record<string, string> = {
    pdf: "PDF", md: "MD", markdown: "MD", txt: "TXT",
    png: "IMG", jpg: "IMG", jpeg: "IMG", gif: "IMG", svg: "IMG", webp: "IMG",
    mp4: "VID", webm: "VID", mov: "VID",
    zip: "ZIP", rar: "ZIP",
    js: "CODE", ts: "CODE", tsx: "CODE", py: "CODE", java: "CODE", c: "CODE", cpp: "CODE",
    doc: "DOC", docx: "DOC", ppt: "PPT", pptx: "PPT", xls: "XLS", xlsx: "XLS",
  };
  return map[ext.toLowerCase()] || "FILE";
}