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

Mở `http://localhost:3002` cho bản demo ổn định hoặc `http://localhost:3000` khi chạy dev.

## Kịch bản demo chính

1. Mở tài liệu đang học trong `Day 5`.
2. Dùng reader để đổi trang, zoom, chuyển chế độ đọc/ghi chú hoặc hỏi VLearn Tutor.
3. Trong panel `VLearn Tutor`, bấm `Tạo câu hỏi ôn tập`.
4. Theo dõi AI đọc chính học liệu đang mở, tạo 4 câu MCQ, làm bài và xem kết quả.
5. Trong review, bấm nguồn của từng câu để quay về đúng slide trong reader.

## Các nhánh trạng thái

- `Day 5 / day05-ai-product-thinking-requirements.pdf`: luồng tạo quiz thành công.
- `Day 1 / whiteboard-scan.pdf`: học liệu toàn ảnh, hiển thị trạng thái chưa đủ căn cứ.
- `Day 2 / day02-legacy-material.pdf`: mô phỏng lỗi trích xuất và cho phép thử lại.

## Cấu trúc Next.js mới

- `app/`: route và layout.
- `src/features/quiz-from-slides/model/`: state machine và type dùng chung.
- `src/features/quiz-from-slides/data/`: mock lesson và câu hỏi.
- `src/features/quiz-from-slides/server/`: đọc `data/vlearn-pack/slides`.
- `src/features/quiz-from-slides/components/`: UI React theo vùng.
- `docs/design/`: tài liệu kiến trúc và state model.

## Nguồn dữ liệu thật

Hai file trong `data/vlearn-pack/slides` được đọc ở server side và hiển thị trong sidebar nguồn dữ liệu. Chúng là catalog thật của prototype, còn quiz flow vẫn dùng mock lesson để demo ổn định.

## Tương tác đã bật

Các nhóm nút topbar, accordion ngày học, chọn học liệu, toolbar reader, chuyển trang, download demo, Tutor, tạo quiz, điều hướng câu hỏi, làm lại, feedback và quay về nguồn đều đã nối với state của prototype.

## Phạm vi prototype

Nội dung AI và trích xuất hiện dùng fixture có kiểm soát để demo ổn định, chưa gọi model hoặc API VLearn thật. Điểm nối adapter thật nằm trong feature `src/features/quiz-from-slides/`.
