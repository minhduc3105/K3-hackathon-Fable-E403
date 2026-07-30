import { NextResponse } from "next/server";
import { generateGroundedQuiz } from "@/features/quiz-from-slides/server/openrouter-quiz-provider";
import { getControlledSourceContext } from "@/features/quiz-from-slides/server/source-context";

const MAX_CONTEXT_LENGTH = 12_000;
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20;

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
    const evalContext = body.purpose === "cp3-eval" && typeof body.sourceContext === "string"
      ? body.sourceContext.trim().slice(0, MAX_CONTEXT_LENGTH)
      : "";
    const controlled = getControlledSourceContext(sourceFileName);
    const sourceText = evalContext || controlled?.text || "";
    const sourceTitle = typeof body.sourceTitle === "string" && evalContext
      ? body.sourceTitle.slice(0, 200)
      : controlled?.title || sourceFileName;

    if (!sourceText) {
      return NextResponse.json({
        status: "insufficient_content",
        traceId,
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite",
        reason: "Chưa có phần text được phép dùng cho học liệu này.",
        suggestions: ["Chọn một học liệu trong data pack hoặc cung cấp bản có text layer."],
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
  } catch {
    return NextResponse.json({
      status: "generation_failed",
      traceId,
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite",
      retryable: false,
      reason: "Request tạo quiz không hợp lệ.",
    }, { status: 400 });
  }
}
