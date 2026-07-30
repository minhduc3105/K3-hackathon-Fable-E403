import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const allowedFiles = new Set(["d1-slide-hackathon.pdf", "d2-slide-hackathon.pdf"]);

function resolveSlidesRoot() {
  const candidates = [
    path.resolve(process.cwd(), "data", "vlearn-pack", "slides"),
    path.resolve(process.cwd(), "..", "data", "vlearn-pack", "slides"),
    path.resolve(process.cwd(), "..", "..", "data", "vlearn-pack", "slides"),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

export async function GET(_request: Request, context: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await context.params;

  if (!allowedFiles.has(fileName) || path.basename(fileName) !== fileName) {
    return new Response("Không tìm thấy học liệu.", { status: 404 });
  }

  try {
    const content = await readFile(path.join(resolveSlidesRoot(), fileName));
    return new Response(content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("Không thể mở học liệu.", { status: 404 });
  }
}
