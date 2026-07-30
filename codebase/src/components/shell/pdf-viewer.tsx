"use client";

import { useState } from "react";
import {
  BookOpen,
  Pen,
  Highlighter,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
} from "lucide-react";

const TOOLS = [
  { id: "read", label: "Đọc", icon: BookOpen },
  { id: "pen", label: "Bút", icon: Pen },
  { id: "highlight", label: "Highlight", icon: Highlighter },
  { id: "note", label: "Ghi chú", icon: StickyNote },
] as const;

const TOTAL_PAGES = 18;

export function PdfViewer() {
  const [tool, setTool] = useState<string>("read");
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-surface-sunken">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <div className="flex items-center gap-1 rounded-input bg-surface-muted p-0.5">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-surface text-accent shadow-panel"
                    : "text-slate-500 hover:text-brand-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-input p-1.5 text-slate-500 transition hover:bg-surface-muted disabled:opacity-40"
            disabled={page <= 1}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums text-xs text-slate-600">
            Trang{" "}
            <span className="font-semibold text-brand-800">{page}</span> /{" "}
            {TOTAL_PAGES}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
            className="rounded-input p-1.5 text-slate-500 transition hover:bg-surface-muted disabled:opacity-40"
            disabled={page >= TOTAL_PAGES}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="rounded-input p-1.5 text-slate-500 transition hover:bg-surface-muted"
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-10 text-center tabular-nums text-xs text-slate-600">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="rounded-input p-1.5 text-slate-500 transition hover:bg-surface-muted"
            aria-label="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button
            type="button"
            className="rounded-input p-1.5 text-slate-500 transition hover:bg-surface-muted"
            aria-label="Tải xuống"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-input p-1.5 text-slate-500 transition hover:bg-surface-muted"
            aria-label="Toàn màn hình"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Slide canvas */}
      <div className="scroll-slim flex flex-1 items-start justify-center overflow-auto p-6">
        <div
          className="origin-top overflow-hidden rounded-panel bg-white shadow-pop ring-1 ring-line"
          style={{ width: `${(720 * zoom) / 100}px` }}
        >
          <SlideTitle />
        </div>
      </div>
    </section>
  );
}

// A mock title slide standing in for the rendered PDF page.
function SlideTitle() {
  return (
    <div className="relative aspect-video w-full bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="relative flex h-full flex-col justify-between p-10">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-white/15 text-sm font-black">
            V
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/80">
            VinUniversity
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Day 04 · Generative AI &amp; LLM Applications
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight">
            Prompt Engineering
            <br />
            &amp; Tool Calling
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Thiết kế prompt hiệu quả, few-shot &amp; chain-of-thought, và cách
            LLM gọi công cụ bên ngoài qua function calling.
          </p>
        </div>

        <div className="flex items-center justify-between text-2xs text-white/50">
          <span>COMP4020 · Học kỳ 2 · 2025–2026</span>
          <span>Slide 1 / 18</span>
        </div>
      </div>
    </div>
  );
}
