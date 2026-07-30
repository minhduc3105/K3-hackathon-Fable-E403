import {
  BookOpenText,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
  PaperPlaneRight,
  Plus,
  Robot,
  X,
} from "@phosphor-icons/react";
import type { DemoState, SlideCatalogEntry, TutorMessage } from "../model/types";
import { SourceCatalog } from "./source-catalog";

type LessonSidebarProps = {
  sourceFiles: SlideCatalogEntry[];
  onSelectSourceFile: (fileName: string) => void;
  activeSourceFile?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

type TutorSidebarProps = {
  state: DemoState;
  sourceFileName: string;
  currentPage: number;
  tutorMessages: TutorMessage[];
  tutorDraft: string;
  onToggleHistory: () => void;
  onNewChat: () => void;
  onRestoreChat: (label: string) => void;
  onTutorDraftChange: (value: string) => void;
  onSendTutor: () => void;
  onStartQuizGeneration: () => void;
  onQuestionCountChange: (questionCount: 4 | 6 | 8) => void;
  onDismissNotice: () => void;
  notice: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function LessonSidebar({
  sourceFiles,
  onSelectSourceFile,
  activeSourceFile,
  collapsed,
  onToggleCollapsed,
}: LessonSidebarProps) {
  const lessonPanelId = "lesson-materials-content";

  return (
    <aside className={`lesson-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="Học liệu buổi học">
      <div className="materials-heading">
        {!collapsed ? (
          <>
            <span className="materials-icon" aria-hidden="true"><BookOpenText size={19} weight="duotone" /></span>
            <div>
              <h2>Học liệu môn học</h2>
              <p>Slide PDF của buổi đang học</p>
            </div>
          </>
        ) : null}
        <button
          className="panel-collapse-button"
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Mở rộng học liệu" : "Thu gọn học liệu"}
          aria-expanded={!collapsed}
          aria-controls={lessonPanelId}
          title={collapsed ? "Mở rộng học liệu" : "Thu gọn học liệu"}
        >
          {collapsed ? <CaretRight size={17} /> : <CaretLeft size={17} />}
        </button>
      </div>
      {!collapsed ? (
        <div id={lessonPanelId}>
          <SourceCatalog files={sourceFiles} activeFileName={activeSourceFile} onSelect={onSelectSourceFile} />
        </div>
      ) : null}
    </aside>
  );
}

export function TutorSidebar({
  state,
  sourceFileName,
  currentPage,
  tutorMessages,
  tutorDraft,
  onToggleHistory,
  onNewChat,
  onRestoreChat,
  onTutorDraftChange,
  onSendTutor,
  onStartQuizGeneration,
  onQuestionCountChange,
  onDismissNotice,
  notice,
  collapsed,
  onToggleCollapsed,
}: TutorSidebarProps) {
  const tutorPanelId = "vlearn-tutor-content";

  return (
    <aside className={`tutor-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="AI Tutor">
      <div className="tutor-heading">
        {!collapsed ? (
          <div className="tutor-heading-title">
            <span className="tutor-icon" aria-hidden="true"><Robot size={19} weight="duotone" /></span>
            <div>
              <h2>VLearn Tutor</h2>
              <span><i />Trợ lý học theo ngữ cảnh</span>
            </div>
          </div>
        ) : null}
        <div className="tutor-actions">
          <button
            className="panel-collapse-button"
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Mở rộng VLearn Tutor" : "Thu gọn VLearn Tutor"}
            aria-expanded={!collapsed}
            aria-controls={tutorPanelId}
            title={collapsed ? "Mở rộng VLearn Tutor" : "Thu gọn VLearn Tutor"}
          >
            {collapsed ? <CaretLeft size={17} /> : <CaretRight size={17} />}
          </button>
          {!collapsed ? (
            <>
              <button className="icon-button" type="button" onClick={onToggleHistory} aria-label="Lịch sử"><ClockCounterClockwise size={17} /></button>
              <button className="icon-button" type="button" onClick={onNewChat} aria-label="Cuộc hội thoại mới"><Plus size={17} /></button>
            </>
          ) : null}
        </div>
      </div>
      {!collapsed ? (
        <div id={tutorPanelId} className="tutor-content">
          <div className="tutor-context">
            <span>Ngữ cảnh: <strong>slide trang {currentPage}</strong></span>
          </div>
          <section className="tutor-quiz-entry" aria-label="Tạo câu hỏi ôn tập">
            <span className="eyebrow">Ôn tập từ học liệu</span>
            <p>{sourceFileName}</p>
            <label className="quiz-count-field" htmlFor="quiz-question-count">
              <span>Số câu hỏi</span>
              <select
                id="quiz-question-count"
                value={state.quizQuestionCount}
                onChange={(event) => onQuestionCountChange(Number(event.target.value) as 4 | 6 | 8)}
                disabled={state.screen === "processing"}
              >
                <option value={4}>4 câu</option>
                <option value={6}>6 câu</option>
                <option value={8}>8 câu</option>
              </select>
            </label>
            <button className="primary-button" type="button" onClick={onStartQuizGeneration} disabled={state.screen === "processing"}>
              Tạo {state.quizQuestionCount} câu ôn tập
            </button>
          </section>
          {state.tutorHistoryOpen ? (
            <div className="tutor-history">
              <strong>Lịch sử gần đây</strong>
              <button type="button" onClick={() => onRestoreChat("Risk threshold và tiêu chí ship")}>Risk threshold và tiêu chí ship</button>
              <button type="button" onClick={() => onRestoreChat("Context window của LLM")}>Context window của LLM</button>
            </div>
          ) : null}
          <div className="tutor-messages" aria-live="polite">
            {tutorMessages.map((message) => (
              <div key={message.id} className={`tutor-message ${message.role === "student" ? "is-student" : ""}`}>{message.text}</div>
            ))}
          </div>
          <div className="tutor-input">
            <input
              value={tutorDraft}
              onChange={(event) => onTutorDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSendTutor();
                }
              }}
              placeholder="Nhập câu hỏi về slide đang mở..."
              aria-label="Câu hỏi cho VLearn Tutor"
            />
            <button type="button" onClick={onSendTutor} aria-label="Gửi câu hỏi"><PaperPlaneRight size={17} weight="fill" /></button>
          </div>
          {notice ? (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button type="button" aria-label="Đóng thông báo" onClick={onDismissNotice}><X size={15} /></button>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
