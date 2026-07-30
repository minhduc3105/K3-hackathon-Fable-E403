// Mock course-materials tree shown in the left "Học liệu môn học" sidebar.
// Mirrors the reference UI: a course made of Day01..Day06 sections,
// each with one or more documents (slides / handouts).

export type CourseDoc = {
  id: string;
  title: string;
  kind: "slide" | "doc" | "lab";
  pages: number;
};

export type CourseSection = {
  id: string;
  label: string; // e.g. "Day04"
  title: string; // e.g. "Prompt Engineering & Tool Calling"
  studying?: boolean; // shows the "STUDYING" badge
  docs: CourseDoc[];
};

export const courseMeta = {
  code: "COMP4020",
  name: "Generative AI & LLM Applications",
  term: "Học kỳ 2 · 2025–2026",
};

export const courseSections: CourseSection[] = [
  {
    id: "day01",
    label: "Day01",
    title: "Nhập môn Generative AI",
    docs: [
      { id: "d1-1", title: "01 – Tổng quan Generative AI.pdf", kind: "slide", pages: 24 },
      { id: "d1-2", title: "01 – Bài đọc: Lịch sử AI.pdf", kind: "doc", pages: 8 },
    ],
  },
  {
    id: "day02",
    label: "Day02",
    title: "Kiến trúc Transformer",
    docs: [
      { id: "d2-1", title: "02 – Transformer & Attention.pdf", kind: "slide", pages: 31 },
    ],
  },
  {
    id: "day03",
    label: "Day03",
    title: "Huấn luyện & Fine-tuning",
    docs: [
      { id: "d3-1", title: "03 – Pretraining & Fine-tuning.pdf", kind: "slide", pages: 27 },
      { id: "d3-2", title: "03 – Lab: LoRA.ipynb", kind: "lab", pages: 12 },
    ],
  },
  {
    id: "day04",
    label: "Day04",
    title: "Prompt Engineering & Tool Calling",
    studying: true,
    docs: [
      { id: "d4-1", title: "04 – Prompt Engineering.pdf", kind: "slide", pages: 18 },
      { id: "d4-2", title: "04 – Tool Calling & Function API.pdf", kind: "slide", pages: 15 },
      { id: "d4-3", title: "04 – Handout: Prompt patterns.pdf", kind: "doc", pages: 6 },
    ],
  },
  {
    id: "day05",
    label: "Day05",
    title: "RAG & Vector Databases",
    docs: [
      { id: "d5-1", title: "05 – Retrieval-Augmented Generation.pdf", kind: "slide", pages: 22 },
    ],
  },
  {
    id: "day06",
    label: "Day06",
    title: "Agents & Đánh giá hệ thống",
    docs: [
      { id: "d6-1", title: "06 – Autonomous Agents.pdf", kind: "slide", pages: 20 },
      { id: "d6-2", title: "06 – Đánh giá & An toàn.pdf", kind: "slide", pages: 14 },
    ],
  },
];

// The document currently open in the PDF viewer.
export const activeDocId = "d4-1";
