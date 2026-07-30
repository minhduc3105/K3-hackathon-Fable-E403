export type QuizChoice = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
  correctChoiceId: string;
  explanation: string;
  source: {
    pageOrSlide: number;
    excerpt: string;
  };
};

export type QuizState =
  | { status: "idle" }
  | { status: "validating"; file: File }
  | { status: "uploading"; file: File }
  | { status: "extracting"; file: File; filename: string }
  | { status: "generating"; filename: string }
  | { status: "ready"; quizId: string; questions: QuizQuestion[]; currentIndex: number; answers: Record<string, string> }
  | { status: "submitting"; quizId: string; questions: QuizQuestion[]; answers: Record<string, string> }
  | { status: "reviewed"; quizId: string; questions: QuizQuestion[]; answers: Record<string, string>; score: number }
  | { status: "unsupported-file"; reason: string }
  | { status: "insufficient-content"; reason: string; suggestions: string[] }
  | { status: "extraction-failed"; retryable: boolean }
  | { status: "generation-failed"; retryable: boolean }
  | { status: "correction-open"; questionId: string; baseState: Extract<QuizState, { status: "reviewed" }> };

export type QuizAction =
  | { type: "SELECT_FILE"; file: File }
  | { type: "VALIDATE_SUCCESS" }
  | { type: "VALIDATE_FAILURE"; reason: string }
  | { type: "UPLOAD_SUCCESS" }
  | { type: "EXTRACTION_SUCCESS" }
  | { type: "GENERATION_SUCCESS"; quizId: string; questions: QuizQuestion[] }
  | { type: "GENERATION_INSUFFICIENT"; reason: string; suggestions: string[] }
  | { type: "EXTRACTION_FAILED"; retryable: boolean }
  | { type: "GENERATION_FAILED"; retryable: boolean }
  | { type: "SELECT_ANSWER"; questionId: string; choiceId: string }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "SUBMIT_QUIZ" }
  | { type: "SUBMIT_SUCCESS"; score: number }
  | { type: "OPEN_CORRECTION"; questionId: string }
  | { type: "CLOSE_CORRECTION" }
  | { type: "CANCEL" }
  | { type: "RETRY" }
  | { type: "RESET" };

export type GenerateQuizResult =
  | { status: "ready"; quizId: string; questions: QuizQuestion[] }
  | { status: "insufficient_content"; reason: string; suggestions: string[] }
  | { status: "unsupported_file"; reason: string }
  | { status: "extraction_failed"; retryable: boolean }
  | { status: "generation_failed"; retryable: boolean };
