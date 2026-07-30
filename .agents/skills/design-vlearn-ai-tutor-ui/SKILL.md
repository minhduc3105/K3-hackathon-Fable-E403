---
name: design-vlearn-ai-tutor-ui
description: Design, implement, or review the VLearn AI Tutor slide-to-quiz product experience and its frontend project structure. Use for VLearn screens, upload-to-MCQ flows, post-lesson self-check UX, AI loading/low-confidence/error/correction states, feature-first React or Next.js architecture, design tokens, accessibility, responsive behavior, and hackathon-ready prototype organization.
---

# Design VLearn AI Tutor UI

Build a focused product workflow for a learner who has just finished a lesson and wants to check what they remember without leaving VLearn. Treat this as a learning tool, not a marketing page or a generic AI dashboard.

## Product Contract

Keep this slice fixed unless the user explicitly changes it:

- User: a learner who has just finished the lesson slides.
- Job: check recall before asking the tutor.
- Slice: upload a PDF, PPT, or PPTX; extract the lesson content; generate MCQs with exactly four choices; complete the quiz inside VLearn.
- Automation: conditional. Generate only when the extracted source is clear enough. Otherwise explain the limitation and offer a concrete recovery action.
- Cost of error: a grounded refusal is better than a confident question that teaches the wrong concept.
- Evidence status: treat "100% of learners" as a hypothesis until a survey or auditable log supports it. Never present it as product copy by default.

## Inherited Design Direction

Apply the useful product-safe parts of `design-taste-frontend`: declare a design read, set explicit dials, use one visual system, avoid AI-purple decoration and template-like card grids, implement complete states, and run a mechanical pre-flight check.

Override its landing-page assumptions. This is a multi-step product UI, so optimize for orientation, state clarity, keyboard access, source trust, and fast repeated use.

Default read:

`Reading this as: an embedded learning workflow for Vietnamese learners, with a calm and trustworthy product language, leaning toward feature-first React/Next.js, semantic design tokens, and restrained feedback motion.`

Default dials:

- `DESIGN_VARIANCE: 5` - orderly with one asymmetric detail where it improves focus.
- `MOTION_INTENSITY: 3` - feedback and state transitions only.
- `VISUAL_DENSITY: 6` - compact enough for study, with one clear primary action.

## Load References

- Read [product-ui.md](references/product-ui.md) before designing screens, writing product copy, or implementing the flow.
- Read [project-architecture.md](references/project-architecture.md) before creating or moving code, choosing boundaries, or scaffolding the prototype.
- Read [quality-gates.md](references/quality-gates.md) before reviewing, testing, or declaring the experience complete.

## Workflow

### 1. Audit Before Editing

Inspect the repository, framework, package manager, routes, design tokens, component library, icon library, and current VLearn learning flow. Preserve established conventions when they exist. If the repository has no app yet, use the default architecture in `references/project-architecture.md`.

State the design read and three dials before implementation. Name whether the task is greenfield, preserve, or overhaul.

### 2. Model the Experience as States

Define a discriminated state model before laying out screens. Cover at least:

`idle -> validating -> uploading -> extracting -> generating -> ready -> answering -> submitting -> reviewed`

Add explicit exits for `insufficient-content`, `unsupported-file`, `extraction-failed`, `generation-failed`, and user cancellation. Do not model the workflow as a collection of unrelated booleans.

### 3. Design Four Paths

Make all four paths reachable in the prototype:

1. Happy path: valid slide deck, grounded quiz, answer, submit, review.
2. Low-confidence path: too little clear text or image-only slides, no quiz generated, actionable recovery.
3. Failure path: unsupported/corrupt file or service failure, retry without losing context.
4. Correction path: learner flags a question, sees its source, and can continue without being blocked.

Do not add analytics dashboards, tutor chat replacement, class leaderboards, spaced repetition, or teacher authoring unless explicitly requested.

### 4. Establish Boundaries

Use a thin route that composes one feature. Keep presentation, state, validation schemas, AI orchestration, extraction, and provider adapters separate. Keep secrets and model calls server-side. Validate every provider response with a schema before it reaches the UI.

Use the feature tree and dependency rules in `references/project-architecture.md`. Adapt names to the existing framework without weakening the boundaries.

### 5. Implement the Vertical Slice

Build in this order:

1. In-lesson entry action after slide completion.
2. File selection and local validation.
3. Processing state with honest stage labels.
4. One-question-at-a-time quiz with four stable answer targets.
5. Submission and source-grounded review.
6. Low-confidence, failure, and correction paths.
7. Responsive, keyboard, screen-reader, and reduced-motion behavior.

Prefer existing primitives and icon packages. Use one icon family. Use icons for familiar controls and icon-plus-text for consequential commands. Add tooltips for unfamiliar icon-only controls.

### 6. Verify Behavior and Presentation

Run the repository's formatter, type checker, tests, and production build. Exercise every state with deterministic fixtures before connecting the live model. When a browser test tool is available, capture desktop and mobile screenshots and check for clipping, overlap, layout shift, and blank states.

Use the quality gates in `references/quality-gates.md`. Report which checks ran and any residual risk.

## Output Expectations

For design-only work, provide the state model, screen inventory, interaction rules, tokens, responsive behavior, and folder plan.

For implementation work, edit the code, add focused tests, run verification, and keep the dev server running when the application requires one. Label mock data and mocked adapters in code and in the final summary.

For reviews, lead with concrete findings ordered by severity and cite files and lines. Treat missing low-confidence, failure, correction, or source-grounding behavior as product defects rather than optional polish.
