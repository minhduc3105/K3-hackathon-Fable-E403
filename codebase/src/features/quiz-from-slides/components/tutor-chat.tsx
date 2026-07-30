"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileText,
  GraduationCap,
  Loader2,
  Maximize2,
  Minimize2,
  Paperclip,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { InlineQuizCard } from "./inline-quiz-card";
import { generateQuizFromSlides } from "../api/client";
import type { GenerateQuizResult } from "../model/quiz.types";

type Stage = "upload" | "processing" | "quiz" | "insufficient" | "failure";
const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = [".pdf", ".ppt", ".pptx"];

export function TutorChat() {
  const [open, setOpen] = useState(true);
  const [compact, setCompact] = useState(false);
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<GenerateQuizResult | null>(null);
  const [reported, setReported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage !== "processing" || !file) return;
    const controller = new AbortController();
    const timers = [
      window.setTimeout(() => setProcessingStep(1), 500),
      window.setTimeout(() => setProcessingStep(2), 1300),
    ];
    generateQuizFromSlides(file, controller.signal)
      .then((next) => {
        setResult(next);
        setStage(
          next.status === "ready"
            ? "quiz"
            : next.status === "insufficient_content"
              ? "insufficient"
              : "failure",
        );
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setResult({ status: "generation_failed", retryable: true });
        setStage("failure");
      });
    return () => {
      controller.abort();
      timers.forEach(window.clearTimeout);
    };
  }, [stage, file]);

  const chooseFile = (next: File | undefined) => {
    if (!next) return;
    const extension = next.name.slice(next.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED.includes(extension)) {
      setFile(null);
      setError("Định dạng chưa được hỗ trợ. Hãy chọn tệp PDF, PPT hoặc PPTX.");
      return;
    }
    if (next.size === 0 || next.size > MAX_SIZE) {
      setFile(null);
      setError(next.size === 0 ? "Tệp đang trống." : "Tệp vượt quá giới hạn 20 MB.");
      return;
    }
    setError("");
    setFile(next);
  };

  const reset = () => {
    setStage("upload");
    setFile(null);
    setResult(null);
    setError("");
    setProcessingStep(0);
    setReported(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex min-h-12 items-center gap-3 rounded-xl bg-brand-800 px-4 text-sm font-bold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-white/12">
          <GraduationCap className="h-4 w-4" />
          {(file || result) && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-brand-800 bg-success" />
          )}
        </span>
        Mở AI Tutor
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label="VLearn AI Tutor"
      className={`fixed bottom-4 right-4 z-40 flex overflow-hidden rounded-xl border border-line bg-surface shadow-pop transition-[width,height] duration-200 max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:rounded-none ${
        compact
          ? "h-16 w-[25rem] max-sm:inset-auto max-sm:bottom-3 max-sm:right-3 max-sm:h-16 max-sm:w-[calc(100%-1.5rem)] max-sm:rounded-xl"
          : "h-[min(720px,calc(100dvh-88px))] w-[27rem] max-w-[calc(100vw-2rem)] flex-col"
      }`}
    >
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-brand-800 px-4 text-white">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/12">
          <Sparkles className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold">VLearn AI Tutor</h2>
          <p className="flex items-center gap-1.5 text-[11px] text-white/65">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Đồng hành cùng bài học
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCompact((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label={compact ? "Mở rộng cửa sổ" : "Thu gọn cửa sổ"}
          >
            {compact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Ẩn AI Tutor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {!compact && (
        <div className="scroll-slim flex min-h-0 flex-1 flex-col overflow-y-auto">
          {stage === "upload" && (
            <UploadPanel
              file={file}
              error={error}
              inputRef={inputRef}
              onInput={(event) => chooseFile(event.target.files?.[0])}
              onDrop={(event) => {
                event.preventDefault();
                chooseFile(event.dataTransfer.files?.[0]);
              }}
              onRemove={() => {
                setFile(null);
                setError("");
              }}
              onGenerate={() => {
                if (!file) {
                  setError("Hãy chọn slide bài học trước khi tạo câu hỏi.");
                  inputRef.current?.focus();
                  return;
                }
                setProcessingStep(0);
                setStage("processing");
              }}
            />
          )}

          {stage === "processing" && file && (
            <ProcessingPanel
              filename={file.name}
              current={processingStep}
              onCancel={reset}
            />
          )}

          {stage === "quiz" && result?.status === "ready" && (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3 border-b border-line pb-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-800">Bộ câu hỏi đã sẵn sàng</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    Tạo từ <strong className="font-semibold text-slate-700">{file?.name}</strong>
                  </p>
                </div>
              </div>
              <InlineQuizCard
                quizId={result.quizId}
                questions={result.questions}
                onReport={() => setReported(true)}
              />
              {reported && (
                <p role="status" className="rounded-lg bg-accent-soft p-3 text-xs leading-relaxed text-brand-700">
                  Đã ghi nhận phản hồi. Bạn vẫn có thể tiếp tục xem lại các câu khác.
                </p>
              )}
              <button type="button" onClick={reset} className="min-h-11 text-xs font-semibold text-slate-500 hover:text-accent">
                Tạo bộ câu hỏi từ tệp khác
              </button>
            </div>
          )}

          {stage === "insufficient" && result?.status === "insufficient_content" && (
            <StatePanel
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Chưa đủ nội dung để tạo câu hỏi"
              description={result.reason}
            >
              <ul className="space-y-2 rounded-lg bg-surface-muted p-3">
                {result.suggestions.map((suggestion) => (
                  <li key={suggestion} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    {suggestion}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={reset} className="mt-5 min-h-11 w-full rounded-md bg-accent px-4 text-sm font-bold text-white hover:bg-accent-hover">
                Chọn tệp khác
              </button>
            </StatePanel>
          )}

          {stage === "failure" && (
            <StatePanel
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Không thể đọc tệp này"
              description="Tệp có thể bị hỏng hoặc quá trình trích xuất bị gián đoạn. Tệp đã chọn vẫn được giữ để bạn thử lại."
            >
              <button
                type="button"
                onClick={() => {
                  setProcessingStep(0);
                  setStage("processing");
                }}
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-bold text-white hover:bg-accent-hover"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </button>
              <button type="button" onClick={reset} className="mt-2 min-h-11 w-full text-xs font-semibold text-slate-500 hover:text-accent">
                Chọn tệp khác
              </button>
            </StatePanel>
          )}
        </div>
      )}
    </section>
  );
}

function UploadPanel({
  file,
  error,
  inputRef,
  onInput,
  onDrop,
  onRemove,
  onGenerate,
}: {
  file: File | null;
  error: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onRemove: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col p-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">Tự kiểm tra bài học</p>
        <h3 className="mt-2 text-xl font-black tracking-tight text-brand-900">Biến slide thành bộ câu hỏi</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Tải tài liệu bạn vừa học. Tutor chỉ dùng nội dung trong tệp để tạo câu hỏi trắc nghiệm.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={onInput}
        className="sr-only"
        aria-describedby={error ? "upload-error" : "upload-help"}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="group mt-5 flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-surface-muted px-6 text-center transition hover:border-accent hover:bg-accent-soft/50"
        >
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-accent shadow-panel transition group-hover:-translate-y-0.5">
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-bold text-brand-800">Chọn hoặc thả slide vào đây</span>
          <span id="upload-help" className="mt-1 text-xs text-slate-500">PDF, PPT, PPTX · tối đa 20 MB</span>
        </button>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-accent/25 bg-accent-soft/55 p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-accent shadow-panel">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-800" title={file.name}>{file.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{formatBytes(file.size)} · Sẵn sàng tải lên</p>
          </div>
          <button type="button" onClick={onRemove} aria-label="Bỏ tệp đã chọn" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && <p id="upload-error" role="alert" className="mt-3 text-xs font-medium leading-relaxed text-error">{error}</p>}

      <div className="mt-auto pt-6">
        <div className="mb-4 flex items-start gap-2 border-t border-line pt-4 text-xs leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Tệp chỉ được dùng để tạo bộ câu hỏi và không được lưu sau phiên học.
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!file}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-hover active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <Sparkles className="h-4 w-4" />
          Tạo câu hỏi
        </button>
      </div>
    </div>
  );
}

function ProcessingPanel({ filename, current, onCancel }: { filename: string; current: number; onCancel: () => void }) {
  const steps = ["Đang tải tệp lên", "Đang đọc nội dung slide", "Đang tạo câu hỏi có căn cứ"];
  return (
    <div className="flex flex-1 flex-col p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">Đang xử lý</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-brand-900">Chuẩn bị bài kiểm tra</h3>
          <p className="mt-1 max-w-full truncate text-xs text-slate-500" title={filename}>{filename}</p>
        </div>
        <Loader2 className="mt-1 h-5 w-5 animate-spin text-accent" />
      </div>

      <ol className="mt-8 space-y-1">
        {steps.map((step, index) => (
          <li key={step} className={`flex min-h-14 items-center gap-3 border-l-2 pl-4 ${index <= current ? "border-accent" : "border-line"}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index < current ? "bg-success text-white" : index === current ? "bg-accent text-white" : "bg-surface-muted text-slate-400"}`}>
              {index < current ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className={`text-sm ${index === current ? "font-bold text-brand-800" : "text-slate-500"}`}>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto rounded-lg bg-surface-muted p-3 text-xs leading-relaxed text-slate-500">
        Tutor sẽ dừng nếu nội dung quá ít hoặc không đủ rõ để tạo câu hỏi chính xác.
      </div>
      <button type="button" onClick={onCancel} className="mt-3 min-h-11 w-full text-sm font-semibold text-slate-500 hover:text-error">Hủy xử lý</button>
    </div>
  );
}

function StatePanel({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col p-5">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-50 text-warning">{icon}</span>
      <h3 className="mt-4 text-xl font-black tracking-tight text-brand-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
