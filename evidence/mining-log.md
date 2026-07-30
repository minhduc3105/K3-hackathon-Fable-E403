# Evidence mining log - VLearn Recall Check

## Nguồn và phương pháp

- Nguồn gốc: `data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv`.
- Phạm vi nguồn: 2.522 message, tương ứng 1.261 lượt hỏi-đáp đã hoàn thành, 369 user ẩn danh và 585 hội thoại.
- Đơn vị đếm chính: một `turn_id`; mỗi turn có một message `student` và một message `tutor`.
- Script tái lập: `node evidence/analyze-chatlog.mjs` khi data pack do ban tổ chức cấp đang nằm ở `data/`; hoặc `node evidence/analyze-chatlog.mjs --input=<đường-dẫn-csv>`. Data pack không được track trong bài nộp.
- Không dùng `total_cost_usd` vì data dictionary ghi rõ trường này chưa được tracking đúng.

### Quy tắc đếm

1. **Ôn/giải thích khái niệm:** tutor row có `move_used = review_concept`.
2. **Yêu cầu tóm tắt/ôn tập tường minh:** student content khớp regex `tóm tắt|tom tat|summar|ôn tập|on tap`, không phân biệt hoa thường.
3. **Tutor hỏi đáp mở:** toàn bộ student turn.
4. **Thiếu citation:** tutor row có `citations` rỗng hoặc bằng `[]`.
5. User và conversation được đếm distinct theo mã ẩn danh; không suy ngược danh tính.

## Kết quả đếm

| Ứng viên | User | Turn | Hội thoại | Turn/user | Tổn thất mỗi lượt / số lần quan sát | Tỷ lệ |
|---|---:|---:|---:|---:|---:|---:|
| Quiz tự kiểm tra cho nhu cầu ôn/giải thích khái niệm | 326 | 1.074 | 524 | 3,29 | Thiếu nguồn, phải tự dò lại slide: 448 lượt | 41,7% |
| Tóm tắt/ôn tập tường minh | 98 | 134 | 115 | 1,37 | Bản tóm tắt không kiểm chứng được: 87 lượt | 64,9% |
| Tutor hỏi đáp mở hiện tại | 369 | 1.261 | 585 | 3,42 | Thiếu nguồn, phải tìm lại căn cứ: 582 lượt | 46,2% |

Diễn giải giới hạn: `review_concept` là nước đi sư phạm do hệ thống gắn cho câu trả lời tutor, nên đây là proxy cho nhu cầu ôn/giải thích, không phải bằng chứng rằng cả 326 user đã yêu cầu quiz. Con số được dùng để so sánh cơ hội, không dùng để tuyên bố “mọi học viên muốn quiz”.

## Ví dụ nguyên văn

Các ví dụ dưới đây được trích ngắn từ student message đã ẩn danh; mã turn cho phép đối chiếu lại file nguồn.

| Turn | User ẩn danh | Hội thoại | Nội dung nguyên văn |
|---|---|---|---|
| `T0663` | `U0318` | `C0419` | `(Trang 35, đoạn được chọn: "PAIR")`<br>`là gì` |
| `T0896` | `U0154` | `C0460` | `(Trang 5, đoạn được chọn: "PR")`<br>`PRD là gì?` |
| `T1201` | `U0242` | `C0003` | `(Trang 1, đoạn được chọn: "tóm tắt")`<br>`tóm tắt` |
| `T1190` | `U0318` | `C0163` | `(Trang 48, đoạn được chọn: "attention")`<br>`là gì` |
| `T0984` | `U0096` | `C0115` | `(Trang 7, đoạn được chọn: "Hãy giải thích về attention mechanism")`<br>`Hãy giải thích về attention mechanism` |

## Quyết định sản phẩm từ bằng chứng

- Chọn quiz tự kiểm tra có nguồn vì proxy ôn/giải thích có độ phủ lớn nhất trong các lát cắt mới: 326 user, 1.074 turn; output có cấu trúc nên đo được decision, grounding và ambiguity.
- Không chọn tóm tắt toàn bài vì chỉ có 98 user/134 turn theo quy tắc tường minh, trong khi 64,9% câu trả lời của nhóm này thiếu citation.
- Không xây lại Tutor hỏi đáp mở dù có 369 user/1.261 turn vì tính năng đã tồn tại và có 582 câu trả lời thiếu citation; phạm vi quá rộng để đo đáng tin cậy trong hackathon.
