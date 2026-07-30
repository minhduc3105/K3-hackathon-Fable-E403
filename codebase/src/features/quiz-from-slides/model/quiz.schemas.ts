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
}).superRefine((question, context) => {
  const choiceIds = question.choices.map((choice) => choice.id);
  if (new Set(choiceIds).size !== 4) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Mỗi lựa chọn phải có ID duy nhất.",
      path: ["choices"],
    });
  }
  if (!choiceIds.includes(question.correctChoiceId)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Đáp án đúng phải tham chiếu tới một lựa chọn.",
      path: ["correctChoiceId"],
    });
  }
});

export const GenerateQuizResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ready"),
    quizId: z.string(),
    questions: z.array(QuizQuestionSchema).min(4).max(6),
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
