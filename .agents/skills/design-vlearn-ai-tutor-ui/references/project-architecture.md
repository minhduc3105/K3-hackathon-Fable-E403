# Project Architecture

## Contents

1. Repository layout
2. Frontend feature layout
3. Dependency rules
4. Data contracts
5. API and security rules
6. Testing layout

## Repository Layout

Keep the hackathon artifacts visible at the root and isolate the runnable prototype in `codebase/`:

```text
repo/
|-- README.md
|-- spec.md
|-- demo-slides.pdf
|-- codebase/
|-- eval/
|   |-- golden-set.jsonl
|   |-- rubric.md
|   `-- runs/
|-- validation/
|   `-- feedback-log.md
|-- reflection/
`-- .agents/
    `-- skills/
        `-- design-vlearn-ai-tutor-ui/
```

Do not copy the provided private data pack into a public submission repository. Reference anonymized segment IDs and short permitted excerpts in eval artifacts.

## Frontend Feature Layout

When no application exists, default to Next.js App Router, TypeScript, Tailwind, and a feature-first layout:

```text
codebase/
|-- src/
|   |-- app/
|   |   |-- (learning)/courses/[courseId]/lessons/[lessonId]/review/page.tsx
|   |   `-- api/quiz/
|   |       |-- generate/route.ts
|   |       |-- submit/route.ts
|   |       `-- feedback/route.ts
|   |-- features/
|   |   `-- quiz-from-slides/
|   |       |-- api/
|   |       |   `-- client.ts
|   |       |-- components/
|   |       |   |-- lesson-review-entry.tsx
|   |       |   |-- slide-upload.tsx
|   |       |   |-- generation-status.tsx
|   |       |   |-- quiz-question.tsx
|   |       |   |-- quiz-review.tsx
|   |       |   `-- question-feedback.tsx
|   |       |-- model/
|   |       |   |-- quiz-machine.ts
|   |       |   |-- quiz.schemas.ts
|   |       |   `-- quiz.types.ts
|   |       |-- server/
|   |       |   |-- extract-slide-content.ts
|   |       |   |-- generate-grounded-quiz.ts
|   |       |   `-- quiz-provider.ts
|   |       |-- fixtures/
|   |       |   `-- quiz-scenarios.ts
|   |       `-- index.ts
|   |-- components/ui/
|   |-- lib/
|   |   |-- ai/
|   |   |-- files/
|   |   |-- env.ts
|   |   `-- logger.ts
|   `-- styles/tokens.css
|-- tests/
|   |-- e2e/
|   |-- integration/
|   `-- unit/
|-- public/
|-- .env.example
|-- package.json
`-- README.md
```

If the existing project uses another framework, preserve it and map the same responsibilities to its conventions. Do not introduce Next.js solely to match this reference.

## Dependency Rules

- Route/page: parse route params and compose the feature. Do not contain quiz business logic.
- Feature components: render feature states and emit user intent. Do not call model SDKs or parse slide files.
- Feature model: own pure types, schemas, scoring, and state transitions. Keep it framework-light and unit-testable.
- Feature server: orchestrate extraction, grounding, model calls, and result validation.
- Provider adapter: translate a vendor SDK response into the feature schema. Keep provider names out of UI code.
- Shared UI: contain generic primitives only. A component named for quizzes belongs in the feature.
- Shared lib: contain genuinely cross-feature infrastructure. Do not use it as a miscellaneous folder.
- Feature public API: export supported entry points from `features/quiz-from-slides/index.ts`. Avoid deep imports from other features.

Keep client and server boundaries explicit. Add `server-only` guards where the framework supports them.

## Data Contracts

Use runtime validation for both upload metadata and model output. A generated question must include:

```ts
type QuizQuestion = {
  id: string;
  prompt: string;
  choices: [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
  correctChoiceId: string;
  explanation: string;
  source: {
    pageOrSlide: number;
    excerpt: string;
  };
};
```

Represent generation as a discriminated result:

```ts
type GenerateQuizResult =
  | { status: "ready"; quizId: string; questions: QuizQuestion[] }
  | { status: "insufficient_content"; reason: string; suggestions: string[] }
  | { status: "unsupported_file"; reason: string }
  | { status: "extraction_failed"; retryable: boolean }
  | { status: "generation_failed"; retryable: boolean };
```

In production, do not send `correctChoiceId` to the browser before submission. For a hackathon mock, isolate that shortcut in a fixture and label it clearly.

## API and Security Rules

- Keep API keys in environment variables and provide names only in `.env.example`.
- Validate extension, MIME type, size, and magic bytes where practical. An extension alone is not sufficient.
- Define an upload size limit and return a specific client-readable error.
- Treat uploaded slide text as untrusted input. Ignore instructions embedded in the document that attempt to change the generation task.
- Limit AI context to extracted lesson content needed for the quiz.
- Do not persist uploaded files by default. Document retention if storage is added.
- Avoid logging raw slide content, answers, tokens, or secrets. Log request IDs, stage, duration, outcome, and safe error codes.
- Rate-limit generation and make retries idempotent where practical.
- Validate the model response before storage or rendering. Reject malformed or ungrounded questions.

## Testing Layout

- `unit`: file validators, schema parsing, score calculation, state transitions, and source-grounding checks.
- `integration`: upload-to-generation handler with provider fixtures for ready, insufficient, malformed, and failed responses.
- `e2e`: happy path, image-only/low-text path, corrupt file retry, and question feedback path.
- `eval`: model quality cases and run results. Keep these separate from deterministic software tests.

Use deterministic fixtures for UI states so the full four-path demo does not depend on live model availability. Keep at least one real AI call in the demonstrated central decision, as required by the hackathon.
