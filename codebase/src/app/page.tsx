"use client";

import { useReducer } from "react";
import { quizReducer } from "@/features/quiz-from-slides/model/quiz-machine";
import { SlideUpload } from "@/features/quiz-from-slides/components/slide-upload";
import { GenerationStatus } from "@/features/quiz-from-slides/components/generation-status";
import { QuizQuestion } from "@/features/quiz-from-slides/components/quiz-question";
import { QuizReview } from "@/features/quiz-from-slides/components/quiz-review";
import { InsufficientContent } from "@/features/quiz-from-slides/components/insufficient-content";
import { FailureState } from "@/features/quiz-from-slides/components/failure-state";

export default function QuizPage() {
  const [state, dispatch] = useReducer(quizReducer, { status: "idle" });

  return (
    <div className="min-h-screen">
      {/* Mock VLearn header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Buổi 3 · Kiến trúc Transformer</p>
              <h1 className="text-lg font-semibold text-gray-900">Generative AI & LLMs</h1>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Quay lại khóa học
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {(state.status === "idle" || state.status === "validating" || state.status === "unsupported-file") && (
          <SlideUpload state={state} dispatch={dispatch} />
        )}

        {(state.status === "uploading" || state.status === "extracting" || state.status === "generating") && (
          <GenerationStatus state={state} dispatch={dispatch} />
        )}

        {state.status === "insufficient-content" && (
          <InsufficientContent state={state} dispatch={dispatch} />
        )}

        {(state.status === "extraction-failed" || state.status === "generation-failed") && (
          <FailureState state={state} dispatch={dispatch} />
        )}

        {(state.status === "ready" || state.status === "submitting") && (
          <QuizQuestion state={state} dispatch={dispatch} />
        )}

        {(state.status === "reviewed" || state.status === "correction-open") && (
          <QuizReview state={state} dispatch={dispatch} />
        )}
      </main>
    </div>
  );
}
