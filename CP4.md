# CP4 - Chốt tiến độ

Thời điểm chốt nội dung: `2026-07-30`, trước hạn cứng `23:59 N1` của `spec.md`.

## Checklist TA xác minh

- [x] **Evidence chuẩn B có log:** `evidence/mining-log.md` ghi phương pháp, quy tắc đếm, 2.522 message / 1.261 turn / 369 user và 5 ví dụ nguyên văn có mã turn. Chạy lại bằng `node evidence/analyze-chatlog.mjs`.
- [x] **Bảng impact + ứng viên đã loại:** `spec.md` §2 so sánh ba ứng viên bằng số người, tần suất và tổn thất mỗi lượt; giữ rõ hai ứng viên bị loại và lý do bằng số.
- [x] **Bốn lớp chỗ khó cụ thể:** `spec.md` §5 có 8 kịch bản phủ `source_of_truth`, `ambiguity`, `out_of_scope`, `domain_harm`.
- [x] **Ít nhất bốn nguyên tắc có vị trí áp dụng:** `spec.md` §4b có 6 mapping HAX/PAIR trỏ tới processing, review/source, skip/back/flag, insufficient-content và failure.
- [x] **Quality bar bằng số:** `spec.md` §7 chốt ≥80% tổng số case, 100% decision đúng ở hai lớp critical và 0 câu `ready` thiếu source excerpt nguyên văn.

## Bằng chứng kiểm tra nhanh

| Hạng mục | Kết quả | Artifact |
|---|---:|---|
| Evidence mining | 326 user / 1.074 turn `review_concept`; 5 ví dụ nguyên văn | `evidence/mining-log.md` |
| Impact candidates | 3 ứng viên, 2 ứng viên bị loại | `spec.md` §2 |
| Risk scenarios | 8 kịch bản / 4 lớp | `spec.md` §5 |
| HAX/PAIR | 6 nguyên tắc có vị trí UI | `spec.md` §4b |
| Golden set | 22 case; 15 từ chatlog; 3 case mỗi lớp khó | `eval/golden-set.jsonl` |
| Baseline | 11/22 (50%), giữ đầy đủ case fail | `eval/runs/run-2026-07-30T09-09-40-355Z.md` |
| Run chính thức | 22/22 (100%); critical 100%; grounding failure 0 | `eval/runs/run-2026-07-30T09-14-21-134Z.md` |

## Việc còn thiếu sau CP4

Các mục dưới đây thuộc CP5/CP6, không được đánh dấu hoàn thành bằng dữ liệu giả:

1. Xác nhận mã học viên chính thức của Trần Huy Hoàng và tên/Zone nếu mã repo `Fable-E403` không phải mã nộp.
2. Điền ít nhất 3 willing users đã khai từ CP1.
3. Thực hiện 5 phiên validation thật, trong đó ít nhất 2 người thuộc danh sách willing users; ghi quote nguyên văn, tên/vai và changelog.
4. Hoàn thiện deck PDF đúng 6 slide sau khi có quote validation.
5. Dry run có bấm giờ và xác nhận mỗi thành viên giải thích được phần được phân công.

## Lệnh show cho TA

```powershell
node evidence/analyze-chatlog.mjs
cd codebase
npm run eval:check
npm run rubric:check
```

`npm run rubric:check` cố ý trả mã lỗi cho đến khi feedback thật, deck PDF và mọi placeholder bắt buộc được hoàn tất.
