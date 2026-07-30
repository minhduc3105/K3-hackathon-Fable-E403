# Reflection - Trần Huy Hoàng / `[CẦN MÃ HỌC VIÊN]`

## Vai trò và phần tôi làm

Tôi phụ trách OpenRouter provider, API route, prompt, golden set, eval runner, spec và lượt tích hợp CP2/CP3 cuối ở commit `4ea9c42`. Artifact chính là `codebase/app/api/quiz/`, `codebase/src/features/quiz-from-slides/server/`, `eval/` và `spec.md`.

## AI hỗ trợ như thế nào

AI hỗ trợ soạn prompt, sinh khung case và rà soát code. Tôi kiểm tra lại bằng golden set 22 case, giữ nguyên mọi output của baseline và lượt chính thức, đồng thời đối chiếu source excerpt trước khi cho response `ready` tới UI.

## Một quyết định tôi có thể giải thích

Tôi có thể giải thích quality bar: ít nhất 80% tổng số case, 100% decision đúng ở `source_of_truth` và `domain_harm`, và không có câu `ready` nào thiếu excerpt nguyên văn. Hai lớp critical được giữ ở 100% vì sai ở đây có thể làm học viên ghi nhớ sai.

## Bài học từ case fail của nhóm

Lượt baseline chỉ đạt 11/22 chủ yếu vì JSON không ổn định. Nhóm không hạ quality bar mà siết output contract, schema và grounding rồi chạy lại toàn bộ 22 case; kết quả chính thức đạt 22/22. Tôi học được rằng phải sửa hệ thống đo, không sửa số liệu sau khi thấy kết quả thấp.

## Nếu có thêm thời gian

Tôi sẽ thêm rate limit, idempotency cho retry, integration test cho provider malformed output và một bộ holdout case không dùng trong lúc tinh chỉnh prompt.
