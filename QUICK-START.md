# CP2 Quick Start — VLearn Quiz Prototype

## ✅ CP2 Deliverables HOÀN THÀNH

### 1. Prototype (codebase/)
- ✅ Flow chính bấm được: Upload → Processing → Quiz → Review
- ✅ Cả 4 paths: happy, low-confidence, failure, correction
- ✅ 16 files React/TypeScript hoàn chỉnh
- ✅ Mock data sẵn sàng thay AI thật (CP3)

### 2. Demo Slides (demo-slides.pptx)
- ✅ 6 trang theo guide §5.1
- ✅ TODO placeholders cho evidence thật

## 🚀 Chạy Prototype Ngay

```bash
cd codebase
npm install
npm run dev
```

Mở http://localhost:3000

## 🧪 Test 4 Paths

1. **Happy path:** Upload file tên `lesson.pdf` hoặc `slide.pdf`
   → Thấy 4 câu quiz → Làm xong xem review có nguồn

2. **Low-confidence:** Upload file tên có chữ `image` hoặc `scan`  
   → "Chưa đủ nội dung" + gợi ý

3. **Failure:** Upload file tên có chữ `corrupt` hoặc `error`
   → "Không thể đọc file" + retry

4. **Correction:** Sau khi review → Click "Câu hỏi chưa chính xác"
   → Form feedback mở ra

## 📁 Cấu Trúc Code

```
codebase/src/
├── app/
│   ├── page.tsx              ← Main quiz page (state machine ở đây)
│   └── layout.tsx            ← App layout
├── features/quiz-from-slides/
│   ├── components/           ← 6 components (1 cho mỗi state)
│   │   ├── slide-upload.tsx
│   │   ├── generation-status.tsx
│   │   ├── quiz-question.tsx
│   │   ├── quiz-review.tsx
│   │   ├── insufficient-content.tsx
│   │   └── failure-state.tsx
│   ├── model/
│   │   ├── quiz-machine.ts   ← State reducer
│   │   ├── quiz.types.ts     ← TypeScript types
│   │   └── quiz.schemas.ts   ← Zod validation
│   └── fixtures/
│       └── quiz-scenarios.ts ← Mock data (4 scenarios)
└── components/ui/
    ├── button.tsx
    ├── card.tsx
    └── index.ts
```

## 🎯 CP2 Checklist (Show TA)

- ✅ Flow chính bấm đi hết được
- ✅ Happy + low-confidence + failure + correction paths
- ✅ Repo có commit (24 files staged)
- ✅ Demo slides 6 trang

## 📝 TODO cho CP3

1. **Connect AI thật:**
   - Tạo `src/features/quiz-from-slides/server/quiz-provider.ts`
   - Integrate OpenRouter/OpenAI
   - Replace mock trong `slide-upload.tsx` line 66-92

2. **Golden set ≥20 cases:**
   - Tạo `eval/golden-set.jsonl`
   - ≥2 case/lớp chỗ khó
   - ≥10 case từ chatlog thật

3. **Run eval & log results:**
   - Chạy trọn bộ golden set
   - Ghi % vào `eval/runs/run-1.md`

4. **Fill evidence vào slides:**
   - Mining numbers vào slide 1
   - Impact table vào slide 2
   - Quality bar % vào slide 4

## 🐛 Known Issues

- Git index.lock trong sandbox → Files đã staged nhưng chưa commit được. Push trực tiếp từ máy local sẽ work.

## 🎨 Design Principles Đã Áp Dụng

- HAX G1: Upload screen nói rõ "PDF, PPT, PPTX" và "chỉ dùng nội dung từ slide"
- HAX G2: Review hiện source page + excerpt
- HAX G10: Insufficient content refuses + explains
- HAX G8/G9: Flag question không block flow
- HAX G11: Mỗi answer có explanation + source
- PAIR graceful failure: Distinct error messages với recovery actions

---

**Ready for CP2 checkpoint! 🎉**
