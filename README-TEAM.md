# VLearn Slide-to-Quiz — Mini Hackathon AI Batch 3

**Product:** Học viên tải slide bài học lên → AI tạo quiz 4 lựa chọn → làm quiz trong VLearn → xem đáp án có trích dẫn nguồn.

**Hackathon:** 1.5 ngày, 6 checkpoints (CP1-CP6)

## 📦 Repo Structure

```
├── codebase/              ← Next.js prototype (CP2-CP3)
├── demo-slides.pptx       ← 6-page demo slides (CP2, fill evidence by CP5)
├── eval/                  ← Golden set + run results (CP3-CP4)
├── validation/            ← User feedback log (CP5)
├── spec.md                ← AI Spec (deadline 23:59 N1)
└── README.md              ← This file
```

## 🎯 Current Status: CP2 DONE ✅

- ✅ Prototype bấm được (4 paths: happy/low-conf/fail/correction)
- ✅ Demo slides 6 trang framework
- ⏳ Next: CP3 — AI thật + golden set + eval run 1

## 👥 Team

[TODO: Thêm tên + mã HV của 4-5 thành viên]

## 📋 Phân Công

[TODO: Ghi rõ ai làm gì - theo yêu cầu README rubric]

Ví dụ:
- **Evidence mining:** [Tên] — mine chatlog VLearn, khảo sát ≥20 người
- **Prototype:** [Tên] — Next.js flow + state machine
- **Golden set:** [Tên] — xây ≥20 cases từ 4 lớp chỗ khó
- **Spec writer:** [Tên] — viết spec.md §1-9
- **Validation:** [Tên] — user test ≥5 người + changelog

## 🚀 Quick Start

See [QUICK-START.md](QUICK-START.md) for prototype setup and testing.

## 📊 Checkpoints

| CP | Date | Deliverable | Status |
|----|------|-------------|--------|
| CP1 | [TODO] | Canvas 7 dòng | ✅ |
| CP2 | [TODO] | Prototype bấm được + slides | ✅ |
| CP3 | [TODO] | AI thật + golden set + eval run 1 | ⏳ |
| CP4 | [TODO] | Spec.md commit 23:59 N1 | ⏳ |
| CP5 | [TODO] | Validation ≥5 người + dry run | ⏳ |
| CP6 | [TODO] | Demo 5' + Q&A | ⏳ |

## 🎨 Product Slice

**One sentence:**  
Học viên vừa xem xong slide → tải PDF/PPT lên VLearn → AI đọc nội dung và tạo 4-choice quiz có trích dẫn → làm quiz ngay trong VLearn → xem review có nguồn từng câu.

**Automation:** Conditional  
**Cost-of-error:** Câu hỏi sai kiến thức → học viên học sai → grounded refusal > confident hallucination

## 🔍 Evidence

[TODO: Fill from CP1 Canvas + mining/survey]

**Pain:** [ai — đang làm gì — vướng đâu — hậu quả gì]

**Bằng chứng A (mining):**  
- [số/tổng] chatlog: [pattern cụ thể]
- [≥5 ví dụ nguyên văn]

**Bằng chứng B (khảo sát):**  
- [số/tổng] người xác nhận: [pain statement]
- Log: [link đến evidence log file]

## 🎯 Quality Bar

[TODO: Chốt trước 23:59 N1, GIỮ NGUYÊN sau đó]

VD: Đạt khi ≥75% qua golden set VÀ 0% câu hỏi bịa nguồn.

## 📏 Rubric Mapping

| Artifact | Rubric | File |
|----------|--------|------|
| Evidence | R1 (15đ) | spec.md §1-2 + [evidence log] |
| Lát cắt & thiết kế | R2 (15đ) | spec.md §4 |
| Chỗ khó & kịch bản | R3 (11đ) | spec.md §5-6 |
| Kiểm thử | R4 (15đ) | spec.md §7 + eval/ |
| Prototype | R5 (8đ) | codebase/ + demo |
| Validation | R6 (8đ) | validation/ |
| Repo structure | R7 (3đ) | this structure |

**Total:** 75 điểm chấm + 25 điểm nộp checkpoint = 100 điểm

## 🔒 Data Policy

Dữ liệu trong `data/vlearn-pack/` là dữ liệu thật đã ẩn danh, chỉ dùng trong hackathon. Không commit data pack vào repo nộp bài.

## 📚 References

- [01-de-bai.md](01-de-bai.md) — Đề bài 3 hướng + 5 tiêu chí
- [02-guide.md](02-guide.md) — Hướng dẫn 5 giai đoạn
- [03-template-ai-spec.md](03-template-ai-spec.md) — Template spec
- [04-rubric.md](04-rubric.md) — Rubric 100 điểm

---

**Last updated:** CP2 checkpoint  
**Next milestone:** CP3 — AI call thật + golden set ≥20 + eval run 1
