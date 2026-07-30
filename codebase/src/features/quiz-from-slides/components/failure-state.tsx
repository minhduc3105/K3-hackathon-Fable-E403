"use client";

import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import type { QuizState, QuizAction } from "../model/quiz.types";

type Props = {
  state: Extract<QuizState, { status: "extraction-failed" | "generation-failed" }>;
  dispatch: React.Dispatch<QuizAction>;
};

export function FailureState({ state, dispatch }: Props) {
  const isExtraction = state.status === "extraction-failed";

  return (
    <div className="bg-white rounded-input border border-gray-200 p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-6 h-6 text-error" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isExtraction ? "Không thể đọc file" : "Không thể tạo câu hỏi"}
          </h2>
          <p className="text-gray-700">
            {isExtraction
              ? "File có thể bị lỗi hoặc không đọc được. Vui lòng kiểm tra file và thử lại."
              : "Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng thử lại sau."}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {state.retryable && (
          <button
            onClick={() => dispatch({ type: "RETRY" })}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        )}
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Chọn file khác
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại bài học
        </button>
      </div>
    </div>
  );
}
