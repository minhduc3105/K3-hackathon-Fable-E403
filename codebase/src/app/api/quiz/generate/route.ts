import { NextResponse } from "next/server";
import { generateGroundedQuiz, QuizProviderError } from "@/features/quiz-from-slides/server/generate-grounded-quiz";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 20 * 1024 * 1024;
const VALID_EXTENSIONS = new Set(["pdf", "ppt", "pptx"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ status: "unsupported_file", reason: "Không tìm thấy tệp tải lên." }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!VALID_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { status: "unsupported_file", reason: "Chỉ hỗ trợ tệp PDF, PPT hoặc PPTX." },
        { status: 415 },
      );
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { status: "unsupported_file", reason: file.size === 0 ? "Tệp đang trống." : "Tệp vượt quá giới hạn 20 MB." },
        { status: 413 },
      );
    }
    if (!(await hasValidSignature(file, extension))) {
      return NextResponse.json(
        { status: "unsupported_file", reason: "Nội dung tệp không khớp với định dạng đã chọn." },
        { status: 415 },
      );
    }

    const result = await generateGroundedQuiz(file);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof QuizProviderError) {
      const missingKey = error.code === "missing_api_key";
      return NextResponse.json(
        { status: "generation_failed", retryable: error.retryable, code: error.code },
        { status: missingKey ? 503 : 502 },
      );
    }
    console.error("Quiz generation route failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { status: "generation_failed", retryable: true, code: "internal_error" },
      { status: 500 },
    );
  }
}

async function hasValidSignature(file: File, extension: string) {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
  const isZip = header[0] === 0x50 && header[1] === 0x4b;
  const isOle =
    header[0] === 0xd0 &&
    header[1] === 0xcf &&
    header[2] === 0x11 &&
    header[3] === 0xe0 &&
    header[4] === 0xa1 &&
    header[5] === 0xb1 &&
    header[6] === 0x1a &&
    header[7] === 0xe1;
  return extension === "pdf" ? isPdf : extension === "pptx" ? isZip : isOle;
}
