import { lessonDays, quizQuestions } from "../data/lesson-fixture";
import type { DemoState, LessonMaterial, QuizQuestion, QuizScenario } from "./types";

const defaultMaterial = lessonDays[4].materials[0];

export const initialState: DemoState = {
  screen: "lesson",
  activeMaterialId: defaultMaterial.id,
  openDay: 5,
  currentPage: defaultMaterial.defaultPage,
  zoom: 103,
  readerMode: "read",
  noteCount: 1,
  theme: "light",
  language: "vi",
  profileOpen: false,
  tutorHistoryOpen: false,
  tutorDraft: "",
  tutorMessages: [
    {
      id: "welcome",
      role: "tutor",
      text: "Xin chào. Mình là VLearn Tutor. Bạn có thể hỏi về slide đang mở hoặc tạo quiz để tự kiểm tra.",
    },
  ],
  notice: "",
  selectedSourceFile: null,
  leftPanelWidth: 264,
  rightPanelWidth: 316,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  scenario: "normal",
  processingStage: 0,
  quizQuestionCount: 4,
  generatedQuestions: [],
  currentQuestionIndex: 0,
  answers: {},
  feedbackOpenFor: null,
  flagged: {},
  errorMessage: "",
};

export function getMaterial(materialId: string): LessonMaterial {
  return lessonDays.flatMap((day) => day.materials).find((material) => material.id === materialId) || defaultMaterial;
}

export function scoreQuiz(questions: QuizQuestion[], answers: Record<string, string>) {
  return questions.reduce((score, question) => score + (answers[question.id] === question.correctChoiceId ? 1 : 0), 0);
}

export function nextScenario(material: LessonMaterial): QuizScenario {
  return material.scenario;
}

export { quizQuestions };
