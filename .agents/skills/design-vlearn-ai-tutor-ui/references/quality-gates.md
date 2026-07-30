# Quality Gates

## Contents

1. AI output contract
2. Product behavior
3. Visual and accessibility pre-flight
4. Engineering checks
5. Hackathon checks

## AI Output Contract

A question passes only when all are true:

- The prompt is answerable from the uploaded source alone.
- Exactly one choice is correct and exactly four choices are present.
- The correct answer and explanation are supported by the cited page or slide.
- Distractors are plausible but not ambiguous, misleading, or outside the lesson scope.
- The wording fits the learner's language and does not test trivia unrelated to the learning objective.
- The citation resolves to a real source location and excerpt.
- The output contains no instructions, secrets, or prompt text from the system.

Reject the entire malformed question rather than repairing correctness fields with guesses. If too few grounded questions remain, return `insufficient_content`.

Minimum scenario coverage:

- Source of truth: missing citation, wrong citation, unsupported correct answer.
- Ambiguity: too little text, contradictory slides, OCR noise, unclear answer boundary.
- Scope: document prompt injection, request for outside knowledge, unsupported file.
- Learning harm: multiple correct choices, misconception reinforced, explanation contradicts answer.

## Product Behavior

- Happy, low-confidence, failure, and correction paths are all reachable.
- Back navigation preserves selected answers.
- Double-clicking generate or submit does not create duplicate requests.
- Cancelling or retrying leads to a coherent state.
- The learner never sees a quiz when the system says the source is insufficient.
- Review distinguishes learner choice, correct choice, explanation, and source.
- Feedback submission never blocks quiz completion.
- No fake progress percentage or unsupported product metric is visible.

## Visual and Accessibility Pre-Flight

- The UI looks embedded in a learning product, not like a landing page or generic dashboard.
- One accent color is consistent; semantic success/warning/error colors are not used decoratively.
- Radius rules are consistent: 8px containers/inputs, 6px buttons, circular icon buttons.
- No nested cards, oversized hero, gradient-orb background, glassmorphism, or three equal feature cards.
- No visible copy describes keyboard shortcuts or explains how the interface was designed.
- All visible Vietnamese copy is proofread and uses one direct register.
- Buttons have one-line labels and adequate contrast.
- Long filenames, questions, and answers wrap without overlap at 320px width.
- Touch targets are at least 44px, focus is visible, and the complete flow works by keyboard.
- Radio groups, fieldsets, headings, error associations, and live regions are semantic.
- Correctness is communicated by text/icon in addition to color.
- Processing and transition motion respects `prefers-reduced-motion`.
- Loading, empty, disabled, error, success, and retry states are implemented.

## Engineering Checks

Run the commands already defined by the repository. At minimum, seek equivalents for:

```text
format check
lint
typecheck
unit tests
integration tests
production build
```

Also verify:

- No model SDK or secret is imported into a client bundle.
- Runtime schemas validate request and provider response boundaries.
- File limits and failure codes are tested.
- Feature code does not leak into shared UI primitives.
- No unrelated refactor or dependency was introduced.
- Browser console and network panel have no unexpected errors in each path.
- Desktop and mobile screenshots show no clipping, overlap, or layout shift.

## Hackathon Checks

- The CP1 seven-line canvas is represented in `spec.md` and names assignment owners and at least three intended willing users.
- The one-sentence slice still matches the built prototype.
- At least four HAX/PAIR principles point to concrete UI locations.
- At least eight risk scenarios cover all four difficulty classes.
- The golden set contains at least 20 cases, including at least two per difficulty class and at least ten derived from permitted real chatlog evidence.
- The quality bar is numeric, committed before the deadline, and not rewritten after observing results.
- At least one real AI call drives the central generation decision; mocked portions are labeled.
- Evaluation logs include failed cases and honest percentages.
- Validation contains at least five named external participants with quotes and one documented product change or a justified decision to keep the design.
- The repository contains `README.md`, `spec.md`, `demo-slides.pdf`, `codebase/`, `eval/`, `validation/`, and `reflection/`.
- No API key, personal information, or full private data pack is committed.
