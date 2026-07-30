"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { QuizState, QuizAction } from "../model/quiz.types";
import { calculateScore } from "../model/quiz-machine";

type Props = {
  state: Extract<QuizState, { status: "ready" | "submitting" }>;
  dispatch: React.Dispatch<QuizAction>;
};

export function QuizQuestion({ state, dispatch }: Props) {
  const currentQuestion = state.questions[state.currentIndex];
  const selectedAnswer = state.answers[currentQuestion.id];
  const isLastQuestion = state.currentIndex === state.questions.length - 1;
  const allAnswered = state.questions.every((q) => state.answers[q.id]);

  const handleSubmit = () => {
    dispatch({ type: "SUBMIT_QUIZ" });
    // Simulate submission delay
    setTimeout(() => {
      const score = calculateScore(state.questions, state.answers);
      dispatch({ type: "SUBMIT_SUCCESS", score });
    }, 500);
  };

  return (
    <div className="bg-white rounded-input border border-gray-200">
      {/* Progress header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Câu {state.currentIndex + 1} / {state.questions.length}
            </p>
            <div className="flex gap-1">
              {state.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`w-8 h-1 rounded-full ${
                    state.answers[q.id]
                      ? "bg-accent"
                      : idx === state.currentIndex
                      ? "bg-accent/30"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: "CANCEL" })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Hủy
          </button>
        </div>
      </div>

      {/* Question content */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {currentQuestion.prompt}
        </h2>

        <fieldset className="space-y-3">
          <legend className="sr-only">Chọn câu trả lời</legend>
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            return (
              <label
                key={choice.id}
                className={`block border-2 rounded px-4 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-accent bg-accent/5"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={choice.id}
                    checked={isSelected}
                    onChange={() =>
                      dispatch({
                        type: "SELECT_ANSWER",
                        questionId: currentQuestion.id,
                        choiceId: choice.id,
                      })
                    }
                    className="w-4 h-4 text-accent focus:ring-accent"
                  />
                  <span className="text-gray-900">{choice.text}</span>
                </div>
              </label>
            );
          })}
        </fieldset>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: "PREV_QUESTION" })}
          disabled={state.currentIndex === 0}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        {!isLastQuestion ? (
          <button
            onClick={() => dispatch({ type: "NEXT_QUESTION" })}
            disabled={!selectedAnswer}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            Tiếp tục
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || state.status === "submitting"}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.status === "submitting" ? "Đang nộp..." : "Nộp bài"}
          </button>
        )}
      </div>

      {!selectedAnswer && (
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-500">
            Vui lòng chọn một câu trả lời để tiếp tục
          </p>
        </div>
      )}
    </div>
  );
}
