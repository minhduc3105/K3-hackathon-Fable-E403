import { NextRequest, NextResponse } from "next/server";
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

// Simple PDF text extraction without external libraries
// This extracts readable text streams from PDF
async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfString = pdfBuffer.toString("latin1");
    const textChunks: string[] = [];

    // Extract text between BT (Begin Text) and ET (End Text) markers
    const btRegex = /BT\s+(.*?)\s+ET/gs;
    let match;

    while ((match = btRegex.exec(pdfString)) !== null) {
      const textBlock = match[1];

      // Extract strings in parentheses or angle brackets
      const stringRegex = /\((.*?)\)|\<(.*?)\>/g;
      let stringMatch;

      while ((stringMatch = stringRegex.exec(textBlock)) !== null) {
        const text = stringMatch[1] || stringMatch[2];
        if (text && text.trim()) {
          // Decode basic PDF encoding
          const decoded = text
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\\\/g, "\\");

          textChunks.push(decoded.trim());
        }
      }
    }

    return textChunks.join(" ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("PDF text extraction error:", error);
    return "";
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;

  if (!allowedFiles.has(filename) || path.basename(filename) !== filename) {
    return NextResponse.json({ error: "File not allowed" }, { status: 404 });
  }

  try {
    const pdfPath = path.join(resolveSlidesRoot(), filename);
    const buffer = await readFile(pdfPath);
    const text = await extractPdfText(buffer);

    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      filename,
      text,
      length: text.length,
    });
  } catch (error) {
    console.error("PDF extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 }
    );
  }
}
