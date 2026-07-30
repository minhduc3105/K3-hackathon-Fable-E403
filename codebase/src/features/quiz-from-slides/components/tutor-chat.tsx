"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  FileText,
} from "lucide-react";
import { InlineQuizCard } from "./inline-quiz-card";
import { getMockQuizResult } from "../fixtures/quiz-scenarios";
import type { GenerateQuizResult } from "../model/quiz.types";

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "tutor"; text: string }
  | { id: string; role: "tutor-loading" }
  | { id: string; role: "quiz"; result: Extract<GenerateQuizResult, { status: "ready" }> }
  | { id: string; role: "insufficient"; reason: string; suggestions: string[] }
  | { id: string; role: "failure"; kind: "extraction" | "generation" };

const SUGGESTIONS = [
  "Tạo câu hỏi trắc nghiệm dựa nội dung slide để ôn tập",
  "Tóm tắt slide này trong 3 ý chính",
  "Giải thích 'tool calling' dễ hiểu hơn",
];

// The document the tutor is grounded on (drives the mock scenario).
const ACTIVE_DOC = "04 – Prompt Engineering.pdf";

let idSeq = 0;
const nextId = () => `m${++idSeq}`;

export function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: "tutor",
      text:
        "Xin chào! Mình là VLearn Tutor, trợ lý học theo ngữ cảnh của slide bạn đang mở. " +
        "Bạn có thể hỏi về nội dung, hoặc nhờ mình tạo câu hỏi trắc nghiệm để ôn tập.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const wantsQuiz = (text: string) => {
    const t = text.toLowerCase();
    return (
      t.includes("trắc nghiệm") ||
      t.includes("câu hỏi") ||
      t.includes("quiz") ||
      t.includes("ôn tập")
    );
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
    setInput("");
    setBusy(true);
    scrollToEnd();

    // Show the tutor "thinking" state.
    const loadingId = nextId();
    setMessages((m) => [...m, { id: loadingId, role: "tutor-loading" }]);
    scrollToEnd();

    setTimeout(() => {
      setMessages((m) => m.filter((msg) => msg.id !== loadingId));

      if (wantsQuiz(text)) {
        const result = getMockQuizResult(ACTIVE_DOC);
        setMessages((m) => resolveQuiz(m, result));
      } else {
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "tutor",
            text:
              "Đây là bản prototype (CP2) nên phần hỏi đáp tự do sẽ hoạt động ở CP3 khi tích hợp AI. " +
              "Bạn thử nhờ mình “tạo câu hỏi trắc nghiệm để ôn tập” để xem luồng chính nhé!",
          },
        ]);
      }
      setBusy(false);
      scrollToEnd();
    }, 900);
  };

  const resolveQuiz = (m: Message[], result: GenerateQuizResult): Message[] => {
    switch (result.status) {
      case "ready":
        return [
          ...m,
          {
            id: nextId(),
            role: "tutor",
            text: `Mình đã tạo ${result.questions.length} câu hỏi trắc nghiệm bám sát nội dung “${ACTIVE_DOC}”. Chọn đáp án rồi nộp để xem kết quả và giải thích nhé.`,
          },
          { id: nextId(), role: "quiz", result },
        ];
      case "insufficient_content":
        return [
          ...m,
          {
            id: nextId(),
            role: "insufficient",
            reason: result.reason,
            suggestions: result.suggestions,
          },
        ];
      case "extraction_failed":
        return [...m, { id: nextId(), role: "failure", kind: "extraction" }];
      case "generation_failed":
      default:
        return [...m, { id: nextId(), role: "failure", kind: "generation" }];
    }
  };

  const handleReport = () => {
    setMessages((m) => [
      ...m,
      {
        id: nextId(),
        role: "tutor",
        text:
          "Cảm ơn bạn đã báo! Mình đã ghi nhận câu hỏi này để rà soát lại nguồn. " +
          "Ở bản có AI (CP3), mình sẽ tự đối chiếu với slide và tạo lại câu hỏi chính xác hơn.",
      },
    ]);
    scrollToEnd();
  };

  return (
    <aside className="flex h-full w-[24rem] shrink-0 flex-col border-l border-line bg-surface">
      {/* Panel header */}
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-800 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand-800">VLearn Tutor</p>
          <p className="truncate text-2xs text-slate-500">
            Trợ lý học theo ngữ cảnh
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-2xs font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scroll-slim flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onReport={handleReport} onRetry={send} />
        ))}

        {messages.length === 1 && (
          <div className="space-y-1.5 pt-1">
            <p className="px-0.5 text-2xs font-medium uppercase tracking-wide text-slate-400">
              Gợi ý
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="flex w-full items-center gap-2 rounded-input border border-line bg-surface-muted px-3 py-2 text-left text-xs text-slate-600 transition hover:border-accent/40 hover:bg-accent-soft"
              >
                <Lightbulb className="h-3.5 w-3.5 shrink-0 text-accent" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 rounded-panel border border-line bg-surface-muted p-1.5 focus-within:border-accent/50"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Nhập câu hỏi hoặc bôi đen tài liệu…"
            className="max-h-28 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-brand-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-input bg-accent text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Gửi"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <p className="mt-1.5 px-1 text-center text-2xs text-slate-400">
          Prototype CP2 · câu trả lời dựa trên dữ liệu mẫu
        </p>
      </div>
    </aside>
  );
}

function MessageBubble({
  msg,
  onReport,
  onRetry,
}: {
  msg: Message;
  onReport: () => void;
  onRetry: (text: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="animate-fade-in max-w-[85%] rounded-panel rounded-br-sm bg-accent px-3 py-2 text-xs leading-relaxed text-white">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === "tutor") {
    return (
      <div className="animate-fade-in max-w-[90%] rounded-panel rounded-bl-sm bg-surface-muted px-3 py-2 text-xs leading-relaxed text-slate-700">
        {msg.text}
      </div>
    );
  }

  if (msg.role === "tutor-loading") {
    return (
      <div className="flex items-center gap-1.5 rounded-panel rounded-bl-sm bg-surface-muted px-3 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </div>
    );
  }

  if (msg.role === "quiz") {
    return (
      <InlineQuizCard
        quizId={msg.result.quizId}
        questions={msg.result.questions}
        onReport={onReport}
      />
    );
  }

  if (msg.role === "insufficient") {
    return (
      <div className="animate-fade-in rounded-panel border border-warning/30 bg-warning/5 p-3">
        <div className="flex items-center gap-2 text-warning">
          <Lightbulb className="h-4 w-4" />
          <p className="text-xs font-semibold">Chưa đủ nội dung để tạo câu hỏi</p>
        </div>
        <p className="mt-1.5 text-2xs leading-relaxed text-slate-600">
          {msg.reason}
        </p>
        <ul className="mt-2 space-y-1">
          {msg.suggestions.map((s) => (
            <li key={s} className="flex items-start gap-1.5 text-2xs text-slate-600">
              <FileText className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // failure
  const isExtraction = msg.kind === "extraction";
  return (
    <div className="animate-fade-in rounded-panel border border-error/30 bg-error/5 p-3">
      <div className="flex items-center gap-2 text-error">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-xs font-semibold">
          {isExtraction ? "Không đọc được nội dung slide" : "Tạo câu hỏi thất bại"}
        </p>
      </div>
      <p className="mt-1.5 text-2xs leading-relaxed text-slate-600">
        {isExtraction
          ? "Mình gặp lỗi khi trích xuất văn bản từ tệp. Đây có thể là sự cố tạm thời."
          : "Có lỗi khi tạo câu hỏi. Bạn thử lại sau giây lát nhé."}
      </p>
      <button
        type="button"
        onClick={() => onRetry("tạo câu hỏi trắc nghiệm để ôn tập")}
        className="mt-2 inline-flex items-center gap-1.5 rounded-input bg-error px-2.5 py-1.5 text-2xs font-semibold text-white transition hover:opacity-90"
      >
        <RefreshCw className="h-3 w-3" />
        Thử lại
      </button>
    </div>
  );
}
