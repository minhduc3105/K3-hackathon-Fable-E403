# Rubric audit

Đối chiếu từng dòng theo `04-rubric.md`. Chỉ đánh dấu đạt khi có artifact kiểm tra lại được; placeholder không phải bằng chứng. Chạy `cd codebase && npm run rubric:check` để kiểm tra các gate máy có thể xác minh.

| Mã | Điều kiện rubric | Điểm | Trạng thái hiện tại | Bằng chứng gốc / việc còn thiếu |
|---|---|---:|:---:|---|
| R1.1 | Evidence chuẩn A và/hoặc B | 6 | Đạt | `evidence/mining-log.md`: 2.522 message, 1.261 turn, 369 user; 5 ví dụ nguyên văn; `evidence/analyze-chatlog.mjs` chạy lại được với data pack cấp riêng |
| R1.2 | Pain cụ thể ai - việc - vướng - hậu quả | 3 | Đạt | `spec.md` §1 |
| R1.3 | Impact ≥3 ứng viên có số | 3 | Đạt | `spec.md` §2: 326/98/369 user, tần suất và số câu thiếu citation |
| R1.4 | Giữ ứng viên loại + lý do bằng số | 3 | Đạt | `spec.md` §2 và `evidence/mining-log.md` |
| R2.1 | Lát cắt đúng format một câu | 3 | Đạt | `spec.md` §4; khớp flow reader → AI → 4 MCQ → review |
| R2.2 | ≥3 non-goals, build không vi phạm | 2 | Đạt | `spec.md` §4 có 4 non-goals |
| R2.3 | Automation + cost-of-error | 4 | Đạt | Conditional automation, từ chối khi không đủ căn cứ; `spec.md` §4 |
| R2.4 | ≥4 HAX/PAIR trỏ vào prototype | 6 | Đạt | 6 mapping tại `spec.md` §4b; màn processing/review/flag/insufficient/error |
| R3.1 | 4 lớp chỗ khó cụ thể | 4 | Đạt | `spec.md` §5 |
| R3.2 | ≥8 kịch bản phủ đủ 4 lớp | 4 | Đạt | 8 dòng tại `spec.md` §5 |
| R3.3 | 4 đường trải nghiệm | 3 | Đạt | `spec.md` §6; happy, `demoScenario=insufficient`, `demoScenario=failure`, correction trong review |
| R4.1 | Golden set ≥20, đúng cơ cấu | 4 | Đạt | `eval/golden-set.jsonl`: 22 case; 10 normal/8 risk/4 rare; 15 chatlog; 3 case mỗi lớp khó |
| R4.2 | Rubric chất lượng kiểm chứng được | 4 | Đạt | `eval/rubric.md`, `eval/check-golden-set.mjs` |
| R4.3 | Quality bar số, commit trước 23:59 N1 | 3 | Đạt về artifact | `spec.md` §7 xuất hiện trong commit `4ea9c42` lúc 16:49:37 +07 ngày 30/07/2026; trạng thái nộp đúng hạn vẫn do hệ thống khoá xác minh |
| R4.4 | Run trọn bộ, có % và fail | 4 | Đạt | Baseline 11/22 (50%) giữ đủ case; run chính thức 22/22 (100%); `eval/runs/` |
| R5.1 | End-to-end, không can thiệp tay | 3 | Đạt | `codebase/`; `CP2.md` |
| R5.2 | ≥1 AI thật + trace; mock ghi rõ | 3 | Đạt | `app/api/quiz/generate/route.ts`, OpenRouter provider, trace trong API/run; mock tại `spec.md` §4 |
| R5.3 | Mức prototype khớp thực tế | 2 | Đạt | Khai báo Mock; AI/schema/grounding thật, extraction và demo scenarios mock |
| R6.1 | ≥5 feedback/5 người; ≥2 willing; quote+tên/vai | 4 | **Chưa đạt** | `validation/feedback-log.md` đang chờ 5 phiên test thật |
| R6.2 | ≥1 thay đổi hoặc giữ có căn cứ | 4 | **Chưa đạt** | Chờ kết quả validation để sửa build và ghi changelog |
| R7.1 | Repo đủ cấu trúc chuẩn | 2 | **Chưa đạt** | Thiếu `demo-slides.pdf`, reflection thật và validation thật; data pack cần bỏ khỏi index bài nộp |
| R7.2 | README phân công có tên | 1 | **Chưa đạt** | Chờ nhóm xác nhận tên, mã HV và trách nhiệm |

Tổng artifact hiện có bằng chứng: **62/75**. 13 điểm còn lại phụ thuộc dữ liệu người thật và deck final; không được thay bằng nội dung AI tự tạo.

## Checkpoint

| Mốc | Artifact | Trạng thái nội dung | Ghi chú |
|---|---|---|---|
| CP1 | `spec.md` canvas | Chưa đủ | Thiếu nhóm/Zone, tên phân công và ≥3 willing users xác nhận |
| CP2 | `CP2.md`, commit `35983a8` | Đạt | Trạng thái đúng hạn phụ thuộc log nộp của hệ thống khoá |
| CP3 | `CP3.md`, `eval/` | Đạt | AI thật + 22 case + bảng baseline có % |
| CP4 | `spec.md` | Gần đạt | R1-R5 đủ; cần dữ liệu người thật cho các phần tên |
| CP5 | `validation/`, `demo-script.md`, slide, dry run | Chưa đạt | Protocol và script đã có; chờ validation thật, deck final và dry run có bấm giờ |
