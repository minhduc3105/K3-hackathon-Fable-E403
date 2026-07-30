export const initialState = {
  screen: "lesson",
  activeMaterialId: "day05-requirements",
  openDay: 5,
  currentPage: 35,
  zoom: 103,
  readerMode: "read",
  noteCount: 1,
  theme: "light",
  languageMenuOpen: false,
  profileOpen: false,
  tutorHistoryOpen: false,
  tutorDraft: "",
  tutorMessages: [
    {
      id: "welcome",
      role: "tutor",
      text: "Xin chào! Mình là VLearn Tutor. Bạn có thể hỏi về slide đang mở hoặc tự kiểm tra bài học.",
    },
  ],
  notice: "",
  scenario: "normal",
  processingStage: 0,
  currentQuestionIndex: 0,
  answers: {},
  feedbackOpenFor: null,
  flagged: {},
  errorMessage: "",
};

export function scoreQuiz(questions, answers) {
  return questions.reduce(
    (score, question) => score + (answers[question.id] === question.correctChoiceId ? 1 : 0),
    0,
  );
}
