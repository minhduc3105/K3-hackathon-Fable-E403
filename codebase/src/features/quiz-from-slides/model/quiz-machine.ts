import type { QuizState, QuizAction } from "./quiz.types";

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SELECT_FILE":
      return { status: "validating", file: action.file };

    case "VALIDATE_SUCCESS":
      if (state.status !== "validating") return state;
      return { status: "uploading", file: state.file };

    case "VALIDATE_FAILURE":
      return { status: "unsupported-file", reason: action.reason };

    case "UPLOAD_SUCCESS":
      if (state.status !== "uploading") return state;
      return {
        status: "extracting",
        file: state.file,
        filename: state.file.name,
      };

    case "EXTRACTION_SUCCESS":
      if (state.status !== "extracting") return state;
      return { status: "generating", filename: state.filename };

    case "GENERATION_SUCCESS":
      return {
        status: "ready",
        quizId: action.quizId,
        questions: action.questions,
        currentIndex: 0,
        answers: {},
      };

    case "GENERATION_INSUFFICIENT":
      return {
        status: "insufficient-content",
        reason: action.reason,
        suggestions: action.suggestions,
      };

    case "EXTRACTION_FAILED":
      return {
        status: "extraction-failed",
        retryable: action.retryable,
      };

    case "GENERATION_FAILED":
      return {
        status: "generation-failed",
        retryable: action.retryable,
      };

    case "SELECT_ANSWER":
      if (state.status !== "ready") return state;
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.choiceId,
        },
      };

    case "NEXT_QUESTION":
      if (state.status !== "ready") return state;
      if (state.currentIndex >= state.questions.length - 1) return state;
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };

    case "PREV_QUESTION":
      if (state.status !== "ready") return state;
      if (state.currentIndex <= 0) return state;
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
      };

    case "SUBMIT_QUIZ":
      if (state.status !== "ready") return state;
      return {
        status: "submitting",
        quizId: state.quizId,
        questions: state.questions,
        answers: state.answers,
      };

    case "SUBMIT_SUCCESS":
      if (state.status !== "submitting") return state;
      return {
        status: "reviewed",
        quizId: state.quizId,
        questions: state.questions,
        answers: state.answers,
        score: action.score,
      };

    case "OPEN_CORRECTION":
      if (state.status !== "reviewed") return state;
      return {
        status: "correction-open",
        questionId: action.questionId,
        baseState: state,
      };

    case "CLOSE_CORRECTION":
      if (state.status !== "correction-open") return state;
      return state.baseState;

    case "CANCEL":
      return { status: "idle" };

    case "RETRY":
      return { status: "idle" };

    case "RESET":
      return { status: "idle" };

    default:
      return state;
  }
}

export function calculateScore(
  questions: QuizState extends { questions: infer Q } ? Q : never,
  answers: Record<string, string>
): number {
  let correct = 0;
  for (const q of questions as any[]) {
    if (answers[q.id] === q.correctChoiceId) {
      correct++;
    }
  }
  return correct;
}
