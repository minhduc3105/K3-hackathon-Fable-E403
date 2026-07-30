"use client";

import { useState } from "react";
import {
  ChevronDown,
  FileText,
  Presentation,
  FlaskConical,
  Search,
} from "lucide-react";
import {
  courseSections,
  courseMeta,
  activeDocId,
  type CourseDoc,
} from "@/features/quiz-from-slides/fixtures/course-materials";

const kindIcon: Record<CourseDoc["kind"], typeof FileText> = {
  slide: Presentation,
  doc: FileText,
  lab: FlaskConical,
};

export function CourseSidebar() {
  // Day04 open by default (the section being studied).
  const [open, setOpen] = useState<Record<string, boolean>>({ day04: true });

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <p className="text-2xs font-semibold uppercase tracking-wide text-brand-400">
          Học liệu môn học
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-brand-800">
          {courseMeta.name}
        </p>
        <p className="text-xs text-slate-500">
          {courseMeta.code} · {courseMeta.term}
        </p>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-input border border-line bg-surface-muted px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tài liệu…"
            className="w-full bg-transparent text-xs text-brand-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <nav className="scroll-slim flex-1 overflow-y-auto px-2 pb-4" aria-label="Danh sách học liệu">
        {courseSections.map((section) => {
          const isOpen = !!open[section.id];
          return (
            <div key={section.id} className="mb-0.5">
              <button
                type="button"
                onClick={() =>
                  setOpen((s) => ({ ...s, [section.id]: !s[section.id] }))
                }
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 rounded-input px-2 py-2 text-left transition hover:bg-surface-muted"
              >
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                    isOpen ? "" : "-rotate-90"
                  }`}
                />
                <span className="w-11 shrink-0 text-xs font-bold text-brand-600">
                  {section.label}
                </span>
                <span className="flex-1 truncate text-xs font-medium text-brand-800">
                  {section.title}
                </span>
                {section.studying && (
                  <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent">
                    Studying
                  </span>
                )}
              </button>

              {isOpen && (
                <ul className="mb-1 ml-6 space-y-0.5 border-l border-line pl-2">
                  {section.docs.map((doc) => {
                    const Icon = kindIcon[doc.kind];
                    const active = doc.id === activeDocId;
                    return (
                      <li key={doc.id}>
                        <button
                          type="button"
                          className={`flex w-full items-start gap-2 rounded-input px-2 py-1.5 text-left transition ${
                            active
                              ? "bg-accent-soft text-accent"
                              : "text-slate-600 hover:bg-surface-muted"
                          }`}
                        >
                          <Icon
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                              active ? "text-accent" : "text-slate-400"
                            }`}
                          />
                          <span className="flex-1">
                            <span className="block text-xs leading-snug">
                              {doc.title}
                            </span>
                            <span className="text-2xs text-slate-400">
                              {doc.pages} trang
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
