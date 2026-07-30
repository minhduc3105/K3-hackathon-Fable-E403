export type ThemeMode = "light" | "dark";

export type LanguageMode = "vi" | "en";

export type Screen = "lesson" | "processing" | "quiz" | "review" | "insufficient" | "error";

export type ReaderMode = "read" | "pen";

export type ProcessingStage = 0 | 1 | 2;

export type TutorRole = "tutor" | "student";

export type QuizScenario = "normal" | "insufficient" | "failure";

export type LessonMaterial = {
  id: string;
  name: string;
  title: string;
  pages: number;
  defaultPage: number;
  scenario: QuizScenario;
};

export type LessonDay = {
  id: number;
  label: string;
  status: string;
  materials: LessonMaterial[];
};

export type QuizChoice = {
  id: "a" | "b" | "c" | "d";
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
  correctChoiceId: QuizChoice["id"];
  explanation: string;
  source: {
    pageOrSlide: number;
    excerpt: string;
  };
};

export type GenerateQuizResult =
  | {
      status: "ready";
      traceId: string;
      model: string;
      questions: QuizQuestion[];
      usage?: { promptTokens?: number; outputTokens?: number };
    }
  | {
      status: "insufficient_content";
      traceId: string;
      model: string;
      reason: string;
      suggestions: string[];
    }
  | {
      status: "out_of_scope";
      traceId: string;
      model: string;
      reason: string;
    }
  | {
      status: "generation_failed";
      traceId: string;
      model: string;
      retryable: boolean;
      reason: string;
    };

export type SlideCatalogEntry = {
  fileName: string;
  sizeBytes: number;
  pageCount: number;
  relativePath: string;
};

export type QuizAttempt = {
  id: string;
  sourceFileName: string;
  sourcePage: number;
  questionCount: number;
  score: number;
  total: number;
  completedAtLabel: string;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  flagged: Record<string, string>;
};

export type TutorMessage = {
  id: string;
  role: TutorRole;
  text: string;
};

export type DemoState = {
  screen: Screen;
  activeMaterialId: string;
  openDay: number | null;
  currentPage: number;
  zoom: number;
  readerMode: ReaderMode;
  noteCount: number;
  theme: ThemeMode;
  language: LanguageMode;
  profileOpen: boolean;
  tutorHistoryOpen: boolean;
  tutorDraft: string;
  tutorMessages: TutorMessage[];
  notice: string;
  selectedSourceFile: string | null;
  leftPanelWidth: number;
  rightPanelWidth: number;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  scenario: QuizScenario;
  processingStage: ProcessingStage;
  quizQuestionCount: number;
  learnerIntent: string;
  generatedQuestions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  feedbackOpenFor: string | null;
  flagged: Record<string, string>;
  errorMessage: string;
};
