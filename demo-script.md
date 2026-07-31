# Demo script 5 phút - VLearn Recall Check

Tài liệu điều phối; số liệu phải khớp artifact nguồn. Deck final phải có đúng 6 slide.

| Thời gian | Slide | Nội dung nói / thao tác | Bằng chứng |
|---:|---:|---|---|
| 0:00-0:40 | 1 · Lã Minh Đức | Học viên vừa đọc slide cần tự kiểm tra ngay trong reader. Nêu 326 user/1.074 turn ôn hoặc giải thích; đây là proxy, không phải tuyên bố mọi người muốn quiz. | `evidence/mining-log.md` |
| 0:40-1:20 | 2 · Lâm Việt Hoàng | So sánh quiz, tóm tắt và Tutor mở. Chọn quiz vì 326 user/1.074 turn và output hẹp; loại tóm tắt 98 user/134 turn; không xây lại Tutor đã có. | `spec.md` §2 |
| 1:20-3:00 | 3 · Phó Viết Tiến Anh | Nêu lát cắt một câu và conditional automation. Demo happy path tại `/`, sau đó case khó tại `/?demoScenario=insufficient`; chỉ rõ AI không đoán khi thiếu nguồn. | `spec.md` §4-§6, `codebase/` |
| 3:00-3:55 | 4 · Trần Huy Hoàng | Quality bar 80% tổng, 100% hai lớp critical, 0 ready thiếu excerpt. Baseline 11/22 (50%), lượt chính thức 22/22 (100%); failure lớn nhất của baseline là JSON format không ổn định. | `eval/runs/` |
| 3:55-4:35 | 5 · Phó Viết Tiến Anh | Đọc quote của Bùi Hữu Nghĩa và Hà Nhật Khánh Duy; nêu hai thay đổi đã chốt: chuẩn hóa AI Tutor về plain text và ưu tiên ô “Phần muốn ôn”. | `validation/feedback-log.md` |
| 4:35-4:55 | 6 · Lâm Việt Hoàng | Nêu ba ưu tiên tiếp theo; kết bằng bài học “sửa hệ thống đo, không sửa số liệu” rồi chuyển Q&A. | `validation/`, `reflection/` |

## URL demo

- Happy path: `http://localhost:3002/`
- Low-confidence: `http://localhost:3002/?demoScenario=insufficient`
- Failure: `http://localhost:3002/?demoScenario=failure`
- Correction: hoàn thành quiz, tại review chọn “Báo câu hỏi”.

## Q&A phải trả lời được

- Augment hay automate? Conditional automation: AI chỉ tự sinh khi đủ bốn câu có source; hệ thống từ chối khi cost-of-error cao.
- Failure nguy hiểm nhất? Câu hỏi/đáp án không được excerpt hỗ trợ làm học viên ghi nhớ sai.
- Phần thật và mock? OpenRouter generation, schema và grounding là thật; PDF extraction và hai query demo là mock có kiểm soát.
