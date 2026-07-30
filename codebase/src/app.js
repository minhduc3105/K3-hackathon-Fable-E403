import { getMaterial, quizQuestions } from "./features/quiz-from-slides/fixture-data.js";
import { initialState } from "./features/quiz-from-slides/quiz-machine.js";
import { renderApp } from "./features/quiz-from-slides/quiz-ui.js";

const root = document.querySelector("#app");
const sourceUrl = "https://vlearn.dev/course/comp2010/reader?lectureId=Lecture_material_ms204v3b_r9mo78&materialId=material_ms204v3b_r9mo78";
let state = structuredClone(initialState);
let processingTimer = null;
let tutorTimer = null;

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function updateState(nextState, focus = true) {
  state = { ...state, ...nextState };
  applyTheme();
  root.innerHTML = renderApp(state);
  bindEvents();
  if (focus) document.querySelector("#main-content")?.focus();
}

function showNotice(message) {
  updateState({ notice: message }, false);
}

function backToLesson(page = state.currentPage) {
  clearTimeout(processingTimer);
  updateState({ screen: "lesson", currentPage: page, processingStage: 0, errorMessage: "" });
}

function startProcessing() {
  clearTimeout(processingTimer);
  const material = getMaterial(state.activeMaterialId);
  updateState({ screen: "processing", processingStage: 0, scenario: material.scenario, answers: {}, currentQuestionIndex: 0 }, false);

  const advance = () => {
    if (state.screen !== "processing") return;
    if (state.processingStage < 2) {
      updateState({ processingStage: state.processingStage + 1 }, false);
      processingTimer = setTimeout(advance, 750);
      return;
    }
    processingTimer = setTimeout(() => {
      if (state.scenario === "insufficient") {
        updateState({ screen: "insufficient" });
      } else if (state.scenario === "failure") {
        updateState({ screen: "error", errorMessage: "Dịch vụ trích xuất chưa đọc được cấu trúc của học liệu này." });
      } else {
        updateState({ screen: "quiz", currentQuestionIndex: 0, answers: {} });
      }
    }, 650);
  };
  processingTimer = setTimeout(advance, 750);
}

function selectAnswer(value) {
  const question = quizQuestions[state.currentQuestionIndex];
  updateState({ answers: { ...state.answers, [question.id]: value } }, false);
}

function moveQuestion(offset) {
  const nextIndex = Math.min(quizQuestions.length - 1, Math.max(0, state.currentQuestionIndex + offset));
  updateState({ currentQuestionIndex: nextIndex });
}

function selectMaterial(materialId) {
  const material = getMaterial(materialId);
  updateState({
    activeMaterialId: material.id,
    currentPage: material.defaultPage,
    screen: "lesson",
    notice: `Đã mở ${material.name}`,
    answers: {},
    currentQuestionIndex: 0,
  });
}

function downloadMaterial() {
  const material = getMaterial(state.activeMaterialId);
  const content = `VLearn demo material\n${material.name}\n${material.pages} pages\nCurrent page: ${state.currentPage}`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${material.name}.demo.txt`;
  link.click();
  URL.revokeObjectURL(url);
  showNotice(`Đã chuẩn bị bản demo của ${material.name}`);
}

function sendTutorMessage() {
  const question = state.tutorDraft.trim();
  if (!question) {
    showNotice("Hãy nhập câu hỏi trước khi gửi cho Tutor.");
    return;
  }
  clearTimeout(tutorTimer);
  const userMessage = { id: `student-${Date.now()}`, role: "student", text: question };
  updateState({ tutorMessages: [...state.tutorMessages, userMessage], tutorDraft: "", tutorHistoryOpen: false }, false);
  tutorTimer = setTimeout(() => {
    const answer = {
      id: `tutor-${Date.now()}`,
      role: "tutor",
      text: `Ở trang ${state.currentPage}, ý chính là risk threshold cần gắn với mitigation, owner và điều kiện dừng. Bạn có thể mở quiz để tự kiểm tra phần này.`,
    };
    updateState({ tutorMessages: [...state.tutorMessages, answer] }, false);
  }, 500);
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    const action = element.dataset.action;

    if (action === "select-answer") {
      element.addEventListener("change", (event) => selectAnswer(event.target.value));
      return;
    }
    if (action === "tutor-draft") {
      element.addEventListener("input", (event) => {
        state.tutorDraft = event.target.value;
      });
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          sendTutorMessage();
        }
      });
      return;
    }

    element.addEventListener("click", () => {
      if (action === "go-back") {
        if (state.screen === "lesson") showNotice("Bạn đang ở màn hình reader của học liệu.");
        else backToLesson();
      }
      if (action === "toggle-language") updateState({ languageMenuOpen: !state.languageMenuOpen, profileOpen: false }, false);
      if (action === "select-language") updateState({ languageMenuOpen: false, notice: "Ngôn ngữ đang dùng: Tiếng Việt" }, false);
      if (action === "toggle-theme") updateState({ theme: state.theme === "light" ? "dark" : "light" }, false);
      if (action === "toggle-profile") updateState({ profileOpen: !state.profileOpen, languageMenuOpen: false }, false);
      if (action === "close-profile") updateState({ profileOpen: false }, false);
      if (action === "toggle-day") {
        const day = Number(element.dataset.day);
        updateState({ openDay: state.openDay === day ? null : day }, false);
      }
      if (action === "select-material") selectMaterial(element.dataset.material);
      if (action === "set-reader-mode") updateState({ readerMode: element.dataset.mode, notice: element.dataset.mode === "pen" ? "Đã bật chế độ ghi chú." : "Đã bật chế độ đọc." }, false);
      if (action === "zoom-out") updateState({ zoom: Math.max(70, state.zoom - 10) }, false);
      if (action === "zoom-in") updateState({ zoom: Math.min(150, state.zoom + 10) }, false);
      if (action === "fit-width") updateState({ zoom: 115, notice: "Đã căn slide theo chiều rộng." }, false);
      if (action === "fit-page") updateState({ zoom: 85, notice: "Đã căn toàn bộ slide trong reader." }, false);
      if (action === "add-note") updateState({ noteCount: state.noteCount + 1, readerMode: "pen", notice: `Đã thêm note ở trang ${state.currentPage}.` }, false);
      if (action === "download-material") downloadMaterial();
      if (action === "open-material-window") window.open(sourceUrl, "_blank", "noopener,noreferrer");
      if (action === "previous-page") updateState({ currentPage: Math.max(1, state.currentPage - 1) }, false);
      if (action === "next-page") {
        const material = getMaterial(state.activeMaterialId);
        updateState({ currentPage: Math.min(material.pages, state.currentPage + 1) }, false);
      }
      if (action === "start-quiz-generation") startProcessing();
      if (action === "cancel-processing" || action === "back-to-lesson") backToLesson();
      if (action === "retry-processing") startProcessing();
      if (action === "previous-question") moveQuestion(-1);
      if (action === "skip-question") {
        if (state.currentQuestionIndex < quizQuestions.length - 1) moveQuestion(1);
        else updateState({ screen: "review" });
      }
      if (action === "next-question") {
        if (state.currentQuestionIndex < quizQuestions.length - 1) moveQuestion(1);
        else updateState({ screen: "review" });
      }
      if (action === "retry-quiz") updateState({ screen: "quiz", currentQuestionIndex: 0, answers: {}, flagged: {} });
      if (action === "open-feedback") updateState({ feedbackOpenFor: element.dataset.question }, false);
      if (action === "flag-feedback") {
        const questionId = element.dataset.question;
        updateState({ flagged: { ...state.flagged, [questionId]: element.dataset.reason }, feedbackOpenFor: null }, false);
      }
      if (action === "jump-to-source") backToLesson(Number(element.dataset.page));
      if (action === "toggle-history") updateState({ tutorHistoryOpen: !state.tutorHistoryOpen }, false);
      if (action === "new-chat") updateState({ tutorMessages: [], tutorHistoryOpen: false, tutorDraft: "", notice: "Đã tạo cuộc hội thoại mới." }, false);
      if (action === "restore-chat") updateState({ tutorMessages: [...initialState.tutorMessages, { id: `restored-${Date.now()}`, role: "student", text: element.textContent.trim() }], tutorHistoryOpen: false }, false);
      if (action === "send-tutor") sendTutorMessage();
      if (action === "dismiss-notice") updateState({ notice: "" }, false);
    });
  });
}

applyTheme();
root.innerHTML = renderApp(state);
bindEvents();

window.__VLEARN_DEMO__ = {
  state: () => state,
  openMaterial: selectMaterial,
  startQuiz: startProcessing,
};
