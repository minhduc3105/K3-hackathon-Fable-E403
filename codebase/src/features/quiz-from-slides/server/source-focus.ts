import { meaningfulQuizTokens, normalizeQuizText } from "./quiz-novelty";

const focusNoise = new Set<string>([
  "application",
  "ban",
  "biet",
  "binh",
  "co",
  "cau",
  "de",
  "flashcard",
  "gon",
  "hoi",
  "kho",
  "lam",
  "muc",
  "mat",
  "muon",
  "nhan",
  "on",
  "prompt",
  "quiz",
  "sanh",
  "sau",
  "so",
  "su",
  "tao",
  "tap",
  "theo",
  "tien",
  "trac",
  "trung",
  "truoc",
  "uu",
  "van",
  "va",
  "vao",
  "vi",
]);

function parseSourceSegments(sourceText: string) {
  const matches = [...sourceText.matchAll(/\[slide\s+\d+\]\s*[\s\S]*?(?=\[slide\s+\d+\]|$)/gi)];
  if (matches.length) return matches.map((match) => match[0].trim()).filter(Boolean);
  return sourceText.split(/\r?\n+/).map((line) => line.trim()).filter(Boolean);
}

function requestedFocusTokens(learnerInstructions: string) {
  return [...meaningfulQuizTokens(learnerInstructions)]
    .filter((token) => !focusNoise.has(token));
}

export type SourceFocusResult =
  | { status: "broad"; sourceText: string; segmentCount: number }
  | { status: "matched"; sourceText: string; segmentCount: number }
  | { status: "unsupported"; requestedTokens: string[] }
  | { status: "exhausted"; requestedTokens: string[] };

export function selectSourceForLearnerRequest(
  sourceText: string,
  learnerInstructions: string,
  previousQuestionPrompts: string[] = [],
  questionCount = 1,
): SourceFocusResult {
  const segments = parseSourceSegments(sourceText);
  const requestedTokens = requestedFocusTokens(learnerInstructions);

  if (!requestedTokens.length) {
    return {
      status: "broad",
      sourceText,
      segmentCount: Math.max(segments.length, 1),
    };
  }

  const scored = segments
    .map((segment) => {
      const segmentTokens = meaningfulQuizTokens(segment);
      const score = requestedTokens.filter((token) => segmentTokens.has(token)).length;
      return { segment, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (!scored.length) return { status: "unsupported", requestedTokens };

  const historyText = previousQuestionPrompts
    .map((prompt) => normalizeForHistory(prompt))
    .join(" ");
  const unused = scored
    .map((item) => item.segment)
    .filter((segment) => {
      const content = normalizeForHistory(segment.replace(/^\[slide\s+\d+\]\s*/i, ""));
      return !content || !historyText.includes(content);
    });

  if (previousQuestionPrompts.length && !unused.length) {
    return { status: "exhausted", requestedTokens };
  }

  const selected = unused.length >= questionCount
    ? unused
    : scored.map((item) => item.segment);

  return {
    status: "matched",
    sourceText: selected.join("\n"),
    segmentCount: selected.length,
  };
}

function normalizeForHistory(value: string) {
  return normalizeQuizText(value);
}
