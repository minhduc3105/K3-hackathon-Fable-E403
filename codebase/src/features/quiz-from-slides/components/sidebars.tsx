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
  return (
    <aside className={`lesson-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="Học liệu buổi học">
      <div className="materials-heading">
        <span className="materials-icon" aria-hidden="true">▣</span>
        <div>
          <h2>Học liệu môn học</h2>
          <p>Slide PDF của buổi đang học</p>
        </div>
        <button className="panel-collapse-button" type="button" onClick={onToggleCollapsed} aria-label="Thu gọn học liệu">
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <SourceCatalog files={sourceFiles} activeFileName={activeSourceFile} onSelect={onSelectSourceFile} />
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
  onDismissNotice,
  notice,
  collapsed,
  onToggleCollapsed,
}: TutorSidebarProps) {
  return (
    <aside className={`tutor-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="AI Tutor">
      <div className="tutor-heading">
        <div className="tutor-heading-title">
          <span className="tutor-icon" aria-hidden="true">▣</span>
          <div>
            <h2>VLearn Tutor</h2>
            <span><i />Trợ lý học theo ngữ cảnh</span>
          </div>
        </div>
        <div className="tutor-actions">
          <button className="panel-collapse-button" type="button" onClick={onToggleCollapsed} aria-label="Thu gọn VLearn Tutor">
            {collapsed ? "‹" : "›"}
          </button>
          <button className="icon-button" type="button" onClick={onToggleHistory} aria-label="Lịch sử">◷</button>
          <button className="icon-button" type="button" onClick={onNewChat} aria-label="Cuộc hội thoại mới">+</button>
        </div>
      </div>
      <div className="tutor-context">
        <span>Ngữ cảnh: <strong>slide trang {currentPage}</strong></span>
      </div>
      <section className="tutor-quiz-entry" aria-label="Tạo câu hỏi ôn tập">
        <span className="eyebrow">Ôn tập từ học liệu</span>
        <p>{sourceFileName}</p>
        <button className="primary-button" type="button" onClick={onStartQuizGeneration}>Tạo câu hỏi ôn tập</button>
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
        <button type="button" onClick={onSendTutor} aria-label="Gửi câu hỏi">➤</button>
      </div>
      {notice ? (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Đóng thông báo" onClick={onDismissNotice}>×</button>
        </div>
      ) : null}
    </aside>
  );
}
