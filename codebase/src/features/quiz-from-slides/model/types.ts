export type ThemeMode = "light" | "dark";

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

export type SlideCatalogEntry = {
  fileName: string;
  sizeBytes: number;
  pageCount: number;
  relativePath: string;
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
  languageMenuOpen: boolean;
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
  currentQuestionIndex: number;
  answers: Record<string, string>;
  feedbackOpenFor: string | null;
  flagged: Record<string, string>;
  errorMessage: string;
};
