"use client";

import { useReducer } from "react";
import {
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Flag,
  ChevronRight,
} from "lucide-react";
import { quizReducer, calculateScore } from "../model/quiz-machine";
import type { QuizQuestion } from "../model/quiz.types";

const LETTERS = ["A", "B", "C", "D"];

type Props = {
  quizId: string;
  questions: QuizQuestion[];
  /** Called when the learner flags a question as wrong (correction path). */
  onReport?: (questionId: string) => void;
};

/**
 * Interactive multiple-choice quiz rendered inline inside the Tutor chat.
 * Owns its own quiz state (ready -> submitting -> reviewed) via the shared reducer.
 */
export function InlineQuizCard({ quizId, questions, onReport }: Props) {
  const [state, dispatch] = useReducer(quizReducer, {
    status: "ready",
    quizId,
    questions,
    currentIndex: 0,
    answers: {},
  });

  if (state.status !== "ready" && state.status !== "submitting" && state.status !== "reviewed") {
    return null;
  }

  const reviewed = state.status === "reviewed";
  const answers = state.answers;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = () => {
    dispatch({ type: "SUBMIT_QUIZ" });
    const score = calculateScore(questions, answers);
    // Simulate async grading returning after a tick.
    setTimeout(() => dispatch({ type: "SUBMIT_SUCCESS", score }), 250);
  };

  return (
    <div className="animate-fade-in overflow-hidden rounded-panel border border-line bg-surface shadow-panel">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-muted px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-soft text-accent">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-brand-800">
            Trắc nghiệm ôn tập · {questions.length} câu
          </span>
        </div>
        {reviewed ? (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-2xs font-bold text-accent">
            {state.score}/{questions.length} đúng
          </span>
        ) : (
          <span className="tabular-nums text-2xs text-slate-500">
            Đã trả lời {answeredCount}/{questions.length}
          </span>
        )}
      </div>

      <div className="divide-y divide-line">
        {questions.map((q, qi) => {
          const picked = answers[q.id];
          return (
            <div key={q.id} className="px-3.5 py-3">
              <p className="mb-2 text-xs font-semibold leading-snug text-brand-800">
                <span className="text-accent">Câu {qi + 1}.</span> {q.prompt}
              </p>

              <div className="space-y-1.5">
                {q.choices.map((c, ci) => {
                  const isPicked = picked === c.id;
                  const isCorrect = c.id === q.correctChoiceId;

                  let cls =
                    "border-line bg-surface text-slate-700 hover:border-accent/40 hover:bg-accent-soft/40";
                  let badge = "border-line text-slate-400";

                  if (reviewed) {
                    if (isCorrect) {
                      cls = "border-success/40 bg-success/5 text-brand-800";
                      badge = "border-success bg-success text-white";
                    } else if (isPicked) {
                      cls = "border-error/40 bg-error/5 text-brand-800";
                      badge = "border-error bg-error text-white";
                    } else {
                      cls = "border-line bg-surface text-slate-500";
                    }
                  } else if (isPicked) {
                    cls = "border-accent bg-accent-soft text-brand-800";
                    badge = "border-accent bg-accent text-white";
                  }

                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={reviewed}
                      onClick={() =>
                        dispatch({
                          type: "SELECT_ANSWER",
                          questionId: q.id,
                          choiceId: c.id,
                        })
                      }
                      className={`flex w-full items-center gap-2.5 rounded-input border px-2.5 py-2 text-left text-xs transition ${cls} ${
                        reviewed ? "cursor-default" : ""
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${badge}`}
                      >
                        {reviewed && isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : reviewed && isPicked ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          LETTERS[ci]
                        )}
                      </span>
                      <span className="flex-1">{c.text}</span>
                    </button>
                  );
                })}
              </div>

              {reviewed && (
                <div className="mt-2.5 rounded-input bg-surface-muted px-3 py-2">
                  <p className="text-2xs leading-relaxed text-slate-600">
                    <span className="font-semibold text-brand-700">
                      Giải thích:{" "}
                    </span>
                    {q.explanation}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-2xs text-slate-400">
                      <FileText className="h-3 w-3" />
                      Nguồn: slide {q.source.pageOrSlide}
                    </span>
                    <button
                      type="button"
                      onClick={() => onReport?.(q.id)}
                      className="inline-flex items-center gap-1 text-2xs font-medium text-slate-400 transition hover:text-error"
                    >
                      <Flag className="h-3 w-3" />
                      Báo sai
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-muted px-3.5 py-2.5">
        {reviewed ? (
          <>
            <span className="text-2xs text-slate-500">
              Xem lại giải thích và nguồn tham khảo cho từng câu.
            </span>
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET" })}
              className="inline-flex items-center gap-1.5 rounded-input px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-surface-sunken hover:text-brand-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Làm lại
            </button>
          </>
        ) : (
          <>
            <span className="text-2xs text-slate-500">
              {allAnswered
                ? "Đã sẵn sàng nộp bài."
                : "Chọn đáp án cho tất cả các câu."}
            </span>
            <button
              type="button"
              disabled={!allAnswered || state.status === "submitting"}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-input bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.status === "submitting" ? "Đang chấm…" : "Nộp bài"}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
