import { NextResponse } from "next/server";
import { generateGroundedQuiz } from "@/features/quiz-from-slides/server/openrouter-quiz-provider";

const MAX_CONTEXT_LENGTH = 12_000;
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20;

async function getPdfText(filename: string): Promise<string> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/pdf-text/${encodeURIComponent(filename)}`);

    if (!response.ok) {
      console.error("PDF text extraction failed:", response.status);
      return "";
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Error fetching PDF text:", error);
    return "";
  }
}

export async function POST(request: Request) {
  const traceId = crypto.randomUUID();

  try {
    const body = await request.json() as Record<string, unknown>;
    const sourceFileName = typeof body.sourceFileName === "string" ? body.sourceFileName : "";
    const learnerIntent = typeof body.learnerIntent === "string" ? body.learnerIntent.slice(0, 500) : undefined;
    const questionCount = body.questionCount === undefined
      ? 4
      : typeof body.questionCount === "number"
        && Number.isInteger(body.questionCount)
        && body.questionCount >= MIN_QUESTION_COUNT
        && body.questionCount <= MAX_QUESTION_COUNT
          ? body.questionCount
          : null;

    if (questionCount === null) {
      return NextResponse.json({
        status: "generation_failed",
        traceId,
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite",
        retryable: false,
        reason: "Số câu hỏi phải là một số nguyên từ 1 đến 20.",
      }, { status: 400 });
    }

    // For CP3 eval, use provided context
    const evalContext = body.purpose === "cp3-eval" && typeof body.sourceContext === "string"
      ? body.sourceContext.trim().slice(0, MAX_CONTEXT_LENGTH)
      : "";

    // Get full PDF text from extraction API
    const pdfText = evalContext || await getPdfText(sourceFileName);
    const sourceText = pdfText.slice(0, MAX_CONTEXT_LENGTH);
    const sourceTitle = typeof body.sourceTitle === "string" && evalContext
      ? body.sourceTitle.slice(0, 200)
      : sourceFileName.replace(".pdf", "");

    if (!sourceText) {
      return NextResponse.json({
        status: "insufficient_content",
        traceId,
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite",
        reason: "Không thể trích xuất text từ PDF. Hãy đảm bảo file có text layer (không phải scan).",
        suggestions: ["Chọn file PDF có text layer hoặc sử dụng OCR trước khi upload."],
      }, { status: 422 });
    }

    const result = await generateGroundedQuiz({
      sourceTitle,
      sourceText,
      learnerIntent,
      questionCount,
      traceId,
    });

    const status = result.status === "generation_failed" ? 502 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({
      status: "generation_failed",
      traceId,
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite",
      retryable: false,
      reason: "Lỗi khi tạo quiz. Vui lòng thử lại.",
    }, { status: 400 });
  }
}
