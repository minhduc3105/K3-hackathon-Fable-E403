"use client";

import { Upload } from "lucide-react";
import type { QuizState, QuizAction } from "../model/quiz.types";
import { getMockQuizResult } from "../fixtures/quiz-scenarios";

type Props = {
  state: Extract<QuizState, { status: "idle" | "validating" | "unsupported-file" }>;
  dispatch: React.Dispatch<QuizAction>;
};

const SUPPORTED_TYPES = [".pdf", ".ppt", ".pptx"];
const MAX_SIZE_MB = 10;

export function SlideUpload({ state, dispatch }: Props) {
  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    dispatch({ type: "SELECT_FILE", file });

    // Validate file type
    const ext = file.name.toLowerCase().match(/\.(pdf|pptx?|docx?)$/);
    if (!ext || !SUPPORTED_TYPES.includes(ext[0])) {
      dispatch({
        type: "VALIDATE_FAILURE",
        reason: `Định dạng file không được hỗ trợ. Vui lòng chọn file ${SUPPORTED_TYPES.join(", ")}`,
      });
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      dispatch({
        type: "VALIDATE_FAILURE",
        reason: `File vượt quá giới hạn ${MAX_SIZE_MB}MB. Vui lòng chọn file nhỏ hơn.`,
      });
      return;
    }

    dispatch({ type: "VALIDATE_SUCCESS" });

    // Simulate upload
    await new Promise((r) => setTimeout(r, 800));
    dispatch({ type: "UPLOAD_SUCCESS" });

    // Simulate extraction
    await new Promise((r) => setTimeout(r, 1200));
    dispatch({ type: "EXTRACTION_SUCCESS" });

    // Simulate generation with fixture data
    await new Promise((r) => setTimeout(r, 1500));
    const result = getMockQuizResult(file.name);

    if (result.status === "ready") {
      dispatch({
        type: "GENERATION_SUCCESS",
        quizId: result.quizId,
        questions: result.questions,
      });
    } else if (result.status === "insufficient_content") {
      dispatch({
        type: "GENERATION_INSUFFICIENT",
        reason: result.reason,
        suggestions: result.suggestions,
      });
    } else if (result.status === "extraction_failed") {
      dispatch({
        type: "EXTRACTION_FAILED",
        retryable: result.retryable,
      });
    } else if (result.status === "generation_failed") {
      dispatch({
        type: "GENERATION_FAILED",
        retryable: result.retryable,
      });
    } else if (result.status === "unsupported_file") {
      dispatch({
        type: "VALIDATE_FAILURE",
        reason: result.reason,
      });
    }
  };

  return (
    <div className="bg-white rounded-input border border-gray-200 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Tự kiểm tra bài học
        </h2>
        <p className="text-gray-600">
          Tạo một bài kiểm tra ngắn từ slide của buổi học.
        </p>
      </div>

      <div className="space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-input p-8 text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-accent", "bg-accent/5");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-accent", "bg-accent/5");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-accent", "bg-accent/5");
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
          }}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-700 mb-1">
            Kéo thả file vào đây hoặc click để chọn
          </p>
          <p className="text-sm text-gray-500">
            Hỗ trợ PDF, PPT, PPTX · tối đa {MAX_SIZE_MB}MB
          </p>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        />

        {state.status === "unsupported-file" && (
          <div className="bg-error/10 border border-error/20 rounded px-4 py-3 text-sm text-error">
            {state.reason}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Lưu ý:</strong> Câu hỏi chỉ sử dụng nội dung từ slide bạn tải lên.
            Slide chủ yếu là hình ảnh có thể không đủ nội dung để tạo câu hỏi.
          </p>
        </div>
      </div>
    </div>
  );
}
