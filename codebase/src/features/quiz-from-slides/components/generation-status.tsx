"use client";

import { Loader2, X } from "lucide-react";
import type { QuizState, QuizAction } from "../model/quiz.types";

type Props = {
  state: Extract<QuizState, { status: "uploading" | "extracting" | "generating" }>;
  dispatch: React.Dispatch<QuizAction>;
};

export function GenerationStatus({ state, dispatch }: Props) {
  const stages = [
    { key: "uploading", label: "Đang tải file lên" },
    { key: "extracting", label: "Đang đọc slide" },
    { key: "generating", label: "Đang tạo câu hỏi" },
  ];

  const currentIndex = stages.findIndex((s) => s.key === state.status);

  return (
    <div className="bg-white rounded-input border border-gray-200 p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {state.status === "uploading" && "Đang tải file lên"}
            {state.status === "extracting" && "Đang đọc nội dung slide"}
            {state.status === "generating" && "Đang chọn nội dung chính"}
          </h2>
          <p className="text-sm text-gray-600">
            {"filename" in state ? state.filename : "file" in state ? state.file.name : ""}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: "CANCEL" })}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Hủy"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3" role="status" aria-live="polite">
        {stages.map((stage, idx) => {
          const isActive = idx === currentIndex;
          const isComplete = idx < currentIndex;

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : isComplete
                    ? "bg-success text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isComplete ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "text-gray-900 font-medium" : "text-gray-600"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Quá trình này có thể mất 10-30 giây tùy vào độ dài slide.
        </p>
      </div>
    </div>
  );
}
