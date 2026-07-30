import { z } from "zod";

export const QuizChoiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1),
  choices: z.tuple([
    QuizChoiceSchema,
    QuizChoiceSchema,
    QuizChoiceSchema,
    QuizChoiceSchema,
  ]),
  correctChoiceId: z.string(),
  explanation: z.string().min(1),
  source: z.object({
    pageOrSlide: z.number().int().positive(),
    excerpt: z.string().min(1),
  }),
});

export const GenerateQuizResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ready"),
    quizId: z.string(),
    questions: z.array(QuizQuestionSchema).min(1),
  }),
  z.object({
    status: z.literal("insufficient_content"),
    reason: z.string(),
    suggestions: z.array(z.string()),
  }),
  z.object({
    status: z.literal("unsupported_file"),
    reason: z.string(),
  }),
  z.object({
    status: z.literal("extraction_failed"),
    retryable: z.boolean(),
  }),
  z.object({
    status: z.literal("generation_failed"),
    retryable: z.boolean(),
  }),
]);
