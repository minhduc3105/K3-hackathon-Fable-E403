import type { QuizQuestion, GenerateQuizResult } from "../model/quiz.types";

// Happy path: valid quiz with grounded questions (Day04 – Prompt Engineering & Tool Calling)
export const happyPathQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kỹ thuật few-shot prompting khác zero-shot ở điểm nào?",
    choices: [
      { id: "q1c1", text: "Few-shot cung cấp một vài ví dụ mẫu ngay trong prompt" },
      { id: "q1c2", text: "Few-shot yêu cầu fine-tune lại mô hình" },
      { id: "q1c3", text: "Few-shot chỉ dùng cho bài toán phân loại ảnh" },
      { id: "q1c4", text: "Few-shot không cần mô tả nhiệm vụ" },
    ],
    correctChoiceId: "q1c1",
    explanation:
      "Few-shot prompting đưa một vài ví dụ (input → output) vào ngay trong prompt để mô hình học mẫu tại thời điểm suy luận, không cần huấn luyện lại.",
    source: {
      pageOrSlide: 4,
      excerpt:
        "Few-shot prompting includes a handful of examples in the prompt so the model can infer the desired pattern in-context...",
    },
  },
  {
    id: "q2",
    prompt: "Chain-of-Thought (CoT) prompting giúp cải thiện điều gì?",
    choices: [
      { id: "q2c1", text: "Giảm số token của prompt" },
      { id: "q2c2", text: "Khả năng suy luận nhiều bước của mô hình" },
      { id: "q2c3", text: "Tốc độ suy luận của GPU" },
      { id: "q2c4", text: "Kích thước cửa sổ ngữ cảnh" },
    ],
    correctChoiceId: "q2c2",
    explanation:
      "CoT khuyến khích mô hình trình bày các bước suy luận trung gian, nhờ đó cải thiện độ chính xác trên các bài toán cần lập luận nhiều bước.",
    source: {
      pageOrSlide: 7,
      excerpt:
        "Chain-of-thought prompting encourages the model to produce intermediate reasoning steps, improving multi-step reasoning...",
    },
  },
  {
    id: "q3",
    prompt: "Trong tool calling (function calling), mô hình trả về gì để gọi công cụ?",
    choices: [
      { id: "q3c1", text: "Mã máy đã biên dịch" },
      { id: "q3c2", text: "Một JSON chứa tên hàm và tham số" },
      { id: "q3c3", text: "Ảnh chụp màn hình kết quả" },
      { id: "q3c4", text: "Trọng số của mô hình" },
    ],
    correctChoiceId: "q3c2",
    explanation:
      "Mô hình sinh ra một cấu trúc JSON gồm tên hàm và các tham số; ứng dụng thực thi hàm đó rồi trả kết quả lại cho mô hình để tiếp tục.",
    source: {
      pageOrSlide: 12,
      excerpt:
        "With function calling, the model emits a structured JSON object naming the function and its arguments for the app to execute...",
    },
  },
  {
    id: "q4",
    prompt: "Đâu là rủi ro cần lưu ý khi thiết kế prompt cho hệ thống thật?",
    choices: [
      { id: "q4c1", text: "Prompt injection từ dữ liệu người dùng" },
      { id: "q4c2", text: "Prompt luôn cho kết quả xác định" },
      { id: "q4c3", text: "Không thể thêm ví dụ vào prompt" },
      { id: "q4c4", text: "Mô hình bỏ qua system prompt hoàn toàn" },
    ],
    correctChoiceId: "q4c1",
    explanation:
      "Prompt injection xảy ra khi nội dung do người dùng/nguồn ngoài cung cấp chứa chỉ thị lấn át prompt gốc; cần tách biệt và kiểm soát dữ liệu không tin cậy.",
    source: {
      pageOrSlide: 15,
      excerpt:
        "Untrusted input may contain instructions that override the intended prompt — treat external content as data, not commands...",
    },
  },
];

// Low-confidence path: insufficient content
export const insufficientContentResult: GenerateQuizResult = {
  status: "insufficient_content",
  reason: "Tệp chủ yếu là hình ảnh hoặc có quá ít chữ rõ ràng để tạo câu hỏi có căn cứ.",
  suggestions: [
    "Xuất slide sang PDF với text layer được giữ lại",
    "Chọn file có nhiều nội dung text hơn",
    "Kiểm tra xem slide có bị scan thành ảnh không",
  ],
};

// Failure path: extraction failed
export const extractionFailedResult: GenerateQuizResult = {
  status: "extraction_failed",
  retryable: true,
};

// Failure path: generation failed
export const generationFailedResult: GenerateQuizResult = {
  status: "generation_failed",
  retryable: true,
};

// Unsupported file
export const unsupportedFileResult: GenerateQuizResult = {
  status: "unsupported_file",
  reason: "Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, PPT, hoặc PPTX.",
};

// Mock function to simulate quiz generation based on filename
export function getMockQuizResult(filename: string): GenerateQuizResult {
  const lower = filename.toLowerCase();

  // Simulate different scenarios based on filename patterns
  if (lower.includes("image") || lower.includes("picture") || lower.includes("scan")) {
    return insufficientContentResult;
  }

  if (lower.includes("corrupt") || lower.includes("error")) {
    return extractionFailedResult;
  }

  if (lower.endsWith(".doc") || lower.endsWith(".docx") || lower.endsWith(".txt")) {
    return unsupportedFileResult;
  }

  // Default to happy path
  return {
    status: "ready",
    quizId: `quiz-${Date.now()}`,
    questions: happyPathQuestions,
  };
}
