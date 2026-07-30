"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { quizQuestions } from "../data/lesson-fixture";
import { getMaterial, initialState } from "../model/quiz-machine";
import type { DemoState, SlideCatalogEntry } from "../model/types";
import { LessonSidebar, TutorSidebar } from "./sidebars";
import { LessonScreen, ProcessingScreen, QuizScreen, ReviewScreen, SimpleEmptyScreen } from "./flow-screens";
import { Topbar } from "./topbar";

type WorkbenchProps = {
  courseId: string;
  lectureId: string;
  materialId: string;
  slideCatalog: SlideCatalogEntry[];
};

const LEFT_PANEL_MIN = 216;
const RIGHT_PANEL_MIN = 264;
const PANEL_MAX = 440;

function clamp(value: number, min: number, max = PANEL_MAX) {
  return Math.min(max, Math.max(min, value));
}

export function VLearnWorkbench({ courseId, lectureId, materialId, slideCatalog }: WorkbenchProps) {
  const initialMaterial = useMemo(() => getMaterial(materialId), [materialId]);
  const [state, setState] = useState<DemoState>(() => ({
    ...initialState,
    activeMaterialId: initialMaterial.id,
    currentPage: 1,
    selectedSourceFile: slideCatalog[0]?.fileName ?? null,
  }));
  const processingTimer = useRef<number | null>(null);
  const tutorTimer = useRef<number | null>(null);
  const activeSource = slideCatalog.find((file) => file.fileName === state.selectedSourceFile) ?? slideCatalog[0] ?? {
    fileName: "Học liệu PDF",
    sizeBytes: 0,
    pageCount: 1,
    relativePath: "",
  };
  const sourceFileName = activeSource?.fileName ?? "Học liệu PDF";
  const sourcePageCount = activeSource?.pageCount ?? 1;
  const sourceUrl = `/api/slides/${encodeURIComponent(sourceFileName)}`;
  const layoutStyle = {
    "--left-panel-width": `${state.leftPanelCollapsed ? 56 : state.leftPanelWidth}px`,
    "--right-panel-width": `${state.rightPanelCollapsed ? 56 : state.rightPanelWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    document.querySelector<HTMLElement>("#main-content")?.focus();
  }, [state.screen]);

  useEffect(() => () => {
    if (processingTimer.current) window.clearTimeout(processingTimer.current);
    if (tutorTimer.current) window.clearTimeout(tutorTimer.current);
  }, []);

  useEffect(() => {
    if (state.screen !== "processing") return;
    if (processingTimer.current) window.clearTimeout(processingTimer.current);

    const advance = () => {
      setState((current) => {
        if (current.screen !== "processing") return current;
        if (current.processingStage < 2) {
          processingTimer.current = window.setTimeout(advance, 650);
          return { ...current, processingStage: (current.processingStage + 1) as 0 | 1 | 2 };
        }
        processingTimer.current = window.setTimeout(() => setState((latest) => ({ ...latest, screen: "quiz", currentQuestionIndex: 0, answers: {} })), 550);
        return current;
      });
    };

    processingTimer.current = window.setTimeout(advance, 650);
    return () => { if (processingTimer.current) window.clearTimeout(processingTimer.current); };
  }, [state.screen]);

  const updateState = (patch: Partial<DemoState>, moveFocus = false) => {
    setState((current) => ({ ...current, ...patch }));
    if (moveFocus) window.requestAnimationFrame(() => document.querySelector<HTMLElement>("#main-content")?.focus());
  };

  const backToLesson = (page = state.currentPage) => {
    if (processingTimer.current) window.clearTimeout(processingTimer.current);
    updateState({ screen: "lesson", currentPage: Math.min(sourcePageCount, Math.max(1, page)), processingStage: 0, errorMessage: "" }, true);
  };

  const startProcessing = () => {
    if (processingTimer.current) window.clearTimeout(processingTimer.current);
    updateState({ screen: "processing", processingStage: 0, scenario: "normal", answers: {}, currentQuestionIndex: 0 });
  };

  const selectSourceFile = (fileName: string) => {
    updateState({ selectedSourceFile: fileName, currentPage: 1, screen: "lesson", answers: {}, currentQuestionIndex: 0, notice: `Đã mở ${fileName}` });
  };

  const downloadMaterial = () => {
    const link = document.createElement("a");
    link.href = sourceUrl;
    link.download = sourceFileName;
    link.click();
  };

  const sendTutorMessage = () => {
    const question = state.tutorDraft.trim();
    if (!question) {
      updateState({ notice: "Hãy nhập câu hỏi trước khi gửi cho Tutor." });
      return;
    }
    if (tutorTimer.current) window.clearTimeout(tutorTimer.current);
    setState((current) => ({ ...current, tutorMessages: [...current.tutorMessages, { id: `student-${Date.now()}`, role: "student", text: question }], tutorDraft: "", tutorHistoryOpen: false }));
    tutorTimer.current = window.setTimeout(() => {
      setState((current) => ({ ...current, tutorMessages: [...current.tutorMessages, { id: `tutor-${Date.now()}`, role: "tutor", text: `Mình đang bám theo ${sourceFileName}, trang ${state.currentPage}. Bạn có thể tạo quiz để tự kiểm tra phần vừa xem.` }] }));
    }, 500);
  };

  const resizePanel = (panel: "left" | "right", event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = panel === "left" ? state.leftPanelWidth : state.rightPanelWidth;
    const min = panel === "left" ? LEFT_PANEL_MIN : RIGHT_PANEL_MIN;
    const move = (moveEvent: globalThis.PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const width = panel === "left" ? startWidth + delta : startWidth - delta;
      setState((current) => panel === "left"
        ? { ...current, leftPanelWidth: clamp(width, min), leftPanelCollapsed: false }
        : { ...current, rightPanelWidth: clamp(width, min), rightPanelCollapsed: false });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  const resizeWithKeyboard = (panel: "left" | "right", event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 16 : -16;
    setState((current) => panel === "left"
      ? { ...current, leftPanelWidth: clamp(current.leftPanelWidth + direction, LEFT_PANEL_MIN), leftPanelCollapsed: false }
      : { ...current, rightPanelWidth: clamp(current.rightPanelWidth - direction, RIGHT_PANEL_MIN), rightPanelCollapsed: false });
  };

  return (
    <div className={`app-shell app-screen-${state.screen}`} style={layoutStyle}>
      <Topbar
        state={state}
        materialName={sourceFileName}
        lectureId={lectureId}
        onBack={() => state.screen === "lesson" ? updateState({ notice: "Bạn đang ở màn hình reader của học liệu." }) : backToLesson()}
        onToggleLanguage={() => updateState({ languageMenuOpen: !state.languageMenuOpen, profileOpen: false })}
        onSelectLanguage={() => updateState({ languageMenuOpen: false, notice: "Ngôn ngữ đang dùng: Tiếng Việt" })}
        onToggleTheme={() => updateState({ theme: state.theme === "light" ? "dark" : "light" })}
        onToggleProfile={() => updateState({ profileOpen: !state.profileOpen, languageMenuOpen: false })}
        onCloseProfile={() => updateState({ profileOpen: false })}
      />
      <div className="reader-layout">
        <LessonSidebar
          sourceFiles={slideCatalog}
          onSelectSourceFile={selectSourceFile}
          activeSourceFile={activeSource?.fileName}
          collapsed={state.leftPanelCollapsed}
          onToggleCollapsed={() => updateState({ leftPanelCollapsed: !state.leftPanelCollapsed })}
        />
        <div className="panel-resizer" role="separator" aria-orientation="vertical" aria-label="Đổi độ rộng học liệu" aria-valuenow={state.leftPanelWidth} tabIndex={0} onPointerDown={(event) => resizePanel("left", event)} onKeyDown={(event) => resizeWithKeyboard("left", event)} />
        <main className="reader-main" id="main-content" tabIndex={-1}>
          {state.screen !== "lesson" ? <div className="breadcrumb"><span>Khóa học</span><span aria-hidden="true">/</span><span>{courseId.toUpperCase()}</span><span aria-hidden="true">/</span><span className="breadcrumb-current">{state.screen === "processing" ? "Đang tạo câu hỏi" : state.screen === "quiz" ? "Làm bài kiểm tra" : state.screen === "review" ? "Kết quả" : state.screen === "insufficient" ? "Chưa đủ nội dung" : "Lỗi xử lý"}</span></div> : null}
          {state.screen === "lesson" ? <LessonScreen state={state} sourceFile={activeSource} sourceUrl={sourceUrl} onZoomOut={() => updateState({ zoom: Math.max(70, state.zoom - 10) })} onZoomIn={() => updateState({ zoom: Math.min(150, state.zoom + 10) })} onFitPage={() => updateState({ zoom: 90 })} onDownloadMaterial={downloadMaterial} onOpenMaterialWindow={() => window.open(sourceUrl, "_blank", "noopener,noreferrer")} onPreviousPage={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })} onNextPage={() => updateState({ currentPage: Math.min(sourcePageCount, state.currentPage + 1) })} /> : null}
          {state.screen === "processing" ? <ProcessingScreen state={state} sourceFileName={sourceFileName} onCancelProcessing={() => backToLesson()} /> : null}
          {state.screen === "quiz" ? <QuizScreen state={state} sourceFileName={sourceFileName} onSelectAnswer={(value) => { const question = quizQuestions[state.currentQuestionIndex]; updateState({ answers: { ...state.answers, [question.id]: value } }); }} onPreviousQuestion={() => updateState({ currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1) })} onSkipQuestion={() => state.currentQuestionIndex < quizQuestions.length - 1 ? updateState({ currentQuestionIndex: state.currentQuestionIndex + 1 }) : updateState({ screen: "review" })} onNextQuestion={() => state.currentQuestionIndex < quizQuestions.length - 1 ? updateState({ currentQuestionIndex: state.currentQuestionIndex + 1 }) : updateState({ screen: "review" })} /> : null}
          {state.screen === "review" ? <ReviewScreen state={state} sourceFileName={sourceFileName} onRetryQuiz={() => updateState({ screen: "quiz", currentQuestionIndex: 0, answers: {}, flagged: {} })} onBackToLesson={() => backToLesson()} onOpenFeedback={(questionId) => updateState({ feedbackOpenFor: questionId })} onFlagFeedback={(questionId, reason) => updateState({ flagged: { ...state.flagged, [questionId]: reason }, feedbackOpenFor: null })} onJumpToSource={(page) => backToLesson(page)} /> : null}
          {state.screen === "insufficient" ? <SimpleEmptyScreen notice="Không đủ căn cứ" title="Chưa đủ nội dung để tạo câu hỏi" body={`${sourceFileName} chủ yếu là hình ảnh hoặc có quá ít chữ rõ ràng.`} actionLabel="Quay lại học liệu" onAction={() => backToLesson()} /> : null}
          {state.screen === "error" ? <SimpleEmptyScreen notice="Chưa hoàn tất" title="Không thể tạo bộ câu hỏi lúc này" body={state.errorMessage || `Không thể xử lý ${sourceFileName} trong lần này.`} actionLabel="Thử lại" onAction={startProcessing} /> : null}
        </main>
        <div className="panel-resizer" role="separator" aria-orientation="vertical" aria-label="Đổi độ rộng VLearn Tutor" aria-valuenow={state.rightPanelWidth} tabIndex={0} onPointerDown={(event) => resizePanel("right", event)} onKeyDown={(event) => resizeWithKeyboard("right", event)} />
        <TutorSidebar
          state={state}
          sourceFileName={sourceFileName}
          currentPage={state.currentPage}
          tutorMessages={state.tutorMessages}
          tutorDraft={state.tutorDraft}
          onToggleHistory={() => updateState({ tutorHistoryOpen: !state.tutorHistoryOpen })}
          onNewChat={() => updateState({ tutorMessages: [], tutorHistoryOpen: false, tutorDraft: "", notice: "Đã tạo cuộc hội thoại mới." })}
          onRestoreChat={(label) => updateState({ tutorMessages: [...initialState.tutorMessages, { id: `restored-${Date.now()}`, role: "student", text: label }], tutorHistoryOpen: false })}
          onTutorDraftChange={(value) => setState((current) => ({ ...current, tutorDraft: value }))}
          onSendTutor={sendTutorMessage}
          onStartQuizGeneration={startProcessing}
          onDismissNotice={() => updateState({ notice: "" })}
          notice={state.notice}
          collapsed={state.rightPanelCollapsed}
          onToggleCollapsed={() => updateState({ rightPanelCollapsed: !state.rightPanelCollapsed })}
        />
      </div>
    </div>
  );
}
