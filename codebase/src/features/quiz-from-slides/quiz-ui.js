import { getMaterial, lesson, lessonDays, quizQuestions } from "./fixture-data.js";
import { scoreQuiz } from "./quiz-machine.js";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function breadcrumb(label) {
  return `<div class="breadcrumb"><span>Khóa học</span><span aria-hidden="true">/</span><span>${lesson.courseCode}</span><span aria-hidden="true">/</span><span class="breadcrumb-current">${escapeHtml(label)}</span></div>`;
}

function renderTopbar(state, material) {
  const languageMenu = state.languageMenuOpen
    ? `<div class="topbar-popover language-popover"><button type="button" data-action="select-language" data-language="vi">Tiếng Việt <span>Đang dùng</span></button></div>`
    : "";
  const profileMenu = state.profileOpen
    ? `<div class="topbar-popover profile-popover"><strong>Sinh viên ẩn danh</strong><span>${lesson.courseCode} · Đang học</span><button type="button" data-action="close-profile">Đóng</button></div>`
    : "";

  return `<header class="topbar">
    <div class="topbar-leading">
      <button class="icon-button" type="button" data-action="go-back" aria-label="Quay lại">‹</button>
      <div class="brand-lockup"><span class="brand-mark">V</span><span>VLearn</span></div>
      <div class="file-context"><strong>${escapeHtml(material.name)}</strong><span>${lesson.courseCode} · ${escapeHtml(lesson.lectureId)}</span></div>
    </div>
    <div class="topbar-actions">
      <div class="popover-anchor"><button class="locale-button" type="button" data-action="toggle-language" aria-expanded="${state.languageMenuOpen}">VI</button>${languageMenu}</div>
      <button class="icon-button" type="button" data-action="toggle-theme" aria-label="Đổi giao diện">${state.theme === "dark" ? "☀" : "◐"}</button>
      <div class="popover-anchor"><button class="avatar-label" type="button" data-action="toggle-profile" aria-expanded="${state.profileOpen}"><span class="avatar" aria-hidden="true">AN</span><span>Sinh viên ẩn danh</span></button>${profileMenu}</div>
    </div>
  </header>`;
}

function renderSidebar(state) {
  const days = lessonDays.map((day) => {
    const isOpen = state.openDay === day.id;
    const materials = isOpen
      ? `<div class="materials-list">${day.materials.map((material) => `<button class="material-item ${state.activeMaterialId === material.id ? "is-current" : ""}" type="button" data-action="select-material" data-material="${material.id}" ${state.activeMaterialId === material.id ? 'aria-current="page"' : ""}><span>⊙</span><span><strong>${escapeHtml(material.name)}</strong><small>${material.pages} trang</small></span>${state.activeMaterialId === material.id ? "<span>✓</span>" : ""}</button>`).join("")}</div>`
      : "";
    return `<div class="day-group ${isOpen ? "is-open" : ""}"><button class="day-button" type="button" data-action="toggle-day" data-day="${day.id}" aria-expanded="${isOpen}"><span>⊙</span><strong>${day.label}</strong><span class="day-count">${day.materials.length} TÀI LIỆU · ${day.status}</span><span>${isOpen ? "⌃" : "⌄"}</span></button>${day.status === "STUDYING" ? '<span class="studying-badge">STUDYING</span>' : ""}${materials}</div>`;
  }).join("");

  return `<aside class="lesson-sidebar" aria-label="Nội dung buổi học">
    <div class="materials-heading"><span class="materials-icon">▣</span><div><h2>Học liệu môn học</h2><p>Chương, slide và tài liệu đã upload</p></div></div>
    <div class="day-list">${days}</div>
  </aside>`;
}

function renderTutor(state) {
  const material = getMaterial(state.activeMaterialId);
  const messages = state.tutorMessages.map((message) => `<div class="tutor-message ${message.role === "student" ? "is-student" : ""}">${escapeHtml(message.text)}</div>`).join("");
  const history = state.tutorHistoryOpen
    ? `<div class="tutor-history"><strong>Lịch sử gần đây</strong><button type="button" data-action="restore-chat">Risk threshold và tiêu chí ship</button><button type="button" data-action="restore-chat">Context window của LLM</button></div>`
    : "";

  return `<aside class="tutor-sidebar" aria-label="AI Tutor">
    <div class="tutor-heading"><div class="tutor-heading-title"><span class="tutor-icon">▣</span><div><h2>VLearn Tutor</h2><span><i></i> Trợ lý học theo ngữ cảnh</span></div></div><div class="tutor-actions"><button class="icon-button" type="button" data-action="toggle-history" aria-label="Lịch sử">◷</button><button class="icon-button" type="button" data-action="new-chat" aria-label="Cuộc hội thoại mới">+</button></div></div>
    <div class="tutor-context"><span>Ngữ cảnh: <strong>slide trang ${state.currentPage}</strong></span></div>
    <section class="tutor-quiz-entry" aria-label="Tạo câu hỏi ôn tập"><span class="eyebrow">Ôn tập từ học liệu</span><p>${escapeHtml(material.name)}</p><button class="primary-button" type="button" data-action="start-quiz-generation">Tạo câu hỏi ôn tập</button></section>
    ${history}
    <div class="tutor-messages" aria-live="polite">${messages}</div>
    <div class="tutor-input"><input id="tutor-draft" data-action="tutor-draft" value="${escapeHtml(state.tutorDraft)}" placeholder="Nhập câu hỏi về slide đang mở..." aria-label="Câu hỏi cho VLearn Tutor" /><button type="button" data-action="send-tutor" aria-label="Gửi câu hỏi">➤</button></div>
  </aside>`;
}

function shell(content, activeLabel, state) {
  const material = getMaterial(state.activeMaterialId);
  const notice = state.notice ? `<div class="notice" role="status"><span>${escapeHtml(state.notice)}</span><button type="button" data-action="dismiss-notice" aria-label="Đóng thông báo">×</button></div>` : "";
  return `<div class="app-shell app-screen-${state.screen}">${renderTopbar(state, material)}<div class="reader-layout">${renderSidebar(state)}<main class="reader-main" id="main-content" tabindex="-1">${breadcrumb(activeLabel)}${content}</main>${renderTutor(state)}</div>${notice}</div>`;
}

function renderReaderToolbar(state) {
  return `<div class="reader-toolbar">
    <button class="tool-button ${state.readerMode === "read" ? "is-active" : ""}" type="button" data-action="set-reader-mode" data-mode="read">⌁ Đọc</button>
    <button class="tool-button ${state.readerMode === "pen" ? "is-active" : ""}" type="button" data-action="set-reader-mode" data-mode="pen">⌕ Bút</button>
    <button class="page-note" type="button" data-action="add-note">Trang ${state.currentPage} · ${state.noteCount} note</button>
    <button class="zoom-button" type="button" data-action="zoom-out" aria-label="Thu nhỏ">−</button><strong>${state.zoom}%</strong><button class="zoom-button" type="button" data-action="zoom-in" aria-label="Phóng to">+</button>
    <span class="toolbar-divider"></span>
    <button class="zoom-button" type="button" data-action="fit-width" aria-label="Vừa chiều rộng">↔</button>
    <button class="zoom-button" type="button" data-action="fit-page" aria-label="Vừa trang">□</button>
    <button class="zoom-button" type="button" data-action="download-material" aria-label="Tải học liệu">⇩</button>
    <button class="zoom-button" type="button" data-action="open-material-window" aria-label="Mở học liệu ở tab mới">↗</button>
  </div>`;
}

export function renderLesson(state) {
  const material = getMaterial(state.activeMaterialId);
  const pageBefore = Math.max(1, state.currentPage - 1);
  const pageAfter = Math.min(material.pages, state.currentPage + 1);
  const content = `<section class="lesson-header"><span class="eyebrow">Lecture material · Trang ${state.currentPage} / ${material.pages}</span><h1>${escapeHtml(material.title)}</h1><p>${escapeHtml(material.name)} · học liệu đang mở</p><div class="lesson-meta"><span><strong>${material.pages}</strong> slide</span><span>Chế độ <strong>${state.readerMode === "read" ? "Đọc" : "Ghi chú"}</strong></span><span>Zoom <strong>${state.zoom}%</strong></span></div></section>
    <section class="reader-stage ${state.readerMode === "pen" ? "is-pen-mode" : ""}" aria-label="Slide bài học">${renderReaderToolbar(state)}<div class="slide-stack" style="--reader-scale: ${state.zoom / 100}"><article class="paper-slide paper-slide-top"><span class="slide-meta">Trang ${pageBefore} / ${material.pages}<span>${escapeHtml(material.name)}</span></span><div class="slide-content"><span class="slide-caption">Impact</span><div class="risk-grid"><span>Reduce</span><span>Accept</span><span>Monitor</span><span>Mitigate</span></div><small>1: Privacy leak · 2: Hallucination on sensitive advice<br />3: Cost spike · 4: Adoption risk</small></div></article><article class="paper-slide paper-slide-current"><span class="slide-meta">Trang ${state.currentPage} / ${material.pages}<span>${escapeHtml(material.name)}</span></span><div class="slide-content"><div class="slide-title-bar">Go / No-Go Criteria Dựa Trên Risk Threshold</div><ul><li><strong>Go:</strong> risk cao đã có mitigation, acceptance criteria đo được, owner rõ.</li><li><strong>Conditional go:</strong> pilot giới hạn, human-in-the-loop, guardrails chặt, scope nhỏ.</li><li><strong>No-go:</strong> chưa xử lý privacy / compliance risk, chưa có fallback.</li></ul><div class="slide-callout">Risk register giúp team biết build trong điều kiện nào, ship ở mức nào, và khi nào phải dừng.</div></div></article><article class="paper-slide paper-slide-bottom"><span class="slide-meta">Trang ${pageAfter} / ${material.pages}<span>${escapeHtml(material.name)}</span></span><div class="slide-content"><span class="slide-caption">Build decision</span><h2>Chốt điều kiện trước khi ship</h2></div></article></div><div class="reader-pagination"><button class="zoom-button" type="button" data-action="previous-page" aria-label="Trang trước" ${state.currentPage <= 1 ? "disabled" : ""}>‹</button><span>Trang ${state.currentPage} / ${material.pages}</span><button class="zoom-button" type="button" data-action="next-page" aria-label="Trang sau" ${state.currentPage >= material.pages ? "disabled" : ""}>›</button></div></section>
    `;
  return shell(content, "Bài học", state);
}

export function renderProcessing(state) {
  const material = getMaterial(state.activeMaterialId);
  const stages = ["Đang đọc học liệu", "Đang chọn nội dung chính", "Đang tạo câu hỏi"];
  const statusSteps = stages.map((stage, index) => `<div class="status-step ${index < state.processingStage ? "is-complete" : index === state.processingStage ? "is-active" : ""}"><span class="step-mark">${index < state.processingStage ? "✓" : index === state.processingStage ? "..." : ""}</span><span>${stage}</span></div>`).join("");
  const content = `<div class="flow-wrap"><section class="flow-header"><span class="eyebrow">Đang xử lý học liệu hiện tại</span><h1>Chuẩn bị bộ câu hỏi</h1><p>VLearn đang dùng ${escapeHtml(material.name)} làm nguồn duy nhất.</p></section><section class="flow-panel status-panel" aria-live="polite"><div><span class="file-icon">AI</span><h2>${stages[state.processingStage]}</h2><p>Không cần upload lại file. Nguồn và số trang sẽ được giữ trong phần review.</p><div class="status-steps">${statusSteps}</div><div class="action-row"><button class="secondary-button" type="button" data-action="cancel-processing">Hủy</button></div></div></section></div>`;
  return shell(content, "Đang tạo câu hỏi", state);
}

export function renderQuiz(state) {
  const material = getMaterial(state.activeMaterialId);
  const question = quizQuestions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[question.id] || "";
  const isLast = state.currentQuestionIndex === quizQuestions.length - 1;
  const choices = question.choices.map((choice, index) => `<label class="choice ${selectedAnswer === choice.id ? "is-selected" : ""}"><input type="radio" name="answer" value="${choice.id}" ${selectedAnswer === choice.id ? "checked" : ""} data-action="select-answer" /><span class="choice-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(choice.label)}</span></label>`).join("");
  const content = `<div class="quiz-shell"><div class="progress-row"><span>${escapeHtml(material.name)}</span><strong>Câu ${state.currentQuestionIndex + 1} / ${quizQuestions.length}</strong></div><section class="question-card"><div class="question-heading"><div><span class="eyebrow">Nhớ lại ý chính</span><h1>${escapeHtml(question.prompt)}</h1></div><span class="question-number">Q${String(state.currentQuestionIndex + 1).padStart(2, "0")}</span></div><fieldset class="choice-list"><legend class="sr-only">Chọn một đáp án</legend>${choices}</fieldset><div class="question-footer"><div class="quiz-secondary-actions">${state.currentQuestionIndex > 0 ? '<button class="text-button" type="button" data-action="previous-question">Câu trước</button>' : ""}<button class="text-button" type="button" data-action="skip-question">Bỏ qua</button></div><button class="primary-button" type="button" data-action="next-question" ${selectedAnswer ? "" : "disabled"}>${isLast ? "Nộp bài" : "Tiếp tục"}</button></div></section></div>`;
  return shell(content, "Làm bài kiểm tra", state);
}

export function renderReview(state) {
  const material = getMaterial(state.activeMaterialId);
  const score = scoreQuiz(quizQuestions, state.answers);
  const items = quizQuestions.map((question, index) => {
    const selected = question.choices.find((choice) => choice.id === state.answers[question.id]);
    const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
    const isCorrect = state.answers[question.id] === question.correctChoiceId;
    const feedback = state.flagged[question.id]
      ? `<p class="muted-caption" role="status">Đã ghi nhận phản hồi cho câu hỏi này.</p>`
      : state.feedbackOpenFor === question.id
        ? `<div class="feedback-box"><p>Điều gì chưa ổn?</p><div class="feedback-options"><button class="feedback-option" type="button" data-action="flag-feedback" data-reason="Không có trong slide" data-question="${question.id}">Không có trong slide</button><button class="feedback-option" type="button" data-action="flag-feedback" data-reason="Đáp án chưa rõ" data-question="${question.id}">Đáp án chưa rõ</button><button class="feedback-option" type="button" data-action="flag-feedback" data-reason="Câu hỏi khó hiểu" data-question="${question.id}">Câu hỏi khó hiểu</button></div></div>`
        : `<button class="text-button" type="button" data-action="open-feedback" data-question="${question.id}">Câu hỏi chưa chính xác</button>`;
    return `<article class="review-item ${isCorrect ? "is-correct" : "is-incorrect"}"><h2>${index + 1}. ${escapeHtml(question.prompt)}</h2><div class="answer-summary"><span>Bạn chọn: <strong>${selected ? escapeHtml(selected.label) : "Bỏ qua"}</strong></span><span>Đáp án đúng: <strong>${escapeHtml(correct.label)}</strong></span></div><div class="explanation">${escapeHtml(question.explanation)}</div><button class="source-link" type="button" data-action="jump-to-source" data-page="${question.source.pageOrSlide}">Nguồn: ${escapeHtml(material.name)} · slide ${question.source.pageOrSlide}</button><p class="source-excerpt">${escapeHtml(question.source.excerpt)}</p><div class="feedback-actions">${feedback}</div></article>`;
  }).join("");
  const content = `<div class="flow-wrap"><section class="review-header"><div><span class="eyebrow">Kết quả kiểm tra nhanh</span><h1>Bạn nhớ đúng ${score}/${quizQuestions.length} câu</h1><p>Quiz được tạo từ ${escapeHtml(material.name)}. Đây là bước tự kiểm tra, không phải đánh giá mức độ thành thạo.</p></div><div class="review-score"><strong>${score}/${quizQuestions.length}</strong><span>câu đúng</span></div></section><div class="review-list">${items}</div><div class="action-row"><button class="secondary-button" type="button" data-action="retry-quiz">Làm lại</button><button class="primary-button" type="button" data-action="back-to-lesson">Quay lại học liệu</button></div></div>`;
  return shell(content, "Kết quả", state);
}

export function renderInsufficient(state) {
  const material = getMaterial(state.activeMaterialId);
  const content = `<div class="flow-wrap"><section class="flow-header"><span class="eyebrow">Không đủ căn cứ</span><h1>Chưa đủ nội dung để tạo câu hỏi</h1><p>${escapeHtml(material.name)} chủ yếu là hình ảnh hoặc có quá ít chữ rõ ràng.</p></section><section class="flow-panel insufficient-panel"><h2 class="alert-title">VLearn không tạo câu hỏi bằng cách đoán.</h2><p class="alert-copy">Hãy quay lại học liệu khác có text layer. Tiến độ đọc của bạn vẫn được giữ nguyên.</p><p class="alert-note"><strong>Vì sao dừng?</strong><br />Một câu hỏi sai từ nội dung mơ hồ có thể khiến người học ghi nhớ sai kiến thức.</p><div class="action-row"><button class="primary-button" type="button" data-action="back-to-lesson">Quay lại học liệu</button></div></section></div>`;
  return shell(content, "Chưa đủ nội dung", state);
}

export function renderError(state) {
  const material = getMaterial(state.activeMaterialId);
  const content = `<div class="flow-wrap"><section class="flow-header"><span class="eyebrow">Chưa hoàn tất</span><h1>Không thể tạo bộ câu hỏi lúc này</h1><p>${escapeHtml(state.errorMessage || `Không thể xử lý ${material.name} trong lần này.`)}</p></section><section class="flow-panel error-panel"><h2 class="alert-title">Học liệu hiện tại vẫn được giữ</h2><p class="alert-copy">Bạn có thể thử lại mà không cần chọn hoặc upload file lần nữa.</p><div class="action-row"><button class="secondary-button" type="button" data-action="back-to-lesson">Quay lại học liệu</button><button class="primary-button" type="button" data-action="retry-processing">Thử lại</button></div></section></div>`;
  return shell(content, "Lỗi xử lý", state);
}

export function renderApp(state) {
  if (state.screen === "lesson") return renderLesson(state);
  if (state.screen === "processing") return renderProcessing(state);
  if (state.screen === "quiz") return renderQuiz(state);
  if (state.screen === "review") return renderReview(state);
  if (state.screen === "insufficient") return renderInsufficient(state);
  return renderError(state);
}
