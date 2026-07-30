# Demo script 5 phút - VLearn Recall Check

Tài liệu điều phối; số liệu phải khớp artifact nguồn. Deck final phải có đúng 6 slide.

| Thời gian | Slide | Nội dung nói / thao tác | Bằng chứng |
|---:|---:|---|---|
| 0:00-0:45 | 1 | Học viên vừa đọc slide cần tự kiểm tra ngay trong reader. Nêu 326 user/1.074 turn ôn hoặc giải thích; đây là proxy, không phải tuyên bố mọi người muốn quiz. | `evidence/mining-log.md` |
| 0:45-1:30 | 2 | So sánh quiz, tóm tắt và Tutor mở. Chọn quiz vì 326 user/1.074 turn và output hẹp; loại tóm tắt 98 user/134 turn; không xây lại Tutor đã có. | `spec.md` §2 |
| 1:30-3:30 | 3 | Nêu lát cắt một câu và conditional automation. Demo happy path tại `/`, sau đó case khó tại `/?demoScenario=insufficient`; chỉ rõ AI không đoán khi thiếu nguồn. | `spec.md` §4-§6, `codebase/` |
| 3:30-4:15 | 4 | Quality bar 80% tổng, 100% hai lớp critical, 0 ready thiếu excerpt. Baseline 11/22 (50%), lượt chính thức 22/22 (100%); failure lớn nhất của baseline là JSON format không ổn định. | `eval/runs/` |
| 4:15-5:00 | 5 | Đọc ít nhất hai quote nguyên văn có tên/vai và nêu thay đổi đã làm. | `validation/feedback-log.md` — **chờ dữ liệu thật** |
| sau 5:00 | 6 | Nếu được thêm một tuần: 2-3 ưu tiên gắn với feedback/failure và một bài học lớn nhất. Dùng slide này để kết và chuyển Q&A. | `validation/`, `reflection/` — **chờ dữ liệu thật** |

## URL demo

- Happy path: `http://localhost:3002/`
- Low-confidence: `http://localhost:3002/?demoScenario=insufficient`
- Failure: `http://localhost:3002/?demoScenario=failure`
- Correction: hoàn thành quiz, tại review chọn “Báo câu hỏi”.

## Q&A phải trả lời được

- Augment hay automate? Conditional automation: AI chỉ tự sinh khi đủ bốn câu có source; hệ thống từ chối khi cost-of-error cao.
- Failure nguy hiểm nhất? Câu hỏi/đáp án không được excerpt hỗ trợ làm học viên ghi nhớ sai.
- Phần thật và mock? OpenRouter generation, schema và grounding là thật; PDF extraction và hai query demo là mock có kiểm soát.
