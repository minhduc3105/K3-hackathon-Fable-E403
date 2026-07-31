"use client";

import { CheckCircle, XCircle, FileText, Flag, X } from "lucide-react";
import { useState } from "react";
import type { QuizState, QuizAction } from "../model/quiz.types";

type Props = {
  state: Extract<QuizState, { status: "reviewed" | "correction-open" }>;
  dispatch: React.Dispatch<QuizAction>;
};

export function QuizReview({ state, dispatch }: Props) {
  const baseState = state.status === "correction-open" ? state.baseState : state;
  const { questions, answers, score } = baseState;
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="bg-white rounded-input border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Bạn nhớ đúng {score}/{questions.length} câu
        </h2>
        <p className="text-gray-600 mb-4">
          Đây là kiểm tra nhanh, không phải đánh giá mức độ thành thạo.
        </p>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-success h-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Question review */}
      <div className="space-y-4">
        {questions.map((question, idx) => {
          const userAnswer = answers[question.id];
          const isCorrect = userAnswer === question.correctChoiceId;
          const userChoice = question.choices.find((c) => c.id === userAnswer);
          const correctChoice = question.choices.find(
            (c) => c.id === question.correctChoiceId
          );

          return (
            <ReviewItem
              key={question.id}
              questionNumber={idx + 1}
              question={question}
              userChoice={userChoice}
              correctChoice={correctChoice}
              isCorrect={isCorrect}
              isOpen={state.status === "correction-open" && state.questionId === question.id}
              onOpenCorrection={() =>
                dispatch({ type: "OPEN_CORRECTION", questionId: question.id })
              }
              onCloseCorrection={() => dispatch({ type: "CLOSE_CORRECTION" })}
            />
          );
        })}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-input border border-gray-200 p-6">
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover transition-colors"
        >
          Làm bài kiểm tra mới
        </button>
      </div>
    </div>
  );
}

function ReviewItem({
  questionNumber,
  question,
  userChoice,
  correctChoice,
  isCorrect,
  isOpen,
  onOpenCorrection,
  onCloseCorrection,
}: {
  questionNumber: number;
  question: any;
  userChoice: any;
  correctChoice: any;
  isCorrect: boolean;
  isOpen: boolean;
  onOpenCorrection: () => void;
  onCloseCorrection: () => void;
}) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  return (
    <div className="bg-white rounded-input border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCorrect ? "bg-success/10" : "bg-error/10"
            }`}
          >
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <XCircle className="w-5 h-5 text-error" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Câu {questionNumber}</p>
            <h3 className="text-gray-900 font-medium mb-3">{question.prompt}</h3>

            <div className="space-y-2 mb-4">
              {!isCorrect && (
                <div className="text-sm">
                  <span className="text-gray-600">Bạn chọn: </span>
                  <span className="text-error font-medium">{userChoice?.text}</span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-gray-600">Đáp án đúng: </span>
                <span className="text-success font-medium">{correctChoice?.text}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-4 mb-4">
              <p className="text-sm text-gray-700">{question.explanation}</p>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Nguồn: </span>
                <span>Slide {question.source.pageOrSlide}</span>
                <p className="text-gray-500 mt-1 italic">
                  &ldquo;{question.source.excerpt}&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCorrection}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Câu hỏi chưa chính xác
            </button>
          </div>
        </div>
      </div>

      {/* Correction dialog */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-gray-900">Báo cáo vấn đề</h4>
            <button
              onClick={onCloseCorrection}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!feedbackSubmitted ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Vấn đề của câu hỏi này là gì?
              </p>
              <div className="space-y-2">
                {["Không có trong slide", "Đáp án chưa rõ", "Câu hỏi khó hiểu"].map(
                  (reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="correction-reason"
                        value={reason}
                        className="w-4 h-4 text-accent"
                      />
                      <span>{reason}</span>
                    </label>
                  )
                )}
              </div>
              <button
                onClick={() => setFeedbackSubmitted(true)}
                className="px-4 py-2 bg-accent text-white text-sm rounded hover:bg-accent-hover transition-colors"
              >
                Gửi phản hồi
              </button>
            </div>
          ) : (
            <div className="bg-success/10 border border-success/20 rounded px-4 py-3 text-sm text-success">
              Cảm ơn phản hồi của bạn. Chúng tôi sẽ xem xét và cải thiện.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
