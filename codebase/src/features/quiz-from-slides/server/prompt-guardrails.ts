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

const fillerWords = new Set([
  "ai",
  "bai",
  "cau",
  "cauhoi",
  "con",
  "de",
  "di",
  "gia",
  "giup",
  "hoc",
  "hoi",
  "lam",
  "lien",
  "mot",
  "muon",
  "nay",
  "nhat",
  "nhu",
  "nhung",
  "noi",
  "o",
  "qua",
  "quiz",
  "sach",
  "slide",
  "so",
  "tai",
  "tao",
  "tap",
  "thanh",
  "theo",
  "thi",
  "trac",
  "trong",
  "truoc",
  "ve",
  "voi",
  "vui",
]);

const learningSignals = [
  "bám sát",
  "câu hỏi",
  "cơ bản",
  "dễ",
  "flashcard",
  "khó",
  "kiểm tra",
  "mức khó",
  "mức độ",
  "ngắn gọn",
  "nhận biết",
  "ôn",
  "ôn tập",
  "phân biệt",
  "phân tích",
  "so sánh",
  "tập trung",
  "thông hiểu",
  "trung bình",
  "trắc nghiệm",
  "từ slide",
  "theo slide",
  "theo trang",
  "vận dụng",
  "ví dụ",
  "ưu tiên",
];

const genericQuizSignals = new Set(["cau hoi", "kiem tra", "on", "on tap", "quiz", "trac nghiem"]);

const promptInjectionPatterns = [
  /\b(ignore|forget|disregard|override|bypass|reveal|print|show)\b.*\b(instruction|system|developer|prompt|policy|rule|guardrail|secret|token|api key)\b/,
  /\b(system prompt|developer message|jailbreak|dan mode|roleplay as|act as)\b/,
  /\b(bo qua|quen|ghi de|vo hieu hoa|tiet lo|in ra|hien thi)\b.*\b(chi dan|lenh|system|developer|prompt|quy tac|guardrail|bao mat|api key|token)\b/,
  /\b(khong can|dung khong|bo qua)\b.*\b(nguon|hoc lieu|slide|can cu|trich dan)\b/,
  /\b(dung kien thuc ngoai|tu bia|bia them|tra loi bat ke|khong can bam)\b/,
];

const topicMarkers = [
  "tap trung vao",
  "lien quan den",
  "noi ve",
  "chu de",
  "ve",
  "cho",
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalize(value).match(/[\p{L}\p{N}]+/gu) ?? []);
}

function contentTokens(value: string) {
  return [...tokenSet(value)].filter((token) => token.length >= 3 && !fillerWords.has(token));
}

function hasLearningSignal(value: string) {
  const normalized = normalize(value);
  return learningSignals.some((signal) => {
    const normalizedSignal = normalize(signal);
    return normalized.includes(normalizedSignal) && !genericQuizSignals.has(normalizedSignal);
  });
}

function hasPromptInjectionIntent(prompt: string) {
  return promptInjectionPatterns.some((pattern) => pattern.test(prompt));
}

function trimTopicNoise(value: string) {
  return normalize(value)
    .replace(/\b(tao|lam|giup|hay|vui long|quiz|cau hoi|trac nghiem|kiem tra|on tap|on|hoc bai|bai hoc|bai nay|hoc lieu|slide nay|nay)\b/g, " ")
    .replace(/\b(de|trung binh|kho|van dung|phan tich|so sanh|nhan biet|thong hieu|flashcard)\b/g, " ")
    .replace(/\b(slide|trang)\s*\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRequestedTopic(prompt: string) {
  for (const marker of topicMarkers) {
    const index = prompt.indexOf(`${marker} `);
    if (index < 0) continue;
    const rawTopic = prompt
      .slice(index + marker.length)
      .split(/[.,;:!?]/)[0]
      .trim();
    const topic = trimTopicNoise(rawTopic);
    if (topic) return topic;
    return null;
  }

  return null;
}

function countMeaningfulSharedTokens(tokens: string[], sourceTokens: Set<string>) {
  return tokens.filter((token) => sourceTokens.has(token)).length;
}

function hasTopicSupport(topic: string, sourceTokens: Set<string>) {
  const tokens = contentTokens(topic);
  if (!tokens.length) return false;

  const sharedCount = countMeaningfulSharedTokens(tokens, sourceTokens);
  return tokens.length === 1 ? tokens[0].length >= 4 && sharedCount === 1 : sharedCount >= 2;
}

export function validateQuizPrompt({
  learnerInstructions,
  sourceTitle,
  sourceText,
  difficulty,
}: PromptGuardrailInput): PromptGuardrailResult {
  const prompt = normalize(learnerInstructions);
  if (!prompt) return { status: "ok" };

  if (hasPromptInjectionIntent(prompt)) {
    return {
      status: "out_of_scope",
      reason: "Yêu cầu riêng có dấu hiệu cố thay đổi luật tạo quiz hoặc bỏ qua học liệu. Hãy chỉ mô tả trọng tâm, độ khó hoặc cách hỏi bám vào slide.",
    };
  }

  const sourceTokens = tokenSet(`${sourceTitle} ${sourceText}`);
  const tokens = contentTokens(prompt);
  const sharedTokens = tokens.filter((token) => sourceTokens.has(token));
  const topic = extractRequestedTopic(prompt);
  const hasDifficultyCue = /(?:\bde\b|\btrung binh\b|\bkho\b)/i.test(prompt);
  const hasSourceCue = /\b(?:slide|trang)\s*\d+\b/i.test(prompt) || /(?:theo|bam)\s+(?:slide|trang|nguon|hoc lieu)/i.test(prompt);
  const hasIntentCue = hasLearningSignal(prompt) || hasDifficultyCue || hasSourceCue;

  if (topic !== null && !hasSourceCue && !hasTopicSupport(topic, sourceTokens)) {
    return {
      status: "out_of_scope",
      reason: "Yêu cầu riêng đang nhắc tới chủ đề không có trong học liệu. Hãy đổi prompt để bám vào slide hoặc chỉ mô tả cách hỏi như 'dễ', 'trung bình', 'khó', 'vận dụng'.",
    };
  }

  if (difficulty === "hard" && !hasIntentCue && sharedTokens.length === 0) {
    return {
      status: "out_of_scope",
      reason: "Yêu cầu độ khó cao vẫn phải bám vào học liệu. Hãy mô tả chủ đề trong slide hoặc cách hỏi mong muốn.",
    };
  }

  if (tokens.length > 0 && sharedTokens.length === 0 && !hasIntentCue) {
    return {
      status: "out_of_scope",
      reason: "Yêu cầu riêng cần bám vào học liệu hoặc cách hỏi học tập. Ví dụ: 'hỏi ở mức vận dụng', 'theo slide 5', hoặc 'dễ/trung bình/khó'.",
    };
  }

  return { status: "ok" };
}
