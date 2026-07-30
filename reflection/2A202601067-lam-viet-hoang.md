# Reflection - Lâm Việt Hoàng / 2A202601067

## Vai trò và phần tôi làm

Tôi phụ trách prototype flow, các component quiz và state model trên nhánh `hoang`. Hai commit dùng để đối chiếu là `1d96398` và `a97f197`, gồm generation status, quiz question, review, insufficient-content, failure và Tutor UI.

## AI hỗ trợ như thế nào

AI hỗ trợ dựng nhanh cấu trúc component, gợi ý trạng thái và rà soát type. Tôi chịu trách nhiệm kiểm tra lại các transition chính, bảo đảm happy path và các trạng thái lỗi không trở thành những màn hình rời rạc.

## Một quyết định tôi có thể giải thích

Tôi có thể giải thích vì sao quiz hiển thị từng câu một và giữ đáp án khi quay lại: cách này giữ nhịp tự kiểm tra, giảm tải nhận thức và vẫn cho phép người học sửa lựa chọn trước khi xem review.

## Bài học từ case fail của nhóm

Baseline chỉ đạt 11/22 vì output JSON của model không ổn định. Tôi học được rằng UI không được giả định model luôn trả đúng cấu trúc; response phải qua schema và grounding trước khi render, nếu không lỗi AI sẽ biến thành lỗi trải nghiệm hoặc dạy sai.

## Nếu có thêm thời gian

Tôi sẽ bổ sung test e2e cho bốn đường đi và kiểm tra responsive bằng bàn phím trên viewport nhỏ, thay vì chỉ dựa vào fixture và kiểm tra thủ công.
