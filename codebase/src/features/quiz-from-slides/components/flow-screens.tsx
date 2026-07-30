import {
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  CornersOut,
  DownloadSimple,
  Minus,
  Plus,
} from "@phosphor-icons/react";
import type { DemoState, LessonMaterial, SlideCatalogEntry } from "../model/types";
import { scoreQuiz } from "../model/quiz-machine";

type LessonScreenProps = {
  state: DemoState;
  sourceFile: SlideCatalogEntry;
  sourceUrl: string;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitPage: () => void;
  onDownloadMaterial: () => void;
  onOpenMaterialWindow: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

function ReaderToolbar(props: Pick<LessonScreenProps, "state" | "sourceFile" | "onZoomOut" | "onZoomIn" | "onFitPage" | "onDownloadMaterial" | "onOpenMaterialWindow">) {
  return (
    <div className="reader-toolbar">
      <span className="reader-file-label" title={props.sourceFile.fileName}>{props.sourceFile.fileName}</span>
      <span className="toolbar-divider" />
      <button className="zoom-button" type="button" onClick={props.onZoomOut} aria-label="Thu nhỏ"><Minus size={16} /></button>
      <strong className="reader-zoom-value">{props.state.zoom}%</strong>
      <button className="zoom-button" type="button" onClick={props.onZoomIn} aria-label="Phóng to"><Plus size={16} /></button>
      <button className="zoom-button" type="button" onClick={props.onFitPage} aria-label="Vừa trang"><CornersOut size={16} /></button>
      <button className="zoom-button" type="button" onClick={props.onDownloadMaterial} aria-label="Tải học liệu"><DownloadSimple size={16} /></button>
      <button className="zoom-button" type="button" onClick={props.onOpenMaterialWindow} aria-label="Mở học liệu ở tab mới"><ArrowSquareOut size={16} /></button>
    </div>
  );
}

export function LessonScreen(props: LessonScreenProps) {
  const pdfUrl = `${props.sourceUrl}#page=${props.state.currentPage}&zoom=${props.state.zoom}`;

  return (
    <section className="lesson-stage">
      <section className="reader-stage" aria-label="Slide bài học">
        <ReaderToolbar {...props} />
        <iframe
          key={pdfUrl}
          className="pdf-slide-viewer"
          src={pdfUrl}
          title={`Slide ${props.state.currentPage} của ${props.sourceFile.fileName}`}
        />
        <div className="reader-pagination">
          <button className="zoom-button" type="button" onClick={props.onPreviousPage} aria-label="Trang trước" disabled={props.state.currentPage <= 1}><CaretLeft size={17} /></button>
          <span>Trang {props.state.currentPage} / {props.sourceFile.pageCount}</span>
          <button className="zoom-button" type="button" onClick={props.onNextPage} aria-label="Trang sau" disabled={props.state.currentPage >= props.sourceFile.pageCount}><CaretRight size={17} /></button>
        </div>
      </section>
    </section>
  );
}

type ProcessingScreenProps = {
  state: DemoState;
  sourceFileName: string;
  onCancelProcessing: () => void;
};

export function ProcessingScreen({ state, sourceFileName, onCancelProcessing }: ProcessingScreenProps) {
  const stages = ["Đang chuẩn bị nguồn", "Đang gọi AI", "Đang kiểm tra căn cứ"];

  return (
    <div className="flow-wrap">
      <section className="flow-header">
        <span className="eyebrow">Đang xử lý học liệu hiện tại</span>
        <h1>Chuẩn bị bộ câu hỏi</h1>
        <p>VLearn đang dùng {sourceFileName} làm nguồn duy nhất để tạo {state.quizQuestionCount} câu.</p>
      </section>
      <section className="flow-panel status-panel" aria-live="polite">
        <div>
          <span className="file-icon">AI</span>
          <h2>{stages[state.processingStage]}</h2>
          <p>Không cần upload lại file. Nguồn và số trang được giữ trong phần review.</p>
          <div className="status-steps">
            {stages.map((stage, index) => (
              <div className={`status-step ${index < state.processingStage ? "is-complete" : index === state.processingStage ? "is-active" : ""}`} key={stage}>
                <span className="step-mark">{index < state.processingStage ? "✓" : index === state.processingStage ? "..." : ""}</span>
                <span>{stage}</span>
              </div>
            ))}
          </div>
          <div className="action-row"><button className="secondary-button" type="button" onClick={onCancelProcessing}>Hủy</button></div>
        </div>
      </section>
    </div>
  );
}

type QuizScreenProps = {
  state: DemoState;
  sourceFileName: string;
  onSelectAnswer: (value: string) => void;
  onPreviousQuestion: () => void;
  onSkipQuestion: () => void;
  onNextQuestion: () => void;
};

export function QuizScreen({ state, sourceFileName, onSelectAnswer, onPreviousQuestion, onSkipQuestion, onNextQuestion }: QuizScreenProps) {
  const quizQuestions = state.generatedQuestions;
  const question = quizQuestions[state.currentQuestionIndex];
  if (!question) {
    return <SimpleEmptyScreen notice="Chưa có câu hỏi" title="Không thể mở bài kiểm tra" body="Bộ câu hỏi chưa được tạo hoặc không vượt qua kiểm tra căn cứ." />;
  }
  const selectedAnswer = state.answers[question.id] || "";
  const isLast = state.currentQuestionIndex === quizQuestions.length - 1;

  return (
    <div className="quiz-shell">
      <div className="progress-row"><span>{sourceFileName}</span><strong>Câu {state.currentQuestionIndex + 1} / {quizQuestions.length}</strong></div>
      <section className="question-card">
        <div className="question-heading">
          <div><span className="eyebrow">Nhớ lại ý chính</span><h1>{question.prompt}</h1></div>
          <span className="question-number">Q{String(state.currentQuestionIndex + 1).padStart(2, "0")}</span>
        </div>
        <fieldset className="choice-list">
          <legend className="sr-only">Chọn một đáp án</legend>
          {question.choices.map((choice, index) => (
            <label className={`choice ${selectedAnswer === choice.id ? "is-selected" : ""}`} key={choice.id}>
              <input type="radio" name="answer" value={choice.id} checked={selectedAnswer === choice.id} onChange={(event) => onSelectAnswer(event.target.value)} />
              <span className="choice-key">{String.fromCharCode(65 + index)}</span>
              <span className="choice-label">{choice.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="question-footer">
          <div className="quiz-secondary-actions">
            {state.currentQuestionIndex > 0 ? <button className="text-button" type="button" onClick={onPreviousQuestion}>Câu trước</button> : null}
            <button className="text-button" type="button" onClick={onSkipQuestion}>Bỏ qua</button>
          </div>
          <button className="primary-button" type="button" onClick={onNextQuestion} disabled={!selectedAnswer}>{isLast ? "Nộp bài" : "Tiếp tục"}</button>
        </div>
      </section>
    </div>
  );
}

type ReviewScreenProps = {
  state: DemoState;
  sourceFileName: string;
  onRetryQuiz: () => void;
  onBackToLesson: () => void;
  onOpenFeedback: (questionId: string) => void;
  onFlagFeedback: (questionId: string, reason: string) => void;
  onJumpToSource: (page: number) => void;
};

export function ReviewScreen({ state, sourceFileName, onRetryQuiz, onBackToLesson, onOpenFeedback, onFlagFeedback, onJumpToSource }: ReviewScreenProps) {
  const quizQuestions = state.generatedQuestions;
  const score = scoreQuiz(quizQuestions, state.answers);
  return (
    <div className="flow-wrap">
      <section className="review-header">
        <div><span className="eyebrow">Kết quả kiểm tra nhanh</span><h1>Bạn nhớ đúng {score}/{quizQuestions.length} câu</h1><p>Quiz dùng {sourceFileName} làm nguồn. Đây là bước tự kiểm tra, không phải đánh giá mức độ thành thạo.</p></div>
        <div className="review-score"><strong>{score}/{quizQuestions.length}</strong><span>câu đúng</span></div>
      </section>
      <div className="review-list">
        {quizQuestions.map((question, index) => {
          const selected = question.choices.find((choice) => choice.id === state.answers[question.id]);
          const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
          const isCorrect = state.answers[question.id] === question.correctChoiceId;
          const feedback = state.flagged[question.id] ? <p className="muted-caption" role="status">Đã ghi nhận phản hồi cho câu hỏi này.</p> : state.feedbackOpenFor === question.id ? (
            <div className="feedback-box"><p>Điều gì chưa ổn?</p><div className="feedback-options">
              <button className="feedback-option" type="button" onClick={() => onFlagFeedback(question.id, "Không có trong slide")}>Không có trong slide</button>
              <button className="feedback-option" type="button" onClick={() => onFlagFeedback(question.id, "Đáp án chưa rõ")}>Đáp án chưa rõ</button>
              <button className="feedback-option" type="button" onClick={() => onFlagFeedback(question.id, "Câu hỏi khó hiểu")}>Câu hỏi khó hiểu</button>
            </div></div>
          ) : <button className="text-button" type="button" onClick={() => onOpenFeedback(question.id)}>Câu hỏi chưa chính xác</button>;

          return <article className={`review-item ${isCorrect ? "is-correct" : "is-incorrect"}`} key={question.id}>
            <h2>{index + 1}. {question.prompt}</h2>
            <div className="answer-summary"><span>Bạn chọn: <strong>{selected ? selected.label : "Bỏ qua"}</strong></span><span>Đáp án đúng: <strong>{correct?.label}</strong></span></div>
            <div className="explanation">{question.explanation}</div>
            <button className="source-link" type="button" onClick={() => onJumpToSource(question.source.pageOrSlide)}>Nguồn: {sourceFileName} · slide {question.source.pageOrSlide}</button>
            <p className="source-excerpt">{question.source.excerpt}</p><div className="feedback-actions">{feedback}</div>
          </article>;
        })}
      </div>
      <div className="action-row"><button className="secondary-button" type="button" onClick={onRetryQuiz}>Làm lại</button><button className="primary-button" type="button" onClick={onBackToLesson}>Quay lại học liệu</button></div>
    </div>
  );
}

type EmptyScreenProps = { title: string; body: string; notice: string; actionLabel?: string; onAction?: () => void };

export function SimpleEmptyScreen({ title, body, notice, actionLabel, onAction }: EmptyScreenProps) {
  return <div className="flow-wrap"><section className="flow-header"><span className="eyebrow">{notice}</span><h1>{title}</h1><p>{body}</p></section>{actionLabel && onAction ? <div className="action-row"><button className="primary-button" type="button" onClick={onAction}>{actionLabel}</button></div> : null}</div>;
}
