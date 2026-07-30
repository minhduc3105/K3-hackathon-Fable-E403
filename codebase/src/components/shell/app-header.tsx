"use client";

import { ArrowLeft, Moon, ChevronDown, FileText } from "lucide-react";
import { courseMeta } from "@/features/quiz-from-slides/fixtures/course-materials";

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-brand-800 px-3 text-white">
      <button
        type="button"
        className="rounded-input p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="Quay lại"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-white text-sm font-black text-brand-800">
          V
        </div>
        <span className="text-base font-black tracking-tight">
          VLearn
        </span>
      </div>

      <span className="mx-1 h-6 w-px bg-white/15" />

      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-white/60" />
        <span className="truncate text-sm font-medium text-white/90">
          04 – Prompt Engineering.pdf
        </span>
        <span className="hidden shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-2xs font-semibold text-white/70 sm:inline">
          {courseMeta.code}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          className="flex items-center gap-1 rounded-input px-2 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          aria-label="Ngôn ngữ"
        >
          VI
          <ChevronDown className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="rounded-input p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Chế độ tối"
        >
          <Moon className="h-4 w-4" />
        </button>
        <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-xs font-bold">
          AN
        </div>
      </div>
    </header>
  );
}
