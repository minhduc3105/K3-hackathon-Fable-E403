# Feedback log

Trạng thái: **đã có đủ 5/5 người thử có tên, vai trò, quan sát và quote nguyên văn; nhóm đã xác nhận retest đạt cho hai thay đổi đã chốt**.

| # | Người thử (tên/vai) | Willing user đã khai? | Task | Quan sát | Quote nguyên văn | Mức nghiêm trọng |
|---:|---|:---:|---|---|---|---|
| 1 | Bùi Hữu Nghĩa — Học viên K3 | Có | Hỏi AI Tutor hai câu liên tiếp: “Hello” và “Bạn có thể làm được gì?”, sau đó kiểm tra định dạng phản hồi. | Hai phản hồi sử dụng định dạng khác nhau; phản hồi sau xuất hiện nhiều dấu `*`, khiến nội dung khó đọc và thiếu nhất quán. | “Lúc thì AI trả lời thành đoạn văn, lúc lại chia nhiều gạch đầu dòng nên mình thấy hơi rối.” | Cao |
| 2 | Hà Nhật Khánh Duy — Học viên K3 | Có | Nhập specified prompt “Tập trung vào attention và context window” rồi tạo quiz. | Hệ thống không tạo được câu hỏi theo phần người học yêu cầu, khiến người thử quay lại kiểm tra ô prompt vì cho rằng yêu cầu chưa được nhận. | “Mình muốn những gì nhập trong ô này phải được ưu tiên khi tạo quiz.” | Cao |
| 3 | Đinh Xuân Huy — Học viên K3 | Có | Thử luồng tạo quiz và xem phần thông tin/cấu hình tạo câu hỏi. | Người thử đánh giá tổng thể ổn nhưng dừng lại ở phần thông tin khi tạo câu hỏi vì chưa hiểu phải thao tác hoặc điền nội dung như thế nào. | “cảm thấy ổn , khó hiểu phần tạo câu hỏi chỗ thông tin làmt hế nào” | Trung bình |
| 4 | Đỗ Đức Trường — Học viên K3 | Không | Tạo quiz với prompt hẹp và kiểm tra câu hỏi có lạc chủ đề hay không. | Người thử hoàn thành lượt kiểm tra và không báo cáo vấn đề trong quá trình sử dụng. | “không có vấn đề gì” | Thấp |
| 5 | Phạm Tiến Anh — Học viên K3 | Không | Chạy lại cả AI Tutor và quiz sau thay đổi để so sánh trước/sau. | AI Tutor trả lời thống nhất, không còn dấu `*` hoặc định dạng lộn xộn. Quiz ưu tiên đúng nội dung được nhập trong ô “Phần muốn ôn”. | “Kết quả trước và sau cải thiện ổn.” | Thấp |

## Tổng hợp sau test

- Hai vấn đề nổi bật đã xác nhận: phản hồi AI Tutor không nhất quán về định dạng; quiz generator chưa ưu tiên ổn định specified prompt của người học.
- Một vấn đề bổ sung: phần thông tin/cấu hình tạo câu hỏi chưa đủ dễ hiểu đối với Đinh Xuân Huy; đưa vào backlog vì nhóm đã chốt ưu tiên hai lỗi AI trước demo.
- Thay đổi làm trước demo: (1) chuẩn hóa AI Tutor về plain text, không Markdown, heading, bảng hoặc code block; giữ đúng thứ tự lịch sử user/assistant và tránh lặp câu hỏi; (2) điều chỉnh quiz generator để ưu tiên nội dung trong ô “Phần muốn ôn” khi nội dung đó có căn cứ trong slide.
- Điểm giữ nguyên và lý do: giữ grounding và cơ chế `insufficient_content`; specified prompt không được phép khiến model dùng kiến thức ngoài slide hoặc đoán khi nguồn không đủ.
- Đưa vào backlog: chia học liệu theo buổi, đổi tên modal cấu hình quiz, cải thiện typography, trạng thái AI Tutor và thời gian tự ẩn thông báo.

## Kết quả retest sau thay đổi

1. **AI Tutor — Đạt:** phản hồi đã thống nhất về plain text, không còn dấu `*` hoặc định dạng lộn xộn; lịch sử hội thoại vẫn hiển thị đúng thứ tự.
2. **Specified prompt khi tạo quiz — Đạt:** quiz đã ưu tiên đúng nội dung người học nhập trong ô “Phần muốn ôn” và không còn bỏ qua yêu cầu này.

Nguồn ghi nhận: xác nhận của nhóm và lượt so sánh trước/sau của Phạm Tiến Anh.

## Changelog từ validation

| Feedback nguồn | Thay đổi hoặc quyết định giữ | File/vị trí | Bằng chứng kiểm tra lại |
|---|---|---|---|
| Bùi Hữu Nghĩa — định dạng AI Tutor thiếu nhất quán | **Đã chốt và nhóm xác nhận retest đạt:** chuẩn hóa phản hồi về plain text; không Markdown, heading, bảng hoặc code block; giữ đúng thứ tự user/assistant và tránh lặp câu hỏi. | `codebase/app/api/chat/route.ts`; `codebase/src/features/quiz-from-slides/components/workbench.tsx` | AI Tutor trả lời thống nhất, không còn dấu `*` hoặc định dạng lộn xộn; lịch sử hội thoại đúng thứ tự. |
| Hà Nhật Khánh Duy — specified prompt chưa được ưu tiên khi tạo quiz | **Đã chốt và nhóm xác nhận retest đạt:** khi có “Phần muốn ôn”, model phải ưu tiên chủ đề đó nhưng vẫn chỉ dùng nội dung có căn cứ trong slide; nếu không đủ căn cứ thì trả `insufficient_content`. | `codebase/src/features/quiz-from-slides/server/openrouter-quiz-provider.ts`; `codebase/app/api/quiz/generate/route.ts` | Quiz ưu tiên đúng nội dung nhập trong ô “Phần muốn ôn” và không còn bỏ qua specified prompt. |
