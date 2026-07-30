# Product UI Blueprint

## Contents

1. Experience principles
2. Screen inventory
3. State and interaction contract
4. Visual system
5. Responsive and accessibility rules
6. Product copy

## Experience Principles

- Keep the learner inside the existing lesson context. The self-check starts beside the completed lesson controls, not on a new landing page.
- Make the source visible. Every reviewed answer points back to a page or slide and a short supporting excerpt.
- Calibrate trust. Say what the system used, what it could not read, and what the learner can do next.
- Preserve momentum. Show one question at a time, keep answer targets stable, and never interrupt the quiz with promotional or explanatory panels.
- Do not equate quiz score with mastery. Present it as a quick recall check.
- Let the learner skip AI output, cancel processing, retry a failed file, and flag a questionable item.

Use these HAX/PAIR mappings:

| Principle | Concrete location |
|---|---|
| HAX G1, clarify capability | Upload heading says supported file types and that questions use only the uploaded lesson |
| HAX G2, clarify quality | Review shows source page/slide and flags content that could not be read |
| HAX G10, scope under uncertainty | Insufficient-content state refuses to generate and asks for a text-readable file |
| HAX G8/G9, dismiss and correct | Learner can skip a question and flag it without blocking completion |
| HAX G11, explain why | Each reviewed answer includes a concise explanation and source excerpt |
| PAIR graceful failure | Extraction and model failures have distinct messages and recovery actions |

## Screen Inventory

### Lesson Entry

- Place `Tự kiểm tra bài học` near the existing next-lesson or lesson-complete action.
- Keep the lesson title and course context visible.
- Use one sentence of support at most: `Tạo một bài kiểm tra ngắn từ slide của buổi học.`

### Upload

- Show a real file input with drag-and-drop as enhancement, never as the only method.
- Accept `.pdf`, `.ppt`, and `.pptx`; show the configured size limit before selection.
- Display selected filename, type, and readable file size.
- Primary action: `Tạo câu hỏi`.
- Secondary action: `Quay lại bài học`.
- Validate type, size, empty file, and duplicate submission before upload.

### Processing

- Keep a stable panel size to prevent layout shift.
- Show honest stages: `Đang đọc slide`, `Đang chọn nội dung chính`, `Đang tạo câu hỏi`.
- Do not show fake percentages unless the backend reports measurable progress.
- Offer `Hủy` without implying that the model call always stops immediately.

### Quiz

- Show progress as `Câu 2 / 6`, not a decorative filled track.
- Present one question and exactly four answer choices.
- Use radio semantics for a single answer. The entire answer row is clickable.
- Disable `Tiếp tục` until an answer is selected, but keep the disabled reason obvious.
- Do not reveal correctness before submission unless the product explicitly chooses immediate feedback.
- Preserve answers when moving backward.

### Review

- Lead with `Bạn nhớ đúng X/Y câu`, followed by `Đây là kiểm tra nhanh, không phải đánh giá mức độ thành thạo.`
- For each item show the learner answer, correct answer, short explanation, and `Nguồn: trang/slide N`.
- Let the learner open the source context and flag `Câu hỏi chưa chính xác`.
- Keep `Hỏi AI Tutor` contextual to a reviewed question if that integration already exists. Do not build a second tutor.

### Insufficient Content

- Title: `Chưa đủ nội dung để tạo câu hỏi`.
- Explain the detected issue plainly, for example `Tệp chủ yếu là hình ảnh hoặc có quá ít chữ rõ ràng.`
- Actions: `Chọn tệp khác` and `Quay lại bài học`.
- Suggest an OCR-enabled or text-readable export. Do not generate speculative questions.

### Failure

- Distinguish unsupported file, unreadable/corrupt file, network failure, extraction failure, and generation failure.
- Preserve the selected file when retry is safe.
- Never use a generic `Có lỗi xảy ra` as the complete message.

### Correction

- Open a small dialog or inline disclosure from the review item.
- Reasons may include `Không có trong slide`, `Đáp án chưa rõ`, and `Câu hỏi khó hiểu`.
- Submission must not block review. Confirm receipt inline and allow the learner to continue.

## State and Interaction Contract

Use a discriminated union or reducer. Each state owns only the data it needs. Prevent double submission while uploading, generating, or submitting.

Required transitions:

```text
idle -> validating -> uploading -> extracting -> generating -> ready
ready -> answering -> submitting -> reviewed
validating -> unsupported-file
extracting -> insufficient-content | extraction-failed
generating -> insufficient-content | generation-failed
reviewed -> correction-open -> reviewed
any-processing-state -> cancelled -> idle
```

Never fabricate intermediate progress. Use stage transitions driven by real client/server events or label the prototype stages as simulated fixtures.

## Visual System

- Tone: calm, academic, direct, and native to an existing learning platform.
- Typography: use the existing VLearn typeface. For greenfield Vietnamese UI, prefer `Be Vietnam Pro` with tabular numerals for quiz progress.
- Palette: cool neutral surfaces, graphite text, one cobalt accent. Reserve green, amber, and red for semantic feedback only.
- Shape rule: 8px cards/inputs, 6px buttons, circular icon buttons. Do not use large pill containers.
- Elevation: one subtle shadow only for dialogs or elevated overlays. Separate page regions with spacing and borders.
- Cards: use a card for the active question or file item only when it communicates grouping. Do not wrap every section in a card.
- Motion: 120-180ms opacity/transform transitions for state feedback. No perpetual animation. Honor reduced motion.
- Icons: use the project's existing family; otherwise use Lucide consistently. Do not draw SVG paths manually.

## Responsive and Accessibility Rules

- Desktop content width: 720-880px for the quiz task. Keep lesson navigation outside that reading column.
- Mobile: single column, 16px page padding, answer targets at least 44px high, sticky bottom action only when it does not cover content.
- Keep filenames and long Vietnamese words from overflowing. Use wrapping or middle truncation with the full filename in accessible text.
- Use semantic headings, fieldsets, legends, radio groups, progress announcements, and an `aria-live="polite"` region for processing stages.
- Move focus to the new screen heading after major state transitions and to the first invalid field after validation failure.
- Ensure visible focus, WCAG AA contrast, keyboard completion, and no color-only correctness cues.
- Announce correct/incorrect using text and icon; do not rely only on green/red borders.

## Product Copy

Use concise Vietnamese. Prefer concrete verbs over AI marketing language.

| Intent | Preferred copy |
|---|---|
| Start | `Tự kiểm tra bài học` |
| Generate | `Tạo câu hỏi` |
| Processing | `Đang đọc slide` |
| Next | `Tiếp tục` |
| Submit | `Nộp bài` |
| Source | `Xem nguồn trong slide` |
| Flag | `Câu hỏi chưa chính xác` |
| Retry | `Thử lại` |

Avoid claims such as `AI hiểu toàn bộ slide`, `đánh giá chính xác mức độ hiểu`, or any unsupported percentage.
