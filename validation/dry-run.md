# Dry run demo

Trạng thái: **đã chạy thật và đạt mục tiêu thời lượng**. Kết quả dưới đây do nhóm xác nhận sau buổi dry run.

|        Lượt | Thời điểm         | Người bấm giờ                                |      Thời lượng |                   Happy path                   |                       Case khó                       |            Slide 6 trang             | Lỗi gặp phải / cách xử lý                                                                                                                                  |
| ----------: | ----------------- | -------------------------------------------- | --------------: | :--------------------------------------------: | :--------------------------------------------------: | :----------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    Kế hoạch | Trước CP5         | Một thành viên không trực tiếp thao tác demo | Mục tiêu `4:55` | Chạy `/`: tạo quiz → làm bài → review có nguồn | Chạy `/?demoScenario=insufficient`: từ chối có lý do | Có — `demo-slides.pdf`, đúng 6 trang | Trước khi chạy thật phải sửa lỗi production build tại `quiz-review.tsx:139`; nếu provider/mạng lỗi thì dùng case deterministic và giải thích rõ phần mock. |
| 1 — thực tế | 31/07/2026, 09:30 | Lâm Việt Hoàng                               |          `4:48` |                      Đạt                       |                         Đạt                          |                  Có                  | Không phát sinh lỗi.                                                                                                                                       |

**Kết luận:** Dry run đạt: thời lượng `4:48` không vượt quá 5 phút; happy path và case `insufficient` đều chạy đạt; deck sử dụng đúng 6 slide.

## Phân công nói — mục tiêu 4 phút 55 giây

|   Thời gian | Slide | Người nói         | Nội dung bắt buộc                                                                                   |
| ----------: | ----: | ----------------- | --------------------------------------------------------------------------------------------------- |
| `0:00–0:40` |     1 | Lã Minh Đức       | User/job; 326 user và 1.074 lượt ôn/giải thích; không nói đây là bằng chứng mọi học viên muốn quiz. |
| `0:40–1:20` |     2 | Lâm Việt Hoàng    | So sánh ba ứng viên và lý do chọn quiz từ slide.                                                    |
| `1:20–3:00` |     3 | Phó Viết Tiến Anh | Nêu lát cắt, conditional automation; chạy happy path và case `insufficient`.                        |
| `3:00–3:55` |     4 | Trần Huy Hoàng    | Quality bar; baseline `11/22`; nguyên nhân JSON; lượt chính thức `22/22`.                           |
| `3:55–4:35` |     5 | Phó Viết Tiến Anh | Đọc hai quote thật; nêu hai thay đổi và kết quả retest.                                             |
| `4:35–4:55` |     6 | Lâm Việt Hoàng    | Ba ưu tiên tiếp theo và bài học “sửa hệ thống đo, không sửa số liệu”.                               |

Người điều khiển slide chính: **Lã Minh Đức**. Người thao tác prototype: **Phó Viết Tiến Anh**. Người giữ phương án dự phòng và trả lời về eval: **Trần Huy Hoàng**.

Checklist trước khi đánh dấu xong:

- Demo trình bày không quá 5 phút.
- Happy path gọi AI thật và hiện trace.
- Case khó dùng URL deterministic, không che failure.
- Mỗi thành viên nói ít nhất một phần.
- Có phương án dự phòng nếu mạng hoặc provider lỗi.
