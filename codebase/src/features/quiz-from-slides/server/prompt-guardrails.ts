import type { QuizDifficulty } from "../model/types";

type PromptGuardrailInput = {
  learnerInstructions: string;
  sourceTitle: string;
  sourceText: string;
  difficulty: QuizDifficulty;
};

type PromptGuardrailResult =
  | { status: "ok" }
  | { status: "out_of_scope"; reason: string };

const promptInjectionPatterns = [
  /\b(ignore|forget|disregard|override|bypass|reveal|print|show)\b.*\b(instruction|system|developer|prompt|policy|rule|guardrail|secret|token|api key)\b/,
  /\b(system prompt|developer message|jailbreak|dan mode|roleplay as|act as)\b/,
  /\b(bo qua|quen|ghi de|vo hieu hoa|tiet lo|in ra|hien thi)\b.*\b(chi dan|lenh|system|developer|prompt|quy tac|guardrail|bao mat|api key|token)\b/,
  /\b(khong can|dung khong|bo qua)\b.*\b(nguon|hoc lieu|slide|can cu|trich dan)\b/,
  /\b(dung kien thuc ngoai|tu bia|bia them|tra loi bat ke|khong can bam)\b/,
];

const nonQuizActionPatterns = [
  /\b(phong to|thu nho|full man|toan man hinh|bam nut|mo file|tai file)\b/,
  /\b(gui|sua|thay doi|xoa|cong|nang)\b.*\b(diem|giang vien|tai khoan|mat khau)\b/,
  /\b(toi|t|minh|ban)\b.*\b(dep trai|dep gai|xinh|co yeu|co thich)\b/,
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

export function validateQuizPrompt({
  learnerInstructions,
}: PromptGuardrailInput): PromptGuardrailResult {
  const prompt = normalize(learnerInstructions);
  if (!prompt) return { status: "ok" };

  if (matchesAny(prompt, promptInjectionPatterns)) {
    return {
      status: "out_of_scope",
      reason: "Yêu cầu riêng đang cố thay đổi quy tắc tạo quiz, bỏ qua nguồn hoặc truy cập thông tin bị bảo vệ. Hãy chỉ mô tả chủ đề, độ khó hay cách hỏi mong muốn.",
    };
  }

  if (matchesAny(prompt, nonQuizActionPatterns)) {
    return {
      status: "out_of_scope",
      reason: "Ô này chỉ nhận yêu cầu về nội dung hoặc cách tạo quiz, không thực hiện thao tác giao diện, tài khoản, điểm số hay nhận xét cá nhân.",
    };
  }

  // Mọi yêu cầu học tập an toàn đều được chuyển tiếp cho bộ tạo quiz, kể cả khi
  // từ khóa không trùng tuyệt đối với nguồn. Provider vẫn chỉ được phép dùng
  // kiến thức có căn cứ trong SOURCE và sẽ chọn phần gần nhất nếu nguồn không
  // hỗ trợ đầy đủ chủ đề người học nhập.
  return { status: "ok" };
}
