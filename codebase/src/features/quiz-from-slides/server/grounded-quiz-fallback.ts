import type { GenerateQuizResult, QuizChoice, QuizQuestion } from "../model/types";
import { meaningfulQuizTokens, promptAppearsInHistory } from "./quiz-novelty";

type GroundedFallbackInput = {
  sourceText: string;
  learnerInstructions?: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  traceId: string;
  generationNonce: string;
  previousQuestionPrompts: string[];
  model: string;
};

type SourceUnit = {
  pageOrSlide: number;
  excerpt: string;
};

const choiceIds = ["a", "b", "c", "d"] as const;
const stopWords = new Set([
  "các", "cho", "câu", "công", "của", "đáp", "được", "dụng", "hãy", "hỏi",
  "khó", "là", "một", "mức", "nên", "những", "quiz", "slide", "tạo", "tập",
  "theo", "thức", "trong", "trung", "từ", "và", "vận", "về",
]);

const promptTemplates = [
  (topic: string) => `Phát biểu nào mô tả đúng về ${topic}?`,
  (topic: string) => `${topic} được giải thích đúng nhất qua lựa chọn nào?`,
  (topic: string) => `Đâu là cách hiểu chính xác về ${topic}?`,
  (topic: string) => `Điểm nào cần ghi nhớ về ${topic}?`,
  (topic: string) => `Vai trò của ${topic} được thể hiện như thế nào?`,
  (topic: string) => `Kết luận nào mô tả chính xác ${topic}?`,
  (topic: string) => `Nhận định nào không làm sai lệch kiến thức về ${topic}?`,
  (topic: string) => `Thông tin nào về ${topic} là chính xác?`,
  (topic: string) => `Ý nghĩa của ${topic} là gì?`,
  (topic: string) => `Lựa chọn nào phân biệt đúng ${topic}?`,
] as const;

const applicationPromptTemplates = [
  (topic: string) => `Trong một tình huống thực tế, ${topic} nên được vận dụng như thế nào?`,
  (topic: string) => `Cách xử lý nào áp dụng đúng kiến thức về ${topic}?`,
  (topic: string) => `Khi phân tích một trường hợp mới bằng ${topic}, dữ kiện nào cần được giữ nguyên?`,
  (topic: string) => `Lựa chọn nào tránh hiểu sai ${topic}?`,
  (topic: string) => `Đâu là ví dụ vận dụng đúng ${topic}?`,
  (topic: string) => `Khi ra quyết định dựa trên ${topic}, đâu là căn cứ phù hợp?`,
  (topic: string) => `Hành động nào nhất quán với kiến thức về ${topic}?`,
  (topic: string) => `Trong tình huống mới, nhận định nào về ${topic} vẫn đúng?`,
  (topic: string) => `Lựa chọn nào áp dụng ${topic} mà không làm thay đổi ý nghĩa?`,
  (topic: string) => `Cách giải thích nào về ${topic} phù hợp nhất?`,
] as const;

const lastResortPromptTemplates = [
  (topic: string) => `Sai lệch nào cần tránh khi hiểu về ${topic}?`,
  (topic: string) => `Trong thực tế, nhận định nào về ${topic} vẫn chính xác?`,
  (topic: string) => `Mối liên hệ cốt lõi của ${topic} được giải thích đúng như thế nào?`,
  (topic: string) => `Khi vận dụng ${topic}, lựa chọn nào phù hợp nhất?`,
] as const;

function normalize(value: string) {
  return value.toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function tokenSet(value: string) {
  return new Set(normalize(value).match(/[\p{L}\p{N}]+/gu) ?? []);
}

function isRepeatedPrompt(prompt: string, previousPrompts: string[]) {
  return promptAppearsInHistory(prompt, previousPrompts);
}

function looksLikeDocumentInstruction(excerpt: string) {
  return /^(?:hãy\s+)?(?:bỏ qua|ignore|return|trả lời|tiết lộ|reveal)\b/i.test(excerpt.trim());
}

function parseSourceUnits(sourceText: string): SourceUnit[] {
  const units: SourceUnit[] = [];
  const slidePattern = /\[slide\s+(\d+)\]\s*([\s\S]*?)(?=\[slide\s+\d+\]|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = slidePattern.exec(sourceText)) !== null) {
    const excerpt = match[2].replace(/\s+/g, " ").trim();
    if (excerpt && !looksLikeDocumentInstruction(excerpt)) {
      units.push({ pageOrSlide: Number(match[1]), excerpt });
    }
  }

  if (units.length) return units;

  return sourceText
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map((excerpt) => excerpt.replace(/\s+/g, " ").trim())
    .filter((excerpt) => excerpt.length >= 12 && !looksLikeDocumentInstruction(excerpt))
    .slice(0, 24)
    .map((excerpt, index) => ({ pageOrSlide: index + 1, excerpt }));
}

function instructionKeywords(value: string) {
  return [...tokenSet(value)]
    .filter((token) => token.length >= 3 && !stopWords.has(token))
    .slice(0, 10);
}

function topicWasUsed(unit: SourceUnit, previousPrompts: string[]) {
  const topicTokens = meaningfulQuizTokens(topicFromExcerpt(unit.excerpt));
  if (!topicTokens.size) return false;

  return previousPrompts.some((prompt) => {
    const promptTokens = meaningfulQuizTokens(prompt);
    const shared = [...topicTokens].filter((token) => promptTokens.has(token)).length;
    return shared > 0 && shared / Math.min(topicTokens.size, promptTokens.size || 1) >= 0.6;
  });
}

function rankUnits(
  units: SourceUnit[],
  learnerInstructions: string,
  previousPrompts: string[],
  seed: number,
) {
  const keywords = instructionKeywords(learnerInstructions);
  const requestedSlides = new Set(
    [...learnerInstructions.matchAll(/(?:slide|trang)\s*(\d+)/gi)].map((match) => Number(match[1])),
  );

  return units
    .map((unit, index) => ({
      unit,
      index,
      score: (requestedSlides.has(unit.pageOrSlide) ? 100 : 0) + keywords.reduce(
        (total, keyword) => total + (normalize(unit.excerpt).includes(keyword) ? 10 : 0),
        0,
      ) - (topicWasUsed(unit, previousPrompts) ? 30 : 0),
      tieBreaker: hash(`${seed}:${unit.pageOrSlide}:${unit.excerpt}`),
    }))
    .sort((left, right) => right.score - left.score || left.tieBreaker - right.tieBreaker || left.index - right.index)
    .map(({ unit }) => unit);
}

function topicFromExcerpt(excerpt: string) {
  const cleaned = excerpt.replace(/[“”"]/g, "").replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
  const conditional = cleaned.match(/^(?:Với|Khi)\s+([^,]{3,80}),/i)?.[1];
  if (conditional) return conditional.trim();

  const recommendation = cleaned.match(/^Nên\s+(.+?)\s+(?:theo|để|thay vì)\b/i)?.[1];
  if (recommendation) return recommendation.trim();

  const subject = cleaned.match(/^(.{2,80}?)\s+(?:giúp|giới hạn|cho phép|tạo|phù hợp|tìm|tập trung|luôn hỏi|phải|nên|mô tả|đảm bảo|yêu cầu)\b/i)?.[1];
  if (subject) return subject.trim();

  return cleaned.split(/\s+/).slice(0, 6).join(" ");
}

function buildPrompt(
  unit: SourceUnit,
  learnerInstructions: string,
  difficulty: "easy" | "medium" | "hard",
  seed: number,
  blockedPrompts: string[],
) {
  const topic = topicFromExcerpt(unit.excerpt);
  const normalizedInstructions = normalize(learnerInstructions);
  const applicationMode = /(vận dụng|phân tích|tình huống|khó|application)/i.test(normalizedInstructions);
  const templates = difficulty === "easy"
    ? promptTemplates.slice(0, 10)
    : difficulty === "hard"
      ? (applicationMode ? applicationPromptTemplates : [...applicationPromptTemplates, ...promptTemplates])
      : (applicationMode ? [...applicationPromptTemplates, ...promptTemplates] : promptTemplates);

  for (let offset = 0; offset < templates.length; offset += 1) {
    const template = templates[(seed + offset) % templates.length];
    const candidate = template(topic);

    if (!isRepeatedPrompt(candidate, blockedPrompts)) return candidate;
  }

  return lastResortPromptTemplates[Math.abs(seed) % lastResortPromptTemplates.length](topic);
}

function seededShuffle<T>(values: T[], seed: number) {
  const result = [...values];
  let state = seed || 1;

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    const target = Math.abs(state) % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }

  return result;
}

function fallbackDistractors(correctExcerpt: string) {
  return [
    `Khái niệm này phủ định hoàn toàn nhận định: “${correctExcerpt}”.`,
    "Cơ chế này luôn bảo đảm kết quả đúng mà không cần kiểm tra.",
    "Nội dung này chỉ thay đổi hình thức hiển thị và không ảnh hưởng cách xử lý.",
  ];
}

function buildQuestion(
  unit: SourceUnit,
  units: SourceUnit[],
  learnerInstructions: string,
  difficulty: "easy" | "medium" | "hard",
  questionIndex: number,
  seed: number,
  blockedPrompts: string[],
): QuizQuestion {
  const otherExcerpts = units
    .filter((candidate) => candidate !== unit && normalize(candidate.excerpt) !== normalize(unit.excerpt))
    .map((candidate) => candidate.excerpt);
  const labels = [unit.excerpt, ...otherExcerpts, ...fallbackDistractors(unit.excerpt)].slice(0, 4);
  const shuffled = seededShuffle(labels, seed + questionIndex * 101);
  const correctIndex = shuffled.indexOf(unit.excerpt);
  const prompt = buildPrompt(unit, learnerInstructions, difficulty, seed + questionIndex, blockedPrompts);

  blockedPrompts.push(prompt);

  return {
    id: `q-${hash(`${seed}:${questionIndex}:${prompt}`).toString(36)}`,
    prompt,
    choices: shuffled.map((label, index) => ({
      id: choiceIds[index],
      label,
    })) as [QuizChoice, QuizChoice, QuizChoice, QuizChoice],
    correctChoiceId: choiceIds[correctIndex],
    explanation: unit.excerpt,
    source: {
      pageOrSlide: unit.pageOrSlide,
      excerpt: unit.excerpt,
    },
  };
}

export function generateGroundedFallbackQuiz(
  input: GroundedFallbackInput,
): Extract<GenerateQuizResult, { status: "ready" }> {
  const units = parseSourceUnits(input.sourceText);
  const safeUnits = units.length
    ? units
    : [{ pageOrSlide: 1, excerpt: input.sourceText.replace(/\s+/g, " ").trim() }];
  const seed = hash(`${input.generationNonce}:${input.learnerInstructions ?? ""}:${input.difficulty}`);
  const rankedUnits = rankUnits(
    safeUnits,
    input.learnerInstructions ?? "",
    input.previousQuestionPrompts,
    seed,
  );
  const blockedPrompts = [...input.previousQuestionPrompts];
  const questions = Array.from({ length: input.questionCount }, (_, index) => buildQuestion(
    rankedUnits[index % rankedUnits.length],
    rankedUnits,
    input.learnerInstructions ?? "",
    input.difficulty,
    index,
    seed,
    blockedPrompts,
  ));

  return {
    status: "ready",
    traceId: input.traceId,
    model: input.model,
    generationMode: "grounded_fallback",
    questions,
  };
}
