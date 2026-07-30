import { GenerateQuizResultSchema } from "../model/quiz.schemas";
import type { GenerateQuizResult } from "../model/quiz.types";

export async function generateQuizFromSlides(
  file: File,
  signal?: AbortSignal,
): Promise<GenerateQuizResult> {
  const form = new FormData();
  form.set("file", file);

  const response = await fetch("/api/quiz/generate", {
    method: "POST",
    body: form,
    signal,
  });
  const payload: unknown = await response.json().catch(() => ({
    status: "generation_failed",
    retryable: true,
  }));
  return GenerateQuizResultSchema.parse(payload);
}
