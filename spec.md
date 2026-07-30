# AI SPEC - VLearn Recall Check

Hướng: A - VLearn
Loại: Tối ưu tính năng có sẵn
Nhóm / Zone: `[CẦN NHÓM CUNG CẤP]`

## §1. User & Job

- Job executor: học viên vừa học xong hoặc vừa đọc xong một đoạn slide trong VLearn.
- Core JTBD: sau khi học xong một phần, học viên muốn kiểm tra mình còn nhớ đúng ý chính nào trước khi chuyển sang nội dung tiếp theo.
- Problem statement: học viên đang đọc slide nhưng chưa có một bước tự kiểm tra nhanh, có căn cứ ngay trong reader; việc tự nghĩ câu hỏi hoặc chuyển sang công cụ khác làm đứt mạch học và khó biết câu trả lời có bám bài hay không.
- Evidence mining ban đầu:
  - Data pack có 1.261 lượt hỏi của 369 user trong 585 hội thoại.
  - 46,2% câu trả lời tutor không có citation; đây là tín hiệu về nhu cầu grounding, chưa phải bằng chứng trực tiếp rằng mọi học viên muốn quiz.
  - Các turn như `T1201`, `T0769`, `T1258` cho thấy yêu cầu quá ngắn hoặc retrieval sai trang dẫn đến fallback không hữu ích.
  - Các turn `T0984`, `T0076`, `T0520`, `T0999`, `T0138` cho thấy học viên thường yêu cầu giải thích hoặc ôn lại một khái niệm ngay tại slide.

## §2. Impact & quyết định chọn

| Ứng viên | Evidence hiện có | Tần suất / tổn thất | Khả thi |
|---|---|---|---|
| Quiz tự kiểm tra từ slide | Nhiều lượt hỏi giải thích/tóm tắt khái niệm tại trang đang xem | Lặp lại trong flow học; chuyển context làm đứt mạch | Cao với mock extraction + AI generation |
| Tự động tóm tắt toàn bộ bài | Có các turn yêu cầu tóm tắt | Dễ tạo output dài; khó biết người học nhớ gì | Cao nhưng ít phản hồi chủ động |
| AI Tutor hỏi đáp mở | Đã tồn tại trong VLearn | Citation rỗng ở 46,2% câu trả lời; phạm vi rộng | Đã có, không phải lát cắt mới |

- Ứng viên loại: xây một Tutor chat mới, vì VLearn đã có Tutor và phạm vi quá rộng cho checkpoint.
- Ứng viên chọn: quiz tự kiểm tra có source, vì đây là một quyết định AI hẹp, đo được bằng schema và grounding.

## §3. Giải pháp tương tự đã nghiên cứu

- VLearn Tutor hiện tại: đáng giữ luồng hỏi theo slide; cần cải thiện source trust và fallback.
- Quiz thủ công trong LMS: đáng học ở cấu trúc một câu, bốn lựa chọn; điểm khác là câu hỏi được tạo có điều kiện từ nguồn đang mở.

## §4. Thiết kế

- Lát cắt một câu: một học viên vừa đọc slide bấm tự kiểm tra; AI quyết định nguồn có đủ căn cứ và tạo đúng bốn MCQ; học viên làm và xem đáp án kèm nguồn ngay trong VLearn.
- Non-goals:
  - Không thay thế VLearn Tutor.
  - Không chấm mức độ thành thạo hoặc tính điểm học phần.
  - Không tạo câu hỏi từ kiến thức ngoài học liệu.
  - Không xây dashboard, leaderboard hoặc công cụ soạn bài cho giảng viên.
- Mức prototype: Mock.
  - Thật: lời gọi Gemini ở quyết định đủ căn cứ và sinh MCQ; schema validation; kiểm tra excerpt nguyên văn; flow làm bài và review.
  - Mock có kiểm soát: extraction PDF được thay bằng các excerpt ngắn từ data pack, có nhãn slide; hai trạng thái low-confidence/failure có fixture deterministic qua query `demoScenario`; chưa upload hoặc OCR file tùy ý.
- Automation: conditional.
  - Cost-of-error là học viên ghi nhớ sai kiến thức.
  - Hệ thống chỉ tạo quiz khi có thể sinh đủ bốn câu có source; nếu không thì từ chối có lý do.

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

- Happy path: nguồn đủ rõ -> Gemini tạo bốn câu -> schema và grounding pass -> làm quiz -> review có source.
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

- Spec: `[CẦN TÊN]`
- Evidence: `[CẦN TÊN]`
- Prompt + golden set: `[CẦN TÊN]`
- Code + eval runner: `[CẦN TÊN]`
- Demo: `[CẦN TÊN]`
- Willing users: `[CẦN ÍT NHẤT 3 TÊN, KHÔNG ĐƯỢC BỊA]`
- Multi-prototype: đã chọn conditional generation thay cho luôn tạo quiz; lý do là cost-of-error của câu hỏi sai cao hơn lợi ích của việc luôn có output.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| CP2 | Dựng flow reader -> processing -> quiz -> review | Chứng minh flow chính bấm được |
| CP3 | Thay fixture generation bằng Gemini server call | Đưa AI thật vào quyết định trung tâm |
| CP3 | Thêm schema, excerpt grounding và ba decision state | Ngăn câu hỏi không có căn cứ |
| CP3 | Thêm 22-case golden set và runner lưu mọi output | Đủ artefact đo lượt đầu, kể cả case fail |
