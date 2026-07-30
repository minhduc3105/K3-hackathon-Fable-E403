# CP2 - Prototype bấm được

## Checklist theo rubric

- [x] Prototype mức Mock có flow chính bấm đi hết: reader -> processing -> quiz -> review.
- [x] Nút `Tạo câu hỏi ôn tập` được nối với handler, không phải UI tĩnh.
- [x] Người học làm từng câu, quay lại, bỏ qua, nộp bài và xem nguồn.
- [x] Có correction path: flag câu hỏi trong review mà không chặn hoàn thành.
- [x] Có commit đầu: `35983a84902739f03aacf09dfb57cd87d239d913`.

Thời điểm nộp checkpoint được xác minh bằng hệ thống nộp bài của khoá. Commit trên có thời gian `2026-07-30 12:36:18 +07:00`; tài liệu này không tự suy diễn trạng thái đúng hạn.

## Cách show cho TA

1. Chạy bản production:

   ```powershell
   cd codebase
   npm install
   npm run build
   npm run start -- --port 3002
   ```

2. Mở `http://localhost:3002/`.
3. Bấm `Tạo câu hỏi ôn tập`, chọn đáp án cho bốn câu và nộp bài.
4. Trong review, mở nguồn và flag một câu hỏi.
5. Chỉ commit CP2:

   ```powershell
   git show --stat 35983a8
   ```
