"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import type { QuizState, QuizAction } from "../model/quiz.types";

type Props = {
  state: Extract<QuizState, { status: "insufficient-content" }>;
  dispatch: React.Dispatch<QuizAction>;
};

export function InsufficientContent({ state, dispatch }: Props) {
  return (
    <div className="bg-white rounded-input border border-gray-200 p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa đủ nội dung để tạo câu hỏi
          </h2>
          <p className="text-gray-700">{state.reason}</p>
        </div>
      </div>

      {state.suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Gợi ý:
          </p>
          <ul className="space-y-1 text-sm text-gray-700">
            {state.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover transition-colors"
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
