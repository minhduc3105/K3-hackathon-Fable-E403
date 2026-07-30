# VLearn Next.js Architecture

## Mục tiêu

Biến prototype VLearn AI Tutor thành một app Next.js có cấu trúc rõ ràng, giữ nguyên luồng hiện có:

`reader -> tạo quiz -> làm bài -> review -> quay lại học liệu`

## Cách chia file

```text
codebase/
|-- app/
|   |-- layout.tsx
|   |-- page.tsx
|   `-- course/[courseId]/reader/page.tsx
|-- src/
|   `-- features/quiz-from-slides/
|       |-- components/
|       |-- data/
|       |-- model/
|       `-- server/
|-- data/vlearn-pack/slides/
`-- docs/design/
```

## Trách nhiệm từng lớp

### `app/`

- Chỉ giữ route và layout.
- Không chứa logic quiz.
- `page.tsx` chỉ redirect vào route demo chính.

### `src/features/quiz-from-slides/model/`

- State shape.
- Quiz score.
- Loại dữ liệu dùng chung giữa server và client.

### `src/features/quiz-from-slides/data/`

- Nội dung demo cố định.
- Câu hỏi mẫu.
- Metadata lesson.

### `src/features/quiz-from-slides/server/`

- Đọc `data/vlearn-pack/slides`.
- Tạo catalog từ file thật.
- Không render UI.

### `src/features/quiz-from-slides/components/`

- Tất cả UI React.
- Chia theo vùng:
  - topbar
  - sidebar
  - flow screens
  - workbench

## Vì sao chia như vậy

- Route mỏng giúp đổi URL mà không chạm business logic.
- Model tách riêng giúp kiểm thử state dễ hơn.
- Server loader giúp `data/vlearn-pack/slides` là nguồn thật, không hardcode.
- Component tách vùng giúp sửa sidebar hoặc quiz mà không đụng reader.

## Điểm mở rộng sau này

1. Thay `data/lesson-fixture.ts` bằng kết quả OCR hoặc extraction thật.
2. Thay `server/load-slide-catalog.ts` bằng parser PDF thật.
3. Tách `flow-screens.tsx` thành từng screen nếu quiz logic lớn hơn.
4. Gắn API route `app/api/quiz/*` khi cần backend thật.
