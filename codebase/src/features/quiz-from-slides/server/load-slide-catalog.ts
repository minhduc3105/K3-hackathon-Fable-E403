import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { SlideCatalogEntry } from "../model/types";

const slidePageCounts: Record<string, number> = {
  "d1-slide-hackathon.pdf": 29,
  "d2-slide-hackathon.pdf": 29,
};

function buildFallbackCatalog(): SlideCatalogEntry[] {
  return Object.entries(slidePageCounts).map(([fileName, pageCount]) => ({
    fileName,
    sizeBytes: 0,
    pageCount,
    relativePath: path.join("data", "vlearn-pack", "slides", fileName),
  }));
}

export async function loadSlideCatalog(): Promise<SlideCatalogEntry[]> {
  const candidates = [
    path.resolve(process.cwd(), "data", "vlearn-pack", "slides"),
    path.resolve(process.cwd(), "..", "data", "vlearn-pack", "slides"),
    path.resolve(process.cwd(), "..", "..", "data", "vlearn-pack", "slides"),
  ];

  const root = candidates.find((candidate) => existsSync(candidate));
  if (!root) return buildFallbackCatalog();

  try {
    const files = await readdir(root);
    const pdfs = files.filter((file) => file.toLowerCase().endsWith(".pdf")).sort();

    const catalog = await Promise.all(
      pdfs.map(async (fileName) => {
        const filePath = path.join(root, fileName);
        const info = await stat(filePath);
        return {
          fileName,
          sizeBytes: info.size,
          pageCount: slidePageCounts[fileName] ?? 1,
          relativePath: path.join("data", "vlearn-pack", "slides", fileName),
        };
      }),
    );

    return catalog.length ? catalog : buildFallbackCatalog();
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return buildFallbackCatalog();
    }

    throw error;
  }
}
