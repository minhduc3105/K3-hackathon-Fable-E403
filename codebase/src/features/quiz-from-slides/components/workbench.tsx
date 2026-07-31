"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpenText, CaretLeft, CaretRight, ChatCircleDots, Check, CheckCircle, CircleNotch, CornersOut, DownloadSimple, FilePdf, Minus, Moon, PaperPlaneRight, Plus, Robot, Sparkle, Sun, X } from "@phosphor-icons/react";
import { getMaterial, initialState, scoreQuiz } from "../model/quiz-machine";
import type { DemoState, GenerateQuizResult, QuizAttempt, QuizDifficulty, QuizQuestion, QuizScenario, SlideCatalogEntry, TutorMessage } from "../model/types";

type Props = { courseId: string; lectureId: string; materialId: string; slideCatalog: SlideCatalogEntry[]; demoScenario?: QuizScenario };
type Panel = "materials" | "tutor";
const MIN_LEFT = 224, MIN_RIGHT = 280, MAX_PANEL = 400, MIN_MAIN = 440, GUTTER = 16;
const clamp = (value: number, min: number, max = MAX_PANEL) => Math.min(max, Math.max(min, value));
const bytes = (value: number) => value < 1024 ? `${value} B` : value < 1048576 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(1)} MB`;
const quizHistoryKey = (sourceFileName: string) => `vlearn:quiz-history:v2:${sourceFileName}`;
const readQuizHistory = (sourceFileName: string) => {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(quizHistoryKey(sourceFileName)) ?? "[]") as unknown;
    return Array.isArray(stored)
      ? stored.filter((item): item is string => typeof item === "string").slice(-80)
      : [];
  } catch {
    return [];
  }
};
const saveQuizHistory = (sourceFileName: string, prompts: string[]) => {
  try {
    window.sessionStorage.setItem(quizHistoryKey(sourceFileName), JSON.stringify(prompts.slice(-80)));
  } catch {
    // Storage being unavailable must not prevent a learner from taking a quiz.
  }
};
const quizHistoryEntry = (question: QuizQuestion) =>
  `${question.prompt}\nNguồn đã dùng: ${question.source.excerpt}`;
const learningAssessment = (score: number, total: number) => {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.85) return "Nắm vững: bạn nhớ tốt các ý chính. Hãy thử áp dụng vào một tình huống mới.";
  if (ratio >= 0.6) return "Đang tiến bộ: xem lại các câu sai và phần nguồn đi kèm trước khi làm lại.";
  return "Cần ôn thêm: quay lại slide nguồn, chọn một phần kiến thức cụ thể rồi tạo bộ câu hỏi mới.";
};
const reviewPriorities = (questions: QuizQuestion[], answers: Record<string, string>) => questions
  .filter((question) => answers[question.id] !== question.correctChoiceId)
  .map((question) => ({ slide: question.source.pageOrSlide, excerpt: question.source.excerpt }))
  .filter((item, index, items) => items.findIndex((candidate) => candidate.slide === item.slide && candidate.excerpt === item.excerpt) === index)
  .slice(0, 3);

function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => { const query = window.matchMedia("(max-width: 1080px)"); const sync = () => setCompact(query.matches); sync(); query.addEventListener("change", sync); return () => query.removeEventListener("change", sync); }, []);
  return compact;
}

export function VLearnWorkbench({ courseId, lectureId, materialId, slideCatalog, demoScenario = "normal" }: Props) {
  const material = useMemo(() => getMaterial(materialId), [materialId]);
  const compact = useCompact();
  const [drawer, setDrawer] = useState<Panel | null>(null);
  const [state, setState] = useState<DemoState>(() => ({ ...initialState, activeMaterialId: material.id, currentPage: 1, selectedSourceFile: slideCatalog[0]?.fileName ?? null }));
  const controller = useRef<AbortController | null>(null);
  const source = slideCatalog.find((item) => item.fileName === state.selectedSourceFile) ?? slideCatalog[0] ?? { fileName: "Học liệu PDF", sizeBytes: 0, pageCount: 1, relativePath: "" };
  const sourceUrl = `/api/slides/${encodeURIComponent(source.fileName)}`;
  const css = { "--left-width": `${state.leftPanelCollapsed ? 56 : state.leftPanelWidth}px`, "--right-width": `${state.rightPanelCollapsed ? 56 : state.rightPanelWidth}px` } as CSSProperties;
  const patch = (next: Partial<DemoState>) => setState((current) => ({ ...current, ...next }));
  const focusMain = () => window.requestAnimationFrame(() => document.querySelector<HTMLElement>("#main-content")?.focus());

  useEffect(() => { document.documentElement.dataset.theme = state.theme; }, [state.theme]);
  useEffect(() => { if (!compact) setDrawer(null); }, [compact]);
  useEffect(() => { if (!drawer) return; const close = (event: globalThis.KeyboardEvent) => event.key === "Escape" && setDrawer(null); window.addEventListener("keydown", close); window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-close="${drawer}"]`)?.focus()); return () => window.removeEventListener("keydown", close); }, [drawer]);
  useEffect(() => () => controller.current?.abort(), []);

  const backToLesson = (page = state.currentPage) => { controller.current?.abort(); controller.current = null; patch({ screen: "lesson", currentPage: Math.max(1, Math.min(source.pageCount, page)), errorMessage: "" }); focusMain(); };
  const complete = () => {
    const score = scoreQuiz(state.generatedQuestions, state.answers);
    const attempt: QuizAttempt = { id: `attempt-${Date.now()}`, sourceFileName: source.fileName, sourcePage: state.currentPage, questionCount: state.generatedQuestions.length, score, total: state.generatedQuestions.length, completedAtLabel: new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date()), questions: state.generatedQuestions, answers: state.answers, flagged: state.flagged };
    setState((current) => ({ ...current, screen: "review", quizAttempts: [attempt, ...current.quizAttempts].slice(0, 5), notice: `Đánh giá tiếp thu: ${learningAssessment(score, attempt.total)}` })); focusMain();
  };
  const retake = () => { if (!state.generatedQuestions.length) return; patch({ screen: "quiz", currentQuestionIndex: 0, answers: {}, submittedQuestions: {}, flagged: {}, feedbackOpenFor: null, notice: "Bắt đầu làm lại bộ câu hỏi này." }); focusMain(); };
  const generate = async () => {
    if (controller.current) return;
    if (demoScenario === "insufficient") { patch({ screen: "insufficient", errorMessage: "Học liệu này chưa có đủ nội dung chữ rõ ràng để tạo câu hỏi có căn cứ." }); focusMain(); return; }
    if (demoScenario === "failure") { patch({ screen: "error", errorMessage: "Không thể trích xuất nội dung từ học liệu trong lần này." }); focusMain(); return; }
    const previousQuestionPrompts = Array.from(new Set([
      ...readQuizHistory(source.fileName),
      ...state.quizAttempts.filter((attempt) => attempt.sourceFileName === source.fileName).flatMap((attempt) => attempt.questions.map(quizHistoryEntry)),
      ...state.generatedQuestions.map(quizHistoryEntry),
    ])).slice(-80);
    const next = new AbortController(); controller.current = next; patch({ screen: "processing", processingStage: 0, generatedQuestions: [], answers: {}, submittedQuestions: {}, currentQuestionIndex: 0, errorMessage: "" });
    try { const response = await fetch("/api/quiz/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sourceFileName: source.fileName, questionCount: state.quizQuestionCount, quizDifficulty: state.quizDifficulty, learnerInstructions: state.learnerIntent, generationNonce: crypto.randomUUID(), previousQuestionPrompts }), signal: next.signal }); patch({ processingStage: 1 }); const result = await response.json() as GenerateQuizResult; if (result.status === "ready") saveQuizHistory(source.fileName, [...previousQuestionPrompts, ...result.questions.map(quizHistoryEntry)]); patch({ processingStage: 2 });
      if (result.status === "ready") { patch({ screen: "quiz", generatedQuestions: result.questions, currentQuestionIndex: 0, notice: result.generationMode === "grounded_fallback" ? `Đã tạo ${result.questions.length} câu hỏi mới bằng chế độ dự phòng có căn cứ.` : `Đã tạo ${result.questions.length} câu hỏi mới từ học liệu đang mở.` }); focusMain(); }
      else { patch({ screen: result.status === "insufficient_content" ? "insufficient" : result.status === "out_of_scope" ? "rejected" : "error", errorMessage: result.reason }); focusMain(); }
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) { patch({ screen: "error", errorMessage: error instanceof Error ? error.message : "Không thể tạo câu hỏi lúc này." }); focusMain(); } } finally { controller.current = null; }
  };
  const toggle = (panel: Panel) => { if (compact) { setDrawer((current) => current === panel ? null : panel); return; } patch(panel === "materials" ? { leftPanelCollapsed: !state.leftPanelCollapsed } : { rightPanelCollapsed: !state.rightPanelCollapsed }); };
  const resize = (panel: Panel, event: PointerEvent<HTMLDivElement>) => { if (compact || event.button !== 0) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); document.body.classList.add("is-resizing"); const start = event.clientX, initial = panel === "materials" ? state.leftPanelWidth : state.rightPanelWidth, other = panel === "materials" ? (state.rightPanelCollapsed ? 56 : state.rightPanelWidth) : (state.leftPanelCollapsed ? 56 : state.leftPanelWidth), min = panel === "materials" ? MIN_LEFT : MIN_RIGHT, max = Math.max(min, Math.min(MAX_PANEL, window.innerWidth - other - MIN_MAIN - GUTTER)); const move = (moveEvent: globalThis.PointerEvent) => { if ((moveEvent.buttons & 1) === 0) return stop(); const value = clamp(panel === "materials" ? initial + moveEvent.clientX - start : initial - moveEvent.clientX + start, min, max); patch(panel === "materials" ? { leftPanelWidth: value, leftPanelCollapsed: false } : { rightPanelWidth: value, rightPanelCollapsed: false }); }; const stop = () => { document.body.classList.remove("is-resizing"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop, { once: true }); window.addEventListener("pointercancel", stop, { once: true }); };
  const resizeKeys = (panel: Panel, event: KeyboardEvent<HTMLDivElement>) => { if (compact || !["ArrowLeft", "ArrowRight"].includes(event.key)) return; event.preventDefault(); const delta = event.key === "ArrowRight" ? 20 : -20; patch(panel === "materials" ? { leftPanelWidth: clamp(state.leftPanelWidth + delta, MIN_LEFT), leftPanelCollapsed: false } : { rightPanelWidth: clamp(state.rightPanelWidth - delta, MIN_RIGHT), rightPanelCollapsed: false }); };
  const lessonCollapsed = compact ? drawer !== "materials" : state.leftPanelCollapsed, tutorCollapsed = compact ? drawer !== "tutor" : state.rightPanelCollapsed;

  return <div className={`study-app ${compact ? "is-compact" : ""}`} style={css}>
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <Header source={source} lectureId={lectureId} theme={state.theme} drawer={drawer} onBack={() => state.screen === "lesson" ? patch({ notice: "Bạn đang ở học liệu hiện tại." }) : backToLesson()} onTheme={() => patch({ theme: state.theme === "light" ? "dark" : "light" })} onPanel={toggle} />
    <div className="workspace">
      <Materials source={source} files={slideCatalog} collapsed={lessonCollapsed} drawerOpen={drawer === "materials"} onToggle={() => toggle("materials")} onSelect={(fileName) => { patch({ selectedSourceFile: fileName, currentPage: 1, screen: "lesson", answers: {}, submittedQuestions: {} }); setDrawer(null); }} />
      <div className="resize-handle" role="separator" tabIndex={0} aria-label="Đổi độ rộng học liệu" onPointerDown={(event) => resize("materials", event)} onKeyDown={(event) => resizeKeys("materials", event)} />
      <main id="main-content" className="study-main" tabIndex={-1}>{state.screen === "lesson" ? <Reader state={state} source={source} sourceUrl={sourceUrl} onPatch={patch} /> : <Flow state={state} source={source} onAnswer={(id, value) => patch({ answers: { ...state.answers, [id]: value } })} onSubmitAnswer={(id) => patch({ submittedQuestions: { ...state.submittedQuestions, [id]: true } })} onMove={(amount) => patch({ currentQuestionIndex: Math.max(0, Math.min(state.generatedQuestions.length - 1, state.currentQuestionIndex + amount)) })} onBack={backToLesson} onGenerate={generate} onComplete={complete} onRetake={retake} onFlag={(id, reason) => patch({ flagged: { ...state.flagged, [id]: reason }, feedbackOpenFor: null })} onOpenConfig={() => patch({ studyCardExpanded: true })} />}</main>
      <div className="resize-handle" role="separator" tabIndex={0} aria-label="Đổi độ rộng VLearn Tutor" onPointerDown={(event) => resize("tutor", event)} onKeyDown={(event) => resizeKeys("tutor", event)} />
      <Tutor state={state} source={source} collapsed={tutorCollapsed} drawerOpen={drawer === "tutor"} onToggle={() => toggle("tutor")} onGenerate={generate} onPatch={patch} onReview={(attempt) => { patch({ screen: "review", generatedQuestions: attempt.questions, answers: attempt.answers, flagged: attempt.flagged, selectedSourceFile: attempt.sourceFileName }); setDrawer(null); focusMain(); }} />
    </div>
    {drawer ? <button className="drawer-scrim" type="button" aria-label="Đóng bảng bên" onClick={() => setDrawer(null)} /> : null}
    {state.studyCardExpanded && <QuizConfigModal state={state} onClose={() => patch({ studyCardExpanded: false })} onCreate={() => { patch({ studyCardExpanded: false }); generate(); }} onPatch={patch} />}
    {state.notice ? <div className="toast" role="status"><CheckCircle size={18} /><span>{state.notice}</span><button type="button" aria-label="Đóng thông báo" onClick={() => patch({ notice: "" })}><X size={16} /></button></div> : null}
  </div>;
}

function Header({ source, lectureId, theme, drawer, onBack, onTheme, onPanel }: { source: SlideCatalogEntry; lectureId: string; theme: DemoState["theme"]; drawer: Panel | null; onBack: () => void; onTheme: () => void; onPanel: (panel: Panel) => void }) { return <header className="app-header"><div className="brand-row"><button className="icon-button" type="button" onClick={onBack} aria-label="Quay lại" title="Quay lại"><ArrowLeft size={20} /></button><div className="brand"><span>V</span><strong>VLearn</strong></div><div className="header-context"><strong>{source.fileName}</strong><span>{lectureId}</span></div></div><div className="header-actions"><button className={`icon-button compact-only ${drawer === "materials" ? "is-active" : ""}`} type="button" onClick={() => onPanel("materials")} aria-label="Mở học liệu"><BookOpenText size={20} /></button><button className={`icon-button compact-only ${drawer === "tutor" ? "is-active" : ""}`} type="button" onClick={() => onPanel("tutor")} aria-label="Mở VLearn Tutor"><Robot size={20} /></button><button className="icon-button" type="button" onClick={onTheme} aria-label="Đổi giao diện">{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}</button><span className="avatar" aria-label="Sinh viên ẩn danh">AN</span></div></header>; }
function Materials({ source, files, collapsed, drawerOpen, onToggle, onSelect }: { source: SlideCatalogEntry; files: SlideCatalogEntry[]; collapsed: boolean; drawerOpen: boolean; onToggle: () => void; onSelect: (name: string) => void }) { return <aside className={`materials-panel ${collapsed ? "is-collapsed" : ""} ${drawerOpen ? "is-drawer-open" : ""}`} aria-label="Học liệu"><div className="panel-title">{!collapsed && <><span className="panel-icon"><BookOpenText size={20} /></span><div><h2>Học liệu</h2><p>Slide của buổi học</p></div></>}<button className="panel-toggle" data-close={drawerOpen ? "materials" : undefined} type="button" onClick={onToggle} aria-label={drawerOpen ? "Đóng học liệu" : collapsed ? "Mở học liệu" : "Thu gọn học liệu"}>{drawerOpen ? <X size={18} /> : collapsed ? <CaretRight size={18} /> : <CaretLeft size={18} />}</button></div>{!collapsed && <div className="file-list">{files.map((file) => <button key={file.relativePath} type="button" className={`file-item ${file.fileName === source.fileName ? "is-current" : ""}`} onClick={() => onSelect(file.fileName)}><FilePdf size={20} /><span><strong>{file.fileName}</strong><small>{file.pageCount} trang · {bytes(file.sizeBytes)}</small></span>{file.fileName === source.fileName && <Check size={18} />}</button>)}</div>}</aside>; }
function Tutor({ state, source, collapsed, drawerOpen, onToggle, onGenerate, onPatch, onReview }: { state: DemoState; source: SlideCatalogEntry; collapsed: boolean; drawerOpen: boolean; onToggle: () => void; onGenerate: () => void; onPatch: (value: Partial<DemoState>) => void; onReview: (attempt: QuizAttempt) => void }) {
  const [isTyping, setIsTyping] = useState(false);
  const send = async () => {
    const text = state.tutorDraft.trim();
    if (!text) return onPatch({ notice: "Hãy nhập câu hỏi trước khi gửi." });

    const studentMessage: TutorMessage = { id: `student-${Date.now()}`, role: "student", text };
    onPatch({ tutorDraft: "", tutorMessages: [...state.tutorMessages, studentMessage] });
    setIsTyping(true);

    try {
      const history = state.tutorMessages.slice(1).map(msg => ({ role: msg.role === "student" ? "user" : "assistant", content: msg.text }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sourceFileName: source.fileName, history }),
      });

      if (!response.ok) throw new Error("Chat API failed");

      const data = await response.json();
      const tutorMessage: TutorMessage = { id: `tutor-${Date.now()}`, role: "tutor", text: data.reply || "Xin lỗi, tôi không thể trả lời lúc này." };
      onPatch({ tutorMessages: [...state.tutorMessages, studentMessage, tutorMessage] });
    } catch (error) {
      const errorMessage: TutorMessage = { id: `tutor-${Date.now()}`, role: "tutor", text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." };
      onPatch({ tutorMessages: [...state.tutorMessages, studentMessage, errorMessage] });
    } finally {
      setIsTyping(false);
    }
  };

  return <aside className={`tutor-panel ${collapsed ? "is-collapsed" : ""} ${drawerOpen ? "is-drawer-open" : ""}`} aria-label="VLearn Tutor"><div className="panel-title">{!collapsed && <><span className="panel-icon panel-icon-tutor"><Robot size={20} /></span><div><h2>VLearn Tutor</h2><p><i /> Sẵn sàng hỗ trợ</p></div></>}<button className="panel-toggle" data-close={drawerOpen ? "tutor" : undefined} type="button" onClick={onToggle} aria-label={drawerOpen ? "Đóng VLearn Tutor" : collapsed ? "Mở VLearn Tutor" : "Thu gọn VLearn Tutor"}>{drawerOpen ? <X size={18} /> : collapsed ? <CaretLeft size={18} /> : <CaretRight size={18} />}</button></div>{!collapsed && <><section className="study-card"><div><Sparkle size={20} /><strong>Tự kiểm tra bài học</strong></div><button className="primary-button study-card-trigger" type="button" onClick={() => onPatch({ studyCardExpanded: true })}>Tạo Quiz</button></section>{state.quizAttempts.length ? <section className="attempts"><h3>Lần ôn gần đây</h3>{state.quizAttempts.map((item) => <button key={item.id} type="button" onClick={() => onReview(item)}><span><strong>{item.score}/{item.total} câu đúng</strong><small>{item.completedAtLabel} · {item.sourceFileName}</small></span><CaretRight size={18} /></button>)}</section> : null}<div className="chat"><div className="chat-log" aria-live="polite">{state.tutorMessages.map((message) => <p className={message.role === "student" ? "from-student" : ""} key={message.id}>{message.text}</p>)}{isTyping && <p className="typing-indicator">Đang suy nghĩ...</p>}</div><div className="chat-input"><input value={state.tutorDraft} onChange={(event) => onPatch({ tutorDraft: event.target.value })} onKeyDown={(event) => event.key === "Enter" && !isTyping && send()} placeholder="Hỏi về slide này..." aria-label="Câu hỏi cho VLearn Tutor" disabled={isTyping} /><button type="button" onClick={send} aria-label="Gửi câu hỏi" disabled={isTyping}><PaperPlaneRight size={18} /></button></div></div></>}</aside>;
}
function Reader({ state, source, sourceUrl, onPatch }: { state: DemoState; source: SlideCatalogEntry; sourceUrl: string; onPatch: (value: Partial<DemoState>) => void }) { const url = `${sourceUrl}#page=${state.currentPage}&zoom=${state.zoom}`; return <section className="reader"><div className="reader-toolbar"><div><span>Đang học</span><strong>{source.fileName}</strong></div><div className="toolbar-actions"><button className="icon-button" type="button" onClick={() => onPatch({ zoom: Math.max(70, state.zoom - 10) })} aria-label="Thu nhỏ"><Minus size={18} /></button><strong>{state.zoom}%</strong><button className="icon-button" type="button" onClick={() => onPatch({ zoom: Math.min(150, state.zoom + 10) })} aria-label="Phóng to"><Plus size={18} /></button><button className="icon-button" type="button" onClick={() => onPatch({ zoom: 90 })} aria-label="Vừa trang"><CornersOut size={18} /></button><a className="icon-button" href={sourceUrl} download={source.fileName} aria-label="Tải học liệu"><DownloadSimple size={18} /></a></div></div><div className="pdf-frame"><iframe key={url} src={url} title={`Slide ${state.currentPage} của ${source.fileName}`} /></div><div className="reader-footer"><button type="button" onClick={() => onPatch({ currentPage: Math.max(1, state.currentPage - 1) })} disabled={state.currentPage <= 1}><CaretLeft size={18} />Trang trước</button><span>Trang <strong>{state.currentPage}</strong> / {source.pageCount}</span><button type="button" onClick={() => onPatch({ currentPage: Math.min(source.pageCount, state.currentPage + 1) })} disabled={state.currentPage >= source.pageCount}>Trang sau<CaretRight size={18} /></button></div></section>; }
function Flow({
  state,
  source,
  onAnswer,
  onSubmitAnswer,
  onMove,
  onBack,
  onGenerate,
  onComplete,
  onRetake,
  onFlag,
  onOpenConfig,
}: {
  state: DemoState;
  source: SlideCatalogEntry;
  onAnswer: (id: string, value: string) => void;
  onSubmitAnswer: (id: string) => void;
  onMove: (amount: number) => void;
  onBack: (page?: number) => void;
  onGenerate: () => void;
  onComplete: () => void;
  onRetake: () => void;
  onFlag: (id: string, reason: string) => void;
  onOpenConfig: () => void;
}) {
  if (state.screen === "processing") {
    const steps = ["Đang đọc slide", "Đang áp dụng yêu cầu", "Đang kiểm tra căn cứ"];
    return (
      <section className="flow processing" aria-live="polite" aria-busy="true">
        <span className="flow-kicker">Đang chuẩn bị</span>
        <h1>Tạo câu hỏi từ học liệu</h1>
        <p>
          VLearn đang dùng nội dung trong {source.fileName}
          {state.learnerIntent.trim() ? ` và áp dụng yêu cầu: “${state.learnerIntent.trim()}”` : ""}.
        </p>
        <div className="steps">
          {steps.map((item, index) => {
            const active = index === state.processingStage;
            const done = index < state.processingStage;
            return (
              <div className={active ? "active" : done ? "done" : ""} key={item}>
                <span aria-hidden="true">
                  {done ? (
                    <Check size={16} />
                  ) : active ? (
                    <CircleNotch className="processing-spinner" size={16} />
                  ) : (
                    index + 1
                  )}
                </span>
                <strong>{item}</strong>
                {active && <small>Đang xử lý</small>}
              </div>
            );
          })}
        </div>
        <button className="secondary-button" type="button" onClick={() => onBack()}>
          Hủy
        </button>
      </section>
    );
  }

  if (state.screen === "quiz") {
    const question = state.generatedQuestions[state.currentQuestionIndex];
    if (!question) return null;
    const selected = state.answers[question.id];
    const submitted = Boolean(state.submittedQuestions[question.id]);
    const last = state.currentQuestionIndex === state.generatedQuestions.length - 1;
    return (
      <Quiz
        question={question}
        index={state.currentQuestionIndex}
        total={state.generatedQuestions.length}
        selected={selected}
        submitted={submitted}
        onAnswer={onAnswer}
        onSubmit={() => onSubmitAnswer(question.id)}
        onPrevious={() => onMove(-1)}
        onNext={() => (last ? onComplete() : onMove(1))}
      />
    );
  }

  if (state.screen === "review") return <ReviewWithRetake state={state} source={source} onBack={onBack} onRetake={onRetake} onFlag={onFlag} />;

  if (state.screen === "rejected") {
    return (
      <section className="flow empty rejected">
        <span className="flow-kicker">Yêu cầu không hợp lệ</span>
        <h1>Prompt cần bám vào học liệu</h1>
        <p>{state.errorMessage}</p>
        <div>
          <button className="secondary-button" type="button" onClick={() => onBack()}>
            Quay lại học liệu
          </button>
          <button className="primary-button" type="button" onClick={onOpenConfig}>
            Chỉnh yêu cầu
          </button>
        </div>
      </section>
    );
  }

  const insufficient = state.screen === "insufficient";
  return (
    <section className="flow empty">
      <span className="flow-kicker">{insufficient ? "Chưa đủ căn cứ" : "Chưa hoàn tất"}</span>
      <h1>{insufficient ? "Chưa đủ nội dung để tạo câu hỏi" : "Không thể tạo câu hỏi lúc này"}</h1>
      <p>{state.errorMessage}</p>
      <div>
        <button className="secondary-button" type="button" onClick={() => onBack()}>
          Quay lại học liệu
        </button>
        {!insufficient && (
          <button className="primary-button" type="button" onClick={onGenerate}>
            Thử lại
          </button>
        )}
      </div>
    </section>
  );
}
function Quiz({
  question,
  index,
  total,
  selected,
  submitted,
  onAnswer,
  onSubmit,
  onPrevious,
  onNext,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  selected?: string;
  submitted: boolean;
  onAnswer: (id: string, value: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);
  const isCorrect = selected === question.correctChoiceId;

  return (
    <section className="flow quiz-flow">
      <div className="quiz-progress"><span>Tự kiểm tra</span><strong>Câu {index + 1} / {total}</strong></div>
      <span className="flow-kicker">Nhớ lại ý chính</span>
      <h1>{question.prompt}</h1>
      <fieldset disabled={submitted}>
        <legend className="sr-only">Chọn một đáp án</legend>
        {question.choices.map((choice, choiceIndex) => {
          const classes = [
            selected === choice.id ? "selected" : "",
            submitted && choice.id === question.correctChoiceId ? "is-correct" : "",
            submitted && selected === choice.id && !isCorrect ? "is-incorrect" : "",
          ].filter(Boolean).join(" ");

          return (
            <label className={classes} key={choice.id}>
              <input type="radio" name="answer" checked={selected === choice.id} onChange={() => onAnswer(question.id, choice.id)} />
              <span>{String.fromCharCode(65 + choiceIndex)}</span>
              {choice.label}
            </label>
          );
        })}
      </fieldset>
      {submitted && (
        <div className={`answer-feedback ${isCorrect ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite">
          <strong>{isCorrect ? <CheckCircle size={20} /> : <X size={20} />}{isCorrect ? "Chính xác" : "Chưa chính xác"}</strong>
          <p><b>Đáp án đúng:</b> {correctChoice?.label}</p>
          <p>{question.explanation}</p>
        </div>
      )}
      <div className="flow-actions">
        {index ? <button className="text-button" type="button" onClick={onPrevious}>Câu trước</button> : <span />}
        {!submitted
          ? <button className="primary-button" type="button" disabled={!selected} onClick={onSubmit}>Nộp đáp án</button>
          : <button className="primary-button" type="button" onClick={onNext}>{index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}</button>}
      </div>
    </section>
  );
}
function ReviewWithRetake({ state, source, onBack, onRetake, onFlag }: { state: DemoState; source: SlideCatalogEntry; onBack: (page?: number) => void; onRetake: () => void; onFlag: (id: string, reason: string) => void }) {
  const score = scoreQuiz(state.generatedQuestions, state.answers);
  const priorities = reviewPriorities(state.generatedQuestions, state.answers);

  return (
    <section className="flow review">
      <header>
        <div>
          <span className="flow-kicker">Kết quả tự kiểm tra</span>
          <h1>Bạn nhớ đúng {score}/{state.generatedQuestions.length} câu</h1>
          <p>Đây là kiểm tra nhanh, không phải đánh giá mức độ thành thạo.</p>
        </div>
        <strong>{score}/{state.generatedQuestions.length}</strong>
      </header>
      <aside className="review-assessment">
        <strong>Đánh giá tiếp thu</strong>
        <p>{learningAssessment(score, state.generatedQuestions.length)}</p>
        {priorities.length ? (
          <>
            <h3>Nên ôn lại</h3>
            <ul>
              {priorities.map((item) => (
                <li key={`${item.slide}-${item.excerpt}`}>
                  <b>Slide {item.slide}:</b> {item.excerpt}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="assessment-complete">Bạn đã trả lời đúng toàn bộ câu hỏi trong lần này.</p>
        )}
      </aside>
      {state.generatedQuestions.map((question, index) => {
        const correct = question.choices.find((item) => item.id === question.correctChoiceId);
        const selected = question.choices.find((item) => item.id === state.answers[question.id]);
        const okay = selected?.id === correct?.id;

        return (
          <article className={okay ? "correct" : "incorrect"} key={question.id}>
            <span>{okay ? <CheckCircle size={20} /> : <X size={20} />} Câu {index + 1}</span>
            <h2>{question.prompt}</h2>
            <p><b>Bạn chọn:</b> {selected?.label ?? "Bỏ qua"}</p>
            <p><b>Đáp án:</b> {correct?.label}</p>
            <div>{question.explanation}</div>
            <button className="text-button" type="button" onClick={() => onBack(question.source.pageOrSlide)}>
              Xem nguồn: slide {question.source.pageOrSlide}
            </button>
            {!state.flagged[question.id] && (
              <button className="text-button" type="button" onClick={() => onFlag(question.id, "Câu hỏi chưa rõ")}>
                Báo câu hỏi chưa rõ
              </button>
            )}
          </article>
        );
      })}
      <div className="review-actions">
        <button className="secondary-button" type="button" onClick={onRetake}>
          Làm lại bài
        </button>
        <button className="primary-button" type="button" onClick={() => onBack()}>
          Quay lại học liệu
        </button>
      </div>
    </section>
  );
}
function Review({ state, source, onBack, onRetake, onFlag }: { state: DemoState; source: SlideCatalogEntry; onBack: (page?: number) => void; onRetake: () => void; onFlag: (id: string, reason: string) => void }) {
  const score = scoreQuiz(state.generatedQuestions, state.answers);
  const priorities = reviewPriorities(state.generatedQuestions, state.answers);
  return <section className="flow review"><header><div><span className="flow-kicker">Kết quả tự kiểm tra</span><h1>Bạn nhớ đúng {score}/{state.generatedQuestions.length} câu</h1><p>Đây là kiểm tra nhanh, không phải đánh giá mức độ thành thạo.</p></div><strong>{score}/{state.generatedQuestions.length}</strong></header><aside className="review-assessment"><strong>Đánh giá tiếp thu</strong><p>{learningAssessment(score, state.generatedQuestions.length)}</p>{priorities.length ? <><h3>Nên ôn lại</h3><ul>{priorities.map((item) => <li key={`${item.slide}-${item.excerpt}`}><b>Slide {item.slide}:</b> {item.excerpt}</li>)}</ul></> : <p className="assessment-complete">Bạn đã trả lời đúng toàn bộ câu hỏi trong lần này.</p>}</aside>{state.generatedQuestions.map((question, index) => { const correct = question.choices.find((item) => item.id === question.correctChoiceId); const selected = question.choices.find((item) => item.id === state.answers[question.id]); const okay = selected?.id === correct?.id; return <article className={okay ? "correct" : "incorrect"} key={question.id}><span>{okay ? <CheckCircle size={20} /> : <X size={20} />} Câu {index + 1}</span><h2>{question.prompt}</h2><p><b>Bạn chọn:</b> {selected?.label ?? "Bỏ qua"}</p><p><b>Đáp án:</b> {correct?.label}</p><div>{question.explanation}</div><button className="text-button" type="button" onClick={() => onBack(question.source.pageOrSlide)}>Xem nguồn: slide {question.source.pageOrSlide}</button>{!state.flagged[question.id] && <button className="text-button" type="button" onClick={() => onFlag(question.id, "Câu hỏi chưa rõ")}>Báo câu hỏi chưa rõ</button>}</article>; })}<button className="primary-button" type="button" onClick={() => onBack()}>Quay lại học liệu</button></section>;
}
function QuizConfigModal({ state, onClose, onCreate, onPatch }: { state: DemoState; onClose: () => void; onCreate: () => void; onPatch: (value: Partial<DemoState>) => void }) {
  type QuizQuantity = "few" | "standard" | "custom";
  const [quantity, setQuantity] = useState<QuizQuantity>("standard");
  const quantityMap: Record<QuizQuantity, number> = { few: 3, standard: 5, custom: state.quizQuestionCount };
  const difficulties: Array<{ value: QuizDifficulty; label: string; hint: string }> = [
    { value: "easy", label: "Dễ", hint: "Nhận biết trực tiếp từ slide." },
    { value: "medium", label: "Trung Bình", hint: "Hiểu ý chính và phân biệt nhẹ." },
    { value: "hard", label: "Khó", hint: "Vận dụng hoặc so sánh, vẫn bám nguồn." },
  ];
  const applyQuantity = (q: QuizQuantity) => { setQuantity(q); if (q !== "custom") onPatch({ quizQuestionCount: quantityMap[q] }); };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="quiz-config-modal" role="dialog" aria-labelledby="modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        <div className="modal-header"><Sparkle size={24} /><h2 id="modal-title">Tạo quiz mới</h2></div>
        <div className="modal-body">
          <section className="config-section">
            <h3>Số câu hỏi</h3>
            <div className="config-toggle">
              <button className={quantity === "few" ? "active" : ""} type="button" onClick={() => applyQuantity("few")}>Ít hơn</button>
              <button className={quantity === "standard" ? "active" : ""} type="button" onClick={() => applyQuantity("standard")}>Tiêu chuẩn</button>
              <button className={quantity === "custom" ? "active" : ""} type="button" onClick={() => applyQuantity("custom")}>Tùy chọn</button>
            </div>
            {quantity === "custom" && <input type="number" min="1" max="20" value={state.quizQuestionCount} onChange={(e) => onPatch({ quizQuestionCount: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })} />}
          </section>
          <section className="config-section">
            <h3>Độ khó</h3>
            <div className="config-toggle difficulty-toggle">
              {difficulties.map((item) => (
                <button
                  className={state.quizDifficulty === item.value ? "active" : ""}
                  type="button"
                  key={item.value}
                  onClick={() => onPatch({ quizDifficulty: item.value })}
                >
                  <span>{item.label}</span>
                  <small>{item.hint}</small>
                </button>
              ))}
            </div>
          </section>
          <section className="config-section">
            <h3>Nguồn</h3>
            <select value="current" disabled><option value="current">Học liệu đang mở</option></select>
          </section>
          <section className="config-section">
            <h3>Yêu cầu riêng cho quiz</h3>
            <textarea value={state.learnerIntent} maxLength={1000} onChange={(e) => onPatch({ learnerIntent: e.target.value })} placeholder="Ví dụ: Tập trung vào công thức JTBD, hỏi ở mức vận dụng và ưu tiên ví dụ có trong slide." rows={4} aria-describedby="quiz-instructions-help" />
            <p className="modal-hint" id="quiz-instructions-help">Yêu cầu phải bám vào học liệu hoặc cách hỏi học tập; prompt lạc đề sẽ được từ chối.</p>
          </section>
        </div>
        <button className="primary-button modal-create" type="button" onClick={onCreate} disabled={state.screen === "processing"}>Tạo quiz mới</button>
      </div>
    </>
  );
}
