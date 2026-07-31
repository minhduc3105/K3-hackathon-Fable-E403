# AI SPEC - VLearn Recall Check

Hướng: A - VLearn
Loại: Tối ưu tính năng có sẵn
Nhóm / Zone: `Fable-E403` (suy ra từ tên repository; nhóm cần xác nhận nếu hệ thống dùng mã khác)

## §1. User & Job

- Job executor: học viên vừa học xong hoặc vừa đọc xong một đoạn slide trong VLearn.
- Core JTBD: sau khi học xong một phần, học viên muốn kiểm tra mình còn nhớ đúng ý chính nào trước khi chuyển sang nội dung tiếp theo.
- Problem statement: học viên đang đọc slide nhưng chưa có một bước tự kiểm tra nhanh, có căn cứ ngay trong reader; việc tự nghĩ câu hỏi hoặc chuyển sang công cụ khác làm đứt mạch học và khó biết câu trả lời có bám bài hay không.
- Evidence mining chuẩn B: `evidence/mining-log.md`; phương pháp có thể chạy lại bằng `node evidence/analyze-chatlog.mjs`.
  - Data pack có 1.261 lượt hỏi của 369 user trong 585 hội thoại.
  - 1.074 turn `review_concept` đến từ 326 user; 448 câu trả lời trong nhóm này thiếu citation.
  - 134 yêu cầu khớp tóm tắt/ôn tập tường minh đến từ 98 user; 87 câu trả lời thiếu citation.
  - Toàn bộ Tutor có 582/1.261 câu trả lời thiếu citation (46,2%); đây là tín hiệu về nhu cầu grounding, không phải tuyên bố rằng mọi học viên muốn quiz.
  - Năm ví dụ nguyên văn có mã đối chiếu: `T0663`, `T0896`, `T1201`, `T1190`, `T0984`.

## §2. Impact & quyết định chọn

| Ứng viên | Bao nhiêu người | Tần suất | Tổn thất mỗi lượt / proxy đo được | Quyết định |
|---|---:|---:|---:|---|
| Quiz tự kiểm tra từ slide | 326 user có turn `review_concept` | 1.074 turn; 3,29 turn/user | Mỗi lượt thiếu nguồn buộc tự dò lại slide; xảy ra 448/1.074 lượt (41,7%) | Chọn: output hẹp, có source và đo được |
| Tự động tóm tắt toàn bộ bài | 98 user khớp quy tắc tóm tắt/ôn tập | 134 turn; 1,37 turn/user | Mỗi lượt thiếu nguồn không kiểm chứng được bản tóm tắt; xảy ra 87/134 lượt (64,9%) | Loại: độ phủ thấp hơn và ít tạo recall chủ động |
| Xây lại AI Tutor hỏi đáp mở | 369 user | 1.261 turn; 3,42 turn/user | Mỗi lượt thiếu nguồn buộc tìm lại căn cứ; xảy ra 582/1.261 lượt (46,2%) | Loại: đã tồn tại, phạm vi rộng và khó đo |

- Ứng viên chọn: quiz tự kiểm tra có source, vì proxy nhu cầu ôn/giải thích phủ 326 user và quyết định AI đủ hẹp để đo bằng schema, grounding và refusal.
- Ứng viên loại được giữ lại cùng lý do bằng số trong bảng; log và quy tắc đếm nằm tại `evidence/mining-log.md`.

## §3. Giải pháp tương tự đã nghiên cứu

- VLearn Tutor hiện tại: đáng giữ luồng hỏi theo slide; cần cải thiện source trust và fallback.
- Quiz thủ công trong LMS: đáng học ở cấu trúc một câu, bốn lựa chọn; điểm khác là câu hỏi được tạo có điều kiện từ nguồn đang mở.

## §4. Thiết kế

- Lát cắt một câu: một học viên vừa đọc slide chọn 4, 6 hoặc 8 câu rồi bấm tự kiểm tra; AI quyết định nguồn có đủ căn cứ và tạo đúng số MCQ đã chọn; học viên làm và xem đáp án kèm nguồn ngay trong VLearn.
- Non-goals:
  - Không thay thế VLearn Tutor.
  - Không chấm mức độ thành thạo hoặc tính điểm học phần.
  - Không tạo câu hỏi từ kiến thức ngoài học liệu.
  - Không xây dashboard, leaderboard hoặc công cụ soạn bài cho giảng viên.
- Mức prototype: Mock.
  - Thật: lời gọi Gemini ở quyết định đủ căn cứ và sinh đúng số MCQ người học chọn; schema validation; kiểm tra excerpt nguyên văn; flow làm bài và review.
  - Mock có kiểm soát: extraction PDF được thay bằng các excerpt ngắn từ data pack, có nhãn slide; hai trạng thái low-confidence/failure có fixture deterministic qua query `demoScenario`; chưa upload hoặc OCR file tùy ý.
- Automation: conditional.
  - Cost-of-error là học viên ghi nhớ sai kiến thức.
  - Hệ thống chỉ tạo quiz khi có thể sinh đủ 4, 6 hoặc 8 câu theo lựa chọn, mỗi câu có source; nếu không thì từ chối có lý do.

### §4b. Nguyên tắc áp dụng

| Nguyên tắc | Vị trí trong prototype |
|---|---|
| HAX G1 - Làm rõ khả năng | Processing ghi nguồn duy nhất đang được dùng |
| HAX G2 - Làm rõ chất lượng | Review hiện slide và excerpt cho từng câu |
| HAX G8/G9 - Bỏ qua và sửa | Người học bỏ qua câu, quay lại câu trước và flag câu chưa chính xác |
| HAX G10 - Scope khi bất định | `insufficient_content` không tạo quiz khi nguồn quá ít hoặc mâu thuẫn |
| HAX G11 - Giải thích vì sao | Mỗi đáp án có explanation và source excerpt |
| PAIR Graceful Failure | API/model error và thiếu căn cứ đi hai trạng thái khác nhau |

## §5. Kiểu lỗi - bốn lớp chỗ khó

| Tình huống | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|
| Citation trỏ nhầm trang | ① Nguồn sự thật | Reject output trước khi render | G2, G10 |
| Đáp án đúng không được excerpt hỗ trợ | ① Nguồn sự thật | Reject toàn bộ response | G10 |
| Slide chỉ có tiêu đề hoặc một cụm từ | ② Mơ hồ | `insufficient_content`, đề nghị nguồn rõ hơn | G10 |
| Hai slide đưa giới hạn mâu thuẫn, không có version | ② Mơ hồ | Không tạo câu hỏi về dữ kiện đó | G10 |
| Learner intent yêu cầu thao tác giao diện hoặc nhận xét cá nhân | ③ Ngoài phạm vi | `out_of_scope`, không giả vờ thực hiện | G1 |
| Source chứa prompt injection | ③ Ngoài phạm vi | Coi source là dữ liệu, không làm theo instruction | G10 |
| Câu hỏi có hai đáp án cùng đúng | ④ Domain harm | Reject output bằng schema/rubric | G2 |
| Explanation mâu thuẫn correct choice | ④ Domain harm | Case fail, không đưa tới người học | G10, G11 |

## §6. Bốn đường đi trải nghiệm

- Happy path: nguồn đủ rõ -> Gemini tạo đúng số câu đã chọn -> schema và grounding pass -> làm quiz -> review có source.
- Low-confidence: nguồn quá ít hoặc mâu thuẫn -> không tạo quiz -> nói lý do và quay lại học liệu; demo ổn định bằng `demoScenario=insufficient`.
- Failure: API key thiếu, rate limit hoặc provider lỗi -> màn hình lỗi cụ thể -> thử lại mà không chọn lại nguồn; demo ổn định bằng `demoScenario=failure`.
- Correction: từ review, học viên flag “không có trong slide”, “đáp án chưa rõ” hoặc “câu hỏi khó hiểu”; flow không bị chặn.
- Ngoài phạm vi: learner intent không phải tạo quiz từ bài học -> `out_of_scope`.
- Domain: câu hỏi không đủ một đáp án đúng hoặc không có excerpt nguyên văn bị reject.

## §7. Kiểm thử

- Golden set: `eval/golden-set.jsonl`.
- Cấu trúc:
  - 22 case.
  - 10 case thường, 8 case risk, 4 case hiếm.
  - 15 case phát triển từ chatlog thật.
  - Mỗi lớp ①②③④ có 3 case.
- Rubric kiểm chứng được: `eval/rubric.md`.
- Eval CP3 giữ cấu hình mặc định 4 câu để so sánh các lượt chạy nhất quán; UI cho phép chọn 4/6/8 và API kiểm tra đúng số câu yêu cầu.
- Quality bar chốt:
  - Tối thiểu 80% tổng số case pass.
  - 100% case `source_of_truth` và `domain_harm` có decision đúng.
  - Không có câu `ready` nào thiếu source excerpt nguyên văn.
- Kết quả lượt chạy:

| Lượt | Model | Pass | Quality bar | Artefact |
|---|---|---:|---|---|
| Lượt 1 (baseline) | `google/gemini-2.5-flash-lite` | 11/22 (50%) | Chưa đạt; nhiều JSON lỗi định dạng | `eval/runs/run-2026-07-30T09-09-40-355Z.md` |
| Lượt 2 (chính thức) | `google/gemini-2.5-flash-lite` | 22/22 (100%) | Đạt; critical 100%, grounding failure 0 | `eval/runs/run-2026-07-30T09-14-21-134Z.md` |

Không điền số giả. Bảng này chỉ cập nhật từ file run do `npm run eval:cp3` tạo.

## §8. Phân công & kế hoạch

- Spec: Trần Huy Hoàng.
- Evidence: Trần Huy Hoàng; cả nhóm đối chiếu ví dụ nguyên văn.
- Prompt + golden set: Trần Huy Hoàng.
- Code + eval runner: Trần Huy Hoàng.
- Product UI + accessibility: Lã Minh Đức.
- Prototype flow/components: Lâm Việt Hoàng.
- Tích hợp CP3 + demo: Phó Viết Tiến Anh.
- Willing users: Bùi Hữu Nghĩa, Hà Nhật Khánh Duy, Đinh Xuân Huy.
- Multi-prototype: đã chọn conditional generation thay cho luôn tạo quiz; lý do là cost-of-error của câu hỏi sai cao hơn lợi ích của việc luôn có output.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| CP2 | Dựng flow reader -> processing -> quiz -> review | Chứng minh flow chính bấm được |
| CP3 | Thay fixture generation bằng Gemini server call | Đưa AI thật vào quyết định trung tâm |
| CP3 | Thêm schema, excerpt grounding và ba decision state | Ngăn câu hỏi không có căn cứ |
| CP3 | Thêm 22-case golden set và runner lưu mọi output | Đủ artefact đo lượt đầu, kể cả case fail |
| Sau CP4 | Làm phẳng visual system, giảm radius/shadow và thay Unicode bằng Phosphor icons | Phản hồi trực tiếp từ nhóm: giao diện cũ bo tròn nhiều, tạo cảm giác “nhựa” |
| Sau CP4 | Thêm lựa chọn 4/6/8 câu xuyên suốt UI -> API -> prompt -> schema | Cho người học điều chỉnh độ dài bài ôn; vẫn từ chối nếu nguồn không đủ số mục tiêu độc lập |
