const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "VLearn Quiz Team";
pres.title = "VLearn Slide-to-Quiz Demo";

// Color palette: Teal Trust (professional learning product)
const colors = {
  primary: "028090",
  secondary: "00A896",
  accent: "02C39A",
  dark: "212121",
  gray: "6B7280",
  lightGray: "F3F4F6",
};

// === SLIDE 1: User & Job ===
let slide1 = pres.addSlide();
slide1.background = { color: colors.primary };

slide1.addText("User & Job", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.8,
  fontSize: 44,
  bold: true,
  color: "FFFFFF",
});

slide1.addText([
  { text: "Job executor: ", options: { bold: true, color: "FFFFFF" } },
  { text: "Học viên vừa xem xong slide bài học", options: { color: "FFFFFF" } },
], {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 0.5,
  fontSize: 18,
});

slide1.addText([
  { text: "Core JTBD: ", options: { bold: true, color: "FFFFFF" } },
  { text: "Kiểm tra nhanh mức độ nhớ kiến thức trước khi hỏi tutor hoặc tiếp tục bài mới", options: { color: "FFFFFF" } },
], {
  x: 0.5,
  y: 2.2,
  w: 9,
  h: 0.8,
  fontSize: 18,
});

slide1.addText("Pain Evidence", {
  x: 0.5,
  y: 3.3,
  w: 9,
  h: 0.4,
  fontSize: 24,
  bold: true,
  color: colors.accent,
});

slide1.addText([
  { text: "[TODO: Mining result]\n", options: { fontSize: 16, bold: true } },
  { text: "VD: 67/200 chatlog (33.5%) học viên hỏi tutor 'em có hiểu đúng không' hoặc 'kiểm tra hiểu của em' ngay sau xem slide.\n\n", options: { fontSize: 14 } },
  { text: "[TODO: Survey result]\n", options: { fontSize: 16, bold: true } },
  { text: "VD: 18/22 học viên khảo sát (82%) xác nhận 'muốn tự kiểm tra trước khi hỏi để không hỏi sai trọng tâm'.", options: { fontSize: 14 } },
], {
  x: 0.5,
  y: 3.8,
  w: 9,
  h: 1.5,
  fontSize: 14,
  color: "FFFFFF",
  valign: "top",
});

slide1.addText("CP1 Canvas → spec.md §1-2 + evidence log", {
  x: 0.5,
  y: 5.3,
  w: 9,
  h: 0.2,
  fontSize: 10,
  color: colors.lightGray,
  italic: true,
});

// === SLIDE 2: Why This Feature ===
let slide2 = pres.addSlide();
slide2.background = { color: "FFFFFF" };

slide2.addText("Vì sao chọn tính năng này", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.dark,
});

slide2.addText("Impact Comparison (3 ứng viên)", {
  x: 0.5,
  y: 1.3,
  w: 9,
  h: 0.4,
  fontSize: 20,
  bold: true,
  color: colors.primary,
});

const impactRows = [
  ["Ứng viên", "Người gặp", "Tần suất", "Mỗi lần tốn", "Build nổi?", "Chọn?"],
  [
    "Quiz từ slide",
    "[TODO: số]\nVD: ~200 HV",
    "Mỗi buổi học",
    "5-10' tìm câu hỏi\nhoặc hỏi lạc trọng tâm",
    "✓ 1.5 ngày",
    "✓ CHỌN"
  ],
  [
    "Tóm tắt buổi học tự động",
    "[TODO]",
    "Mỗi buổi",
    "15' viết notes",
    "✓",
    "✗ Evidence yếu hơn"
  ],
  [
    "Chatbot hỏi logistics",
    "[TODO]",
    "Mỗi tuần",
    "Chờ TA trả lời",
    "✓",
    "✗ Ít người gặp hơn"
  ],
];

slide2.addTable(impactRows, {
  x: 0.5,
  y: 1.8,
  w: 9,
  h: 2.5,
  fontSize: 11,
  border: { pt: 1, color: colors.gray },
  fill: { color: colors.lightGray },
  color: colors.dark,
  align: "left",
  valign: "middle",
});

slide2.addText("spec.md §2 Impact Table + ứng viên đã loại", {
  x: 0.5,
  y: 5.3,
  w: 9,
  h: 0.2,
  fontSize: 10,
  color: colors.gray,
  italic: true,
});

// === SLIDE 3: Solution & Demo ===
let slide3 = pres.addSlide();
slide3.background = { color: "FFFFFF" };

slide3.addText("Giải pháp & Demo Live", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.dark,
});

slide3.addText("Lát cắt (1 câu)", {
  x: 0.5,
  y: 1.3,
  w: 4,
  h: 0.4,
  fontSize: 16,
  bold: true,
  color: colors.primary,
});

slide3.addText(
  "Học viên vừa xem xong slide → tải slide lên → AI tạo quiz 4 lựa chọn → làm quiz trong VLearn → xem đáp án + nguồn trích dẫn",
  {
    x: 0.5,
    y: 1.8,
    w: 4,
    h: 1.2,
    fontSize: 14,
    color: colors.dark,
    valign: "top",
  }
);

slide3.addText("Automation: Conditional", {
  x: 0.5,
  y: 3.1,
  w: 4,
  h: 0.4,
  fontSize: 16,
  bold: true,
  color: colors.primary,
});

slide3.addText(
  "Chỉ tạo khi slide có đủ text rõ ràng. Slide toàn ảnh → từ chối + gợi ý file text-readable.\n\nCost-of-error: Câu hỏi sai kiến thức → học viên học sai. Grounded refusal > confident hallucination.",
  {
    x: 0.5,
    y: 3.6,
    w: 4,
    h: 1.5,
    fontSize: 14,
    color: colors.dark,
    valign: "top",
  }
);

slide3.addShape(pres.ShapeType.rect, {
  x: 5.2,
  y: 1.3,
  w: 4.3,
  h: 3.8,
  fill: { color: colors.lightGray },
  line: { color: colors.gray, pt: 1 },
});

slide3.addText("DEMO LIVE\n\n1 case chuẩn (happy path)\n+\n1 case chỗ khó\n\n[Chạy prototype tại đây]", {
  x: 5.2,
  y: 1.3,
  w: 4.3,
  h: 3.8,
  fontSize: 14,
  color: colors.gray,
  align: "center",
  valign: "middle",
  italic: true,
});

slide3.addText("spec.md §4 + LIVE không video", {
  x: 0.5,
  y: 5.3,
  w: 9,
  h: 0.2,
  fontSize: 10,
  color: colors.gray,
  italic: true,
});

// === SLIDE 4: Results vs Bar ===
let slide4 = pres.addSlide();
slide4.background = { color: "FFFFFF" };

slide4.addText("Kết quả đo", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.dark,
});

slide4.addText("Quality Bar (chốt 23:59 N1)", {
  x: 0.5,
  y: 1.3,
  w: 4.5,
  h: 0.4,
  fontSize: 18,
  bold: true,
  color: colors.primary,
});

slide4.addText("[TODO: Bar đã cam kết]\n\nVD: Đạt khi ≥75% qua golden set VÀ 0% câu hỏi bịa nguồn", {
  x: 0.5,
  y: 1.8,
  w: 4.5,
  h: 1,
  fontSize: 14,
  color: colors.dark,
  valign: "top",
});

slide4.addText("Kết quả thực tế", {
  x: 0.5,
  y: 3,
  w: 4.5,
  h: 0.4,
  fontSize: 18,
  bold: true,
  color: colors.primary,
});

slide4.addText("[TODO: % qua golden set]\n\nVD: 18/24 case (75%) - ĐẠT\nVD: 16/24 case (67%) - CHƯA ĐẠT", {
  x: 0.5,
  y: 3.5,
  w: 4.5,
  h: 1,
  fontSize: 14,
  color: colors.dark,
  valign: "top",
});

slide4.addShape(pres.ShapeType.rect, {
  x: 5.5,
  y: 1.3,
  w: 4,
  h: 3.5,
  fill: { color: colors.lightGray },
  line: { color: colors.gray, pt: 1 },
});

slide4.addText("Failure đáng kể nhất", {
  x: 5.7,
  y: 1.5,
  w: 3.6,
  h: 0.4,
  fontSize: 16,
  bold: true,
  color: colors.primary,
});

slide4.addText(
  "[TODO: Case fail đau nhất + phân tích]\n\nVD: 3/4 case slide toàn ảnh vẫn cố gen → bịa nội dung.\n\nNguyên nhân: Extraction threshold quá thấp (50 chars), cần nâng lên 200 chars.",
  {
    x: 5.7,
    y: 2,
    w: 3.6,
    h: 2.5,
    fontSize: 13,
    color: colors.dark,
    valign: "top",
  }
);

slide4.addText("spec.md §7 + eval/runs/ — GHI NHẬN TRUNG THỰC", {
  x: 0.5,
  y: 5.3,
  w: 9,
  h: 0.2,
  fontSize: 10,
  color: colors.gray,
  italic: true,
});

// === SLIDE 5: User Feedback ===
let slide5 = pres.addSlide();
slide5.background = { color: "FFFFFF" };

slide5.addText("User thật nói gì", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.dark,
});

slide5.addShape(pres.ShapeType.rect, {
  x: 0.5,
  y: 1.3,
  w: 4.3,
  h: 1.5,
  fill: { color: colors.lightGray },
  line: { color: colors.primary, pt: 2 },
});

slide5.addText(
  '[TODO: Quote 1 nguyên văn]\n\nVD: "Slide mình toàn diagram, nó báo không đủ text — đúng là không có gì để hỏi." — Minh, HV Batch 3',
  {
    x: 0.7,
    y: 1.5,
    w: 3.9,
    h: 1.1,
    fontSize: 13,
    color: colors.dark,
    valign: "top",
    italic: true,
  }
);

slide5.addShape(pres.ShapeType.rect, {
  x: 5.2,
  y: 1.3,
  w: 4.3,
  h: 1.5,
  fill: { color: colors.lightGray },
  line: { color: colors.primary, pt: 2 },
});

slide5.addText(
  '[TODO: Quote 2 nguyên văn]\n\nVD: "Câu hỏi có trích dẫn trang giúp mình quay lại xem lại ngay — không phải lật từng trang." — Hương, Willing user',
  {
    x: 5.4,
    y: 1.5,
    w: 3.9,
    h: 1.1,
    fontSize: 13,
    color: colors.dark,
    valign: "top",
    italic: true,
  }
);

slide5.addText("Thay đổi từ feedback", {
  x: 0.5,
  y: 3.1,
  w: 9,
  h: 0.4,
  fontSize: 20,
  bold: true,
  color: colors.primary,
});

slide5.addText(
  "[TODO: ≥1 thay đổi đã làm hoặc lý do giữ nguyên]\n\nVD: ĐÃ SỬA: Người dùng kẹt ở 'đang tạo câu hỏi' không biết hủy được → thêm nút Hủy rõ ràng.\n\nVD: GIỮ NGUYÊN: 2 người muốn xem toàn bộ câu hỏi trước khi làm → giữ one-at-a-time vì preserves momentum (HAX principle), đa số (3/5) thích hiện tại.",
  {
    x: 0.5,
    y: 3.6,
    w: 9,
    h: 1.5,
    fontSize: 13,
    color: colors.dark,
    valign: "top",
  }
);

slide5.addText("validation/ feedback log ≥5 người + Changelog", {
  x: 0.5,
  y: 5.3,
  w: 9,
  h: 0.2,
  fontSize: 10,
  color: colors.gray,
  italic: true,
});

// === SLIDE 6: Next Week ===
let slide6 = pres.addSlide();
slide6.background = { color: colors.primary };

slide6.addText("Nếu có thêm 1 tuần", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.8,
  fontSize: 44,
  bold: true,
  color: "FFFFFF",
});

slide6.addText("Ưu tiên từ feedback/failure", {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 0.4,
  fontSize: 20,
  bold: true,
  color: colors.accent,
});

const priorities = [
  "1. [TODO: Priority từ failure lớn nhất]\n   VD: Nâng extraction threshold 50→200 chars để chặn slide image-heavy",
  "2. [TODO: Priority từ validation feedback]\n   VD: Thêm 'Xem nguồn trong slide' link mở PDF tại đúng trang",
  "3. [TODO: Priority backlog]\n   VD: Hỗ trợ slide Vietnamese có dấu trong OCR (hiện chỉ đọc text layer)",
];

let yPos = 2.1;
priorities.forEach((item) => {
  slide6.addText(item, {
    x: 0.7,
    y: yPos,
    w: 8.6,
    h: 0.7,
    fontSize: 15,
    color: "FFFFFF",
    valign: "top",
  });
  yPos += 0.85;
});

slide6.addText("Bài học lớn nhất", {
  x: 0.5,
  y: 4.3,
  w: 9,
  h: 0.4,
  fontSize: 20,
  bold: true,
  color: colors.accent,
});

slide6.addText(
  "[TODO: Một bài học từ case fail của chính nhóm]\n\nVD: Khi AI refuse (insufficient content), PHẢI có actionable recovery — chỉ nói 'không đủ' mà không gợi ý 'làm gì tiếp' thì user bỏ luôn.",
  {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.8,
    fontSize: 14,
    color: "FFFFFF",
    valign: "top",
  }
);

// Save
pres.writeFile({ fileName: "demo-slides.pptx" });
console.log("✓ Created demo-slides.pptx");
