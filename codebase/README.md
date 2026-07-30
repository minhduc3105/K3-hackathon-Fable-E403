# VLearn AI Tutor Prototype

Prototype cho lát cắt:

```text
Mở học liệu trong VLearn -> AI đọc tài liệu đang học -> sinh MCQ 4 đáp án -> học viên làm ngay trong reader
```

Không có bước upload thủ công. Tài liệu đang được chọn trong sidebar là nguồn duy nhất để tạo quiz.

## Chạy local

Từ thư mục `codebase/`:

```powershell
npm install
npm run build
npm run start -- --port 3002
```

Nếu cần sửa UI trong lúc phát triển:

```powershell
npm run dev
```

Mở `http://localhost:3002`. Route gốc tự chuyển tới reader của bài học.

## Kịch bản demo chính

1. Mở reader; chọn `d1-slide-hackathon.pdf` hoặc `d2-slide-hackathon.pdf` trong panel học liệu.
2. Dùng reader để đổi trang, zoom, chuyển chế độ đọc/ghi chú hoặc hỏi VLearn Tutor.
3. Trong panel `VLearn Tutor`, bấm `Tạo câu hỏi ôn tập`.
4. Theo dõi AI đọc chính học liệu đang mở, tạo 4 câu MCQ, làm bài và xem kết quả.
5. Trong review, bấm nguồn của từng câu để quay về đúng slide trong reader.

## Các nhánh trạng thái

Các nhánh UI rủi ro dùng fixture deterministic để demo không phụ thuộc provider; happy path vẫn gọi OpenRouter thật:

- Happy path: `http://localhost:3002/`.
- Low-confidence: thêm `demoScenario=insufficient` vào URL reader.
- Failure: thêm `demoScenario=failure` vào URL reader.
- Correction: chạy happy path, nộp bài rồi flag một câu trong màn hình review.

Ví dụ URL low-confidence:

```text
http://localhost:3002/course/comp2010/reader?lectureId=Lecture_material_ms204v3b_r9mo78&materialId=day05-requirements&demoScenario=insufficient
```

## Cấu trúc Next.js mới

- `app/`: route và layout.
- `src/features/quiz-from-slides/model/`: state machine và type dùng chung.
- `src/features/quiz-from-slides/data/`: mock lesson và câu hỏi.
- `src/features/quiz-from-slides/server/`: đọc `data/vlearn-pack/slides`.
- `src/features/quiz-from-slides/components/`: UI React theo vùng.
- `docs/design/`: tài liệu kiến trúc và state model.

## Nguồn dữ liệu và AI thật

Hai file trong `data/vlearn-pack/slides` do ban tổ chức cấp được đọc ở server side và hiển thị trong sidebar nguồn dữ liệu. Data pack được giữ cục bộ và bị loại khỏi Git theo quy định bảo mật; sau khi clone, thành viên có quyền truy cập cần đặt lại pack vào `data/vlearn-pack/`. Khi pack chưa có, prototype dùng catalog fallback để UI vẫn khởi động nhưng route PDF không có file để trả về.

Ở CP3, extraction được mock bằng các excerpt ngắn có kiểm soát từ data pack. Quyết định đủ căn cứ và bốn câu MCQ được tạo qua OpenRouter tại server route `app/api/quiz/generate/route.ts`. Output chỉ được đưa tới UI sau khi vượt qua schema và kiểm tra source excerpt nguyên văn.

Sao chép `.env.example` thành `.env.local` và điền `OPENROUTER_API_KEY`. Không commit file `.env.local`.

Chạy eval CP3 khi server dùng port 3002:

```powershell
$env:EVAL_BASE_URL="http://localhost:3002"
npm run eval:check
npm run eval:cp3
```

Kiểm tra toàn bộ gate bài nộp có thể tự động hóa:

```powershell
npm run rubric:check
```

## Tương tác đã bật

Các nhóm nút topbar, accordion ngày học, chọn học liệu, toolbar reader, chuyển trang, download demo, Tutor, tạo quiz, điều hướng câu hỏi, làm lại, feedback và quay về nguồn đều đã nối với state của prototype.

## Phạm vi prototype

Prototype ở mức Mock: catalog và excerpt nguồn dùng data pack, extraction dùng fixture có kiểm soát, còn generation qua OpenRouter là lời gọi AI thật. Hệ thống chưa tích hợp API VLearn production và không chấm điểm học phần.
