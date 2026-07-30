# CP3 - AI thật + đo lượt đầu

## Checklist theo rubric

- [x] Lời gọi Gemini thật ở quyết định trung tâm: `codebase/app/api/quiz/generate/route.ts`.
- [x] API key chỉ đọc từ `OPENROUTER_API_KEY`, không có secret trong repo.
- [x] Output model được kiểm tra schema và source excerpt trước khi tới UI.
- [x] Phần thật / mock được khai báo trong `spec.md` §4.
- [x] Golden set có 22 case và vượt yêu cầu nguồn chatlog.
- [x] Có rubric chấm deterministic tại `eval/rubric.md`.
- [x] Có runner giữ output đầy đủ, trace, latency và phần trăm.
- [x] Chạy lượt chính thức với API key thật và lưu hai file kết quả trong `eval/runs/`.

## Kết quả chính thức

- Model: `google/gemini-2.5-flash-lite`.
- Kết quả: **22/22 (100%)**; critical decision accuracy **100%**; grounding failure **0**.
- Token: 6.546 input + 13.389 output; chi phí ước tính theo giá niêm yết là **$0.00601**.
- Artefact: `eval/runs/run-2026-07-30T09-14-21-134Z.json` và `eval/runs/run-2026-07-30T09-14-21-134Z.md`.

## Cách chạy

1. Tạo `codebase/.env.local`:

   ```text
   OPENROUTER_API_KEY=<key của nhóm>
   OPENROUTER_MODEL=google/gemini-2.5-flash-lite
   ```

2. Từ `codebase/`, chạy:

   ```powershell
   npm run build
   npm run start -- --port 3002
   ```

3. Ở terminal khác, vẫn trong `codebase/`:

   ```powershell
   $env:EVAL_BASE_URL="http://localhost:3002"
   npm run eval:check
   npm run eval:cp3
   ```

4. Không sửa tay file kết quả. Runner tự tạo:

   - `eval/runs/run-<timestamp>.json`: output đầy đủ cho mọi case.
   - `eval/runs/run-<timestamp>.md`: bảng kết quả và phần trăm.

## Phần cần show cho TA

1. Bấm `Tạo câu hỏi ôn tập` và mở network response để chỉ `traceId`, `model`, bốn câu và source.
2. Mở `eval/golden-set.jsonl`, chỉ cơ cấu 10 normal + 8 risk + 4 rare.
3. Mở file run Markdown, chỉ phần trăm tổng, critical decision accuracy và mọi case fail.
4. Nói rõ extraction đang mock có kiểm soát; generation và quyết định đủ căn cứ là AI thật.
