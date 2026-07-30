import type { QuizQuestion, GenerateQuizResult } from "../model/quiz.types";

// Happy path: valid quiz with grounded questions
export const happyPathQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Điều gì là đặc điểm chính của Generative AI so với AI truyền thống?",
    choices: [
      { id: "q1c1", text: "Chỉ phân loại dữ liệu" },
      { id: "q1c2", text: "Tạo ra nội dung mới từ dữ liệu đã học" },
      { id: "q1c3", text: "Chỉ xử lý văn bản" },
      { id: "q1c4", text: "Không cần dữ liệu huấn luyện" },
    ],
    correctChoiceId: "q1c2",
    explanation: "Generative AI có khả năng tạo ra nội dung mới (văn bản, hình ảnh, âm thanh) dựa trên mẫu đã học từ dữ liệu huấn luyện.",
    source: {
      pageOrSlide: 3,
      excerpt: "Generative AI models learn patterns from training data and can generate new content...",
    },
  },
  {
    id: "q2",
    prompt: "Transformer architecture được giới thiệu trong paper nào?",
    choices: [
      { id: "q2c1", text: "Attention Is All You Need (2017)" },
      { id: "q2c2", text: "BERT (2018)" },
      { id: "q2c3", text: "GPT-1 (2018)" },
      { id: "q2c4", text: "ResNet (2015)" },
    ],
    correctChoiceId: "q2c1",
    explanation: "Paper 'Attention Is All You Need' của Vaswani et al. (2017) đã giới thiệu kiến trúc Transformer, nền tảng cho các mô hình ngôn ngữ hiện đại.",
    source: {
      pageOrSlide: 5,
      excerpt: "The Transformer architecture was introduced in the seminal 2017 paper 'Attention Is All You Need'...",
    },
  },
  {
    id: "q3",
    prompt: "Kỹ thuật nào giúp LLM tập trung vào các phần quan trọng của input?",
    choices: [
      { id: "q3c1", text: "Pooling" },
      { id: "q3c2", text: "Convolution" },
      { id: "q3c3", text: "Self-Attention" },
      { id: "q3c4", text: "Dropout" },
    ],
    correctChoiceId: "q3c3",
    explanation: "Self-Attention mechanism cho phép mô hình tính toán mức độ liên quan giữa các token và tập trung vào các phần quan trọng của input.",
    source: {
      pageOrSlide: 7,
      excerpt: "Self-attention allows the model to weigh the importance of different parts of the input sequence...",
    },
  },
  {
    id: "q4",
    prompt: "Temperature parameter trong sampling ảnh hưởng đến output như thế nào?",
    choices: [
      { id: "q4c1", text: "Temperature cao làm output ngẫu nhiên hơn" },
      { id: "q4c2", text: "Temperature thấp làm output ngẫu nhiên hơn" },
      { id: "q4c3", text: "Temperature không ảnh hưởng đến output" },
      { id: "q4c4", text: "Temperature chỉ ảnh hưởng tốc độ" },
    ],
    correctChoiceId: "q4c1",
    explanation: "Temperature cao (>1) làm phân phối xác suất phẳng hơn, dẫn đến output đa dạng và sáng tạo hơn. Temperature thấp (<1) làm output tập trung và xác định hơn.",
    source: {
      pageOrSlide: 12,
      excerpt: "Higher temperature values (>1) make the output more random and creative, while lower values (<1) make it more focused...",
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
