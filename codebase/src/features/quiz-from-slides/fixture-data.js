export const lesson = {
  courseCode: "COMP2010",
  courseName: "AI thực chiến",
  lectureTitle: "AI product thinking & requirements",
  materialName: "day05-ai-product-thinking-requirements.pdf",
  lectureId: "Lecture_material_ms204v3b_r9mo78",
  slideCount: 44,
};

export const lessonDays = [
  {
    id: 1,
    label: "Day 1",
    status: "ACTIVE",
    materials: [
      { id: "day01-foundation", name: "day01-foundation-llm.pdf", title: "Foundation của LLM", pages: 28, defaultPage: 18, scenario: "normal" },
      { id: "day01-scan", name: "day01-whiteboard-scan.pdf", title: "Ghi chú lớp học dạng scan", pages: 12, defaultPage: 1, scenario: "insufficient" },
    ],
  },
  {
    id: 2,
    label: "Day 2",
    status: "ACTIVE",
    materials: [
      { id: "day02-problem", name: "day02-problem-framing.pdf", title: "Problem framing cho sản phẩm AI", pages: 31, defaultPage: 12, scenario: "normal" },
      { id: "day02-legacy", name: "day02-legacy-material.pdf", title: "Tài liệu cần xử lý lại", pages: 19, defaultPage: 1, scenario: "failure" },
    ],
  },
  {
    id: 3,
    label: "Day 3",
    status: "ACTIVE",
    materials: [
      { id: "day03-prompt", name: "day03-prompt-and-context.pdf", title: "Prompt và context", pages: 26, defaultPage: 9, scenario: "normal" },
    ],
  },
  {
    id: 4,
    label: "Day 4",
    status: "ACTIVE",
    materials: [
      { id: "day04-eval", name: "day04-evaluation.pdf", title: "Đánh giá output AI", pages: 36, defaultPage: 22, scenario: "normal" },
    ],
  },
  {
    id: 5,
    label: "Day 5",
    status: "STUDYING",
    materials: [
      { id: "day05-requirements", name: "day05-ai-product-thinking-requirements.pdf", title: "AI product thinking & requirements", pages: 44, defaultPage: 35, scenario: "normal" },
      { id: "day05-batch", name: "day05-lecture-slides-batch.pdf", title: "Batch processing & guardrails", pages: 39, defaultPage: 21, scenario: "normal" },
    ],
  },
];

export function getMaterial(materialId) {
  return lessonDays.flatMap((day) => day.materials).find((material) => material.id === materialId) || lessonDays[4].materials[0];
}

export const quizQuestions = [
  {
    id: "q1",
    prompt: "Trong một transformer, attention giúp mô hình làm gì?",
    choices: [
      { id: "a", label: "Xác định những phần của chuỗi có liên quan với nhau" },
      { id: "b", label: "Nén toàn bộ văn bản thành một từ khóa duy nhất" },
      { id: "c", label: "Tự động kiểm tra quyền truy cập của người dùng" },
      { id: "d", label: "Chuyển văn bản thành một file trình chiếu" },
    ],
    correctChoiceId: "a",
    explanation: "Attention cho phép mô hình tính mức độ liên quan giữa các token trong ngữ cảnh đang xử lý.",
    source: { pageOrSlide: 7, excerpt: "Attention kết nối các token có liên quan trong cùng một ngữ cảnh." },
  },
  {
    id: "q2",
    prompt: "Vì sao context window quan trọng khi dùng LLM?",
    choices: [
      { id: "a", label: "Nó quyết định tốc độ mạng của ứng dụng" },
      { id: "b", label: "Nó giới hạn lượng ngữ cảnh mô hình có thể xem trong một lần" },
      { id: "c", label: "Nó thay thế bước kiểm tra output của mô hình" },
      { id: "d", label: "Nó đảm bảo mọi câu trả lời đều đúng" },
    ],
    correctChoiceId: "b",
    explanation: "Context window là giới hạn lượng token mô hình có thể tiếp nhận và dùng để tạo output trong một lượt.",
    source: { pageOrSlide: 11, excerpt: "Context window giới hạn số token được đưa vào một lần xử lý." },
  },
  {
    id: "q3",
    prompt: "Khi output của AI có thể gây hậu quả, bước nào nên được thêm vào flow?",
    choices: [
      { id: "a", label: "Ẩn nguồn để người dùng đọc nhanh hơn" },
      { id: "b", label: "Tự động gửi output đi ngay lập tức" },
      { id: "c", label: "Thêm bước kiểm tra hoặc phê duyệt phù hợp" },
      { id: "d", label: "Tăng độ dài câu trả lời" },
    ],
    correctChoiceId: "c",
    explanation: "Với cost-of-error cao, con người hoặc một bước kiểm tra cần giữ quyền quyết định cuối cùng.",
    source: { pageOrSlide: 15, excerpt: "Mức tự động hóa cần được chọn theo cost-of-error của output." },
  },
  {
    id: "q4",
    prompt: "Một output được xem là có căn cứ khi nào?",
    choices: [
      { id: "a", label: "Khi output dài hơn input" },
      { id: "b", label: "Khi người dùng thấy câu trả lời nghe hợp lý" },
      { id: "c", label: "Khi output có nhiều thuật ngữ chuyên môn" },
      { id: "d", label: "Khi có thể truy ngược nội dung về nguồn đã cung cấp" },
    ],
    correctChoiceId: "d",
    explanation: "Căn cứ không đến từ độ dài hay giọng điệu. Nội dung cần truy ngược được về nguồn mà hệ thống đã dùng.",
    source: { pageOrSlide: 17, excerpt: "Grounding giúp người dùng kiểm tra câu trả lời dựa trên nguồn nào." },
  },
];
