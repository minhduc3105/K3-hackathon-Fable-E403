# Reflection - Phó Viết Tiến Anh / 2A202601341

## Vai trò và phần tôi làm

Tôi phụ trách tích hợp CP3 và khung demo trên nhánh `tienanh`, được ghi nhận ở commit `880e17d`. Phần việc gồm nối API generation với flow quiz, tổ chức các trạng thái demo và chuẩn bị cấu trúc sáu slide.

## AI hỗ trợ như thế nào

AI hỗ trợ đề xuất schema response, copy cho trạng thái bất định và khung trình bày. Tôi kiểm tra lại rằng phần nào là AI thật, phần nào là mock có kiểm soát và không dùng số liệu/quote mẫu như bằng chứng thật.

## Một quyết định tôi có thể giải thích

Tôi có thể giải thích lựa chọn conditional automation: hệ thống chỉ sinh quiz khi đủ bốn câu có source; khi nguồn thiếu hoặc mâu thuẫn, refusal có lý do an toàn hơn việc cố tạo output để demo trông trơn tru.

## Bài học từ case fail của nhóm

Khung deck ban đầu còn các số và quote minh họa. Bài học của tôi là slide demo cũng phải tuân thủ cùng tiêu chuẩn grounding như sản phẩm: không có nguồn kiểm chứng thì không đưa lên slide final.

## Nếu có thêm thời gian

Tôi sẽ hoàn thiện backup demo ngắn, luyện case provider lỗi và tối ưu talk track để phần live giữ trong hai phút mà vẫn chỉ rõ trace và nguồn của câu hỏi.
