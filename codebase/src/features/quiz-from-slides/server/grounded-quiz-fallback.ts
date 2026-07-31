import type { GenerateQuizResult, QuizChoice, QuizQuestion } from "../model/types";

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
  (slide: number) => `Theo slide ${slide}, nhận định nào dưới đây được nêu trong học liệu?`,
  (slide: number) => `Nội dung nào phản ánh đúng ý chính được trình bày ở slide ${slide}?`,
  (slide: number) => `Khi đối chiếu với slide ${slide}, lựa chọn nào khớp với tài liệu?`,
  (slide: number) => `Ý nào là căn cứ xuất hiện tại slide ${slide}?`,
  (slide: number) => `Điểm cần ghi nhớ từ slide ${slide} là gì?`,
  (slide: number) => `Phát biểu nào mô tả chính xác nội dung của slide ${slide}?`,
  (slide: number) => `Nếu ôn lại slide ${slide}, người học cần chọn kết luận nào?`,
  (slide: number) => `Thông tin nào thuộc slide ${slide}, thay vì các phần còn lại của bài?`,
  (slide: number) => `Slide ${slide} cung cấp căn cứ cho phát biểu nào?`,
  (slide: number) => `Đâu là cách diễn đạt phù hợp nhất với ý được nêu ở slide ${slide}?`,
  (slide: number) => `Trong bài học, nội dung gắn với slide ${slide} là lựa chọn nào?`,
  (slide: number) => `Khi kiểm tra lại nguồn ở slide ${slide}, phát biểu nào được xác nhận?`,
  (slide: number) => `Nhận định nào có thể truy ngược trực tiếp về slide ${slide}?`,
  (slide: number) => `Nếu chỉ dựa vào slide ${slide}, câu trả lời phù hợp là gì?`,
  (slide: number) => `Đâu là thông tin slide ${slide} thực sự cung cấp?`,
  (slide: number) => `Phần kiến thức ở slide ${slide} hỗ trợ lựa chọn nào?`,
  (slide: number) => `Kết luận nào không vượt quá căn cứ tại slide ${slide}?`,
  (slide: number) => `Khi tóm lược riêng slide ${slide}, ý nào phải được giữ lại?`,
  (slide: number) => `Lựa chọn nào nêu đúng điều người học vừa đọc ở slide ${slide}?`,
  (slide: number) => `Đâu là phát biểu có nguồn đối chiếu tại slide ${slide}?`,
  (slide: number) => `Thông tin cốt lõi được ghi nhận ở slide ${slide} là gì?`,
  (slide: number) => `Nếu cần dẫn lại slide ${slide}, nội dung nào là chính xác?`,
  (slide: number) => `Câu nào bám sát nhất vào dữ liệu của slide ${slide}?`,
  (slide: number) => `Ý nào thuộc phạm vi kiến thức được slide ${slide} xác nhận?`,
] as const;

const applicationPromptTemplates = [
  (slide: number) => `Khi cần vận dụng ý ở slide ${slide}, căn cứ nào dưới đây phù hợp với học liệu?`,
  (slide: number) => `Để ra quyết định dựa trên slide ${slide}, người học nên dùng nhận định nào?`,
  (slide: number) => `Trong một bài tập áp dụng nội dung slide ${slide}, phát biểu nào là căn cứ đúng?`,
  (slide: number) => `Khi phân tích một tình huống theo slide ${slide}, thông tin nào cần được giữ nguyên?`,
  (slide: number) => `Lựa chọn nào có thể dùng để giải thích một tình huống bằng ý ở slide ${slide}?`,
  (slide: number) => `Nếu phải áp dụng nội dung slide ${slide}, đâu là điểm xuất phát có căn cứ?`,
  (slide: number) => `Trong bước vận dụng kiến thức ở slide ${slide}, nhận định nào khớp với nguồn?`,
  (slide: number) => `Để tránh suy diễn ngoài slide ${slide}, người học cần chọn thông tin nào?`,
  (slide: number) => `Khi giải một trường hợp dựa trên slide ${slide}, ý nào được tài liệu hỗ trợ?`,
  (slide: number) => `Căn cứ nào từ slide ${slide} phù hợp nhất cho một câu hỏi vận dụng?`,
  (slide: number) => `Nếu cần minh họa ý của slide ${slide}, phát biểu nào vẫn đúng theo nguồn?`,
  (slide: number) => `Trong một tình huống mới, nội dung nào có thể truy ngược về slide ${slide}?`,
  (slide: number) => `Khi xử lý một trường hợp theo slide ${slide}, lựa chọn nào giữ đúng căn cứ?`,
  (slide: number) => `Để áp dụng mà không bịa thêm từ slide ${slide}, nên bắt đầu với ý nào?`,
  (slide: number) => `Trong bước phân tích dựa trên slide ${slide}, dữ kiện nào là hợp lệ?`,
  (slide: number) => `Nếu một quyết định cần viện dẫn slide ${slide}, phát biểu nào dùng được?`,
  (slide: number) => `Khi chuyển ý ở slide ${slide} thành hành động, căn cứ đúng là gì?`,
  (slide: number) => `Để kiểm tra một ví dụ bằng slide ${slide}, nhận định nào nên được đối chiếu?`,
  (slide: number) => `Trong bài tập tình huống về slide ${slide}, đâu là thông tin không bị suy diễn?`,
  (slide: number) => `Khi đánh giá một trường hợp mới, ý nào từ slide ${slide} còn nguyên giá trị?`,
  (slide: number) => `Đâu là căn cứ của slide ${slide} có thể mang sang bước vận dụng?`,
  (slide: number) => `Nếu cần lập luận theo slide ${slide}, người học nên chọn dữ kiện nào?`,
  (slide: number) => `Trong một quyết định thực tế, nội dung nào bám đúng slide ${slide}?`,
  (slide: number) => `Khi giải thích một ví dụ bằng slide ${slide}, phát biểu nào có nguồn?`,
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
  const normalizedPrompt = normalize(prompt);
  return previousPrompts.some((previous) => normalizedPrompt === normalize(previous));
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

function rankUnits(units: SourceUnit[], learnerInstructions: string, seed: number) {
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
      ),
      tieBreaker: hash(`${seed}:${unit.pageOrSlide}:${unit.excerpt}`),
    }))
    .sort((left, right) => right.score - left.score || left.tieBreaker - right.tieBreaker || left.index - right.index)
    .map(({ unit }) => unit);
}

function focusLabel(learnerInstructions: string, unit: SourceUnit) {
  const requested = instructionKeywords(learnerInstructions);
  const matched = requested.find((keyword) => normalize(unit.excerpt).includes(keyword));
  if (matched) return matched;

  return [...tokenSet(unit.excerpt)]
    .find((token) => token.length >= 5 && !stopWords.has(token));
}

function buildPrompt(
  unit: SourceUnit,
  learnerInstructions: string,
  difficulty: "easy" | "medium" | "hard",
  seed: number,
  blockedPrompts: string[],
) {
  const focus = focusLabel(learnerInstructions, unit);
  const normalizedInstructions = normalize(learnerInstructions);
  const applicationMode = /(vận dụng|phân tích|tình huống|khó|application)/i.test(normalizedInstructions);
  const templates = difficulty === "easy"
    ? promptTemplates.slice(0, 10)
    : difficulty === "hard"
      ? (applicationMode ? applicationPromptTemplates : [...applicationPromptTemplates, ...promptTemplates])
      : (applicationMode ? [...applicationPromptTemplates, ...promptTemplates] : promptTemplates);

  for (let offset = 0; offset < templates.length; offset += 1) {
    const template = templates[(seed + offset) % templates.length];
    const basePrompt = template(unit.pageOrSlide);
    const candidate = focus
      ? `${basePrompt} Trọng tâm: ${focus}.`
      : basePrompt;

    if (!isRepeatedPrompt(candidate, blockedPrompts)) return candidate;
  }

  const variant = (seed % 97) + 1;
  return `Ở lượt ôn tập ${variant}, thông tin nào được slide ${unit.pageOrSlide} xác nhận?${focus ? ` Trọng tâm: ${focus}.` : ""}`;
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
    `Học liệu không đưa ra nội dung cụ thể nào thay cho nhận định: “${correctExcerpt}”.`,
    "Slide này chỉ nêu tiêu đề và không có kết luận cần ghi nhớ.",
    "Tài liệu yêu cầu bỏ qua hoàn toàn nội dung của slide này.",
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
    explanation: `Slide ${unit.pageOrSlide} nêu trực tiếp: “${unit.excerpt}”`,
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
  const rankedUnits = rankUnits(safeUnits, input.learnerInstructions ?? "", seed);
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
