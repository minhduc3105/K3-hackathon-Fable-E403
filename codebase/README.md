# VLearn Quiz Prototype — CP2

**Product slice:** Learner uploads lesson slides → AI generates 4-choice MCQs → learner completes quiz → reviews with source citations.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

- `src/app/` — Next.js App Router pages and API routes
- `src/features/quiz-from-slides/` — Quiz feature (components, state, server logic)
- `src/components/ui/` — Shared UI primitives
- `src/lib/` — Shared utilities

## CP2 Status

**Mock level:** Sketch/Mock prototype with deterministic fixtures.
- ✅ Upload → Processing → Quiz → Review flow clicks through
- ✅ Happy, low-confidence, failure, correction paths reachable
- ⏳ AI call (CP3 requirement) — provider adapter slot prepared, will connect OpenAI/OpenRouter

**Mocked parts:**
- Slide extraction (returns fixture text)
- Quiz generation (returns fixture questions)

Real AI integration comes at CP3.
