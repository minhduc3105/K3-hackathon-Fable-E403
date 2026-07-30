# VLearn State Model

## Trạng thái chính

- `lesson`
- `processing`
- `quiz`
- `review`
- `insufficient`
- `error`

## Trạng thái phụ

- `readerMode`
- `theme`
- `languageMenuOpen`
- `profileOpen`
- `tutorHistoryOpen`
- `feedbackOpenFor`

## Luồng

```text
lesson -> processing -> quiz -> review
lesson -> processing -> insufficient
lesson -> processing -> error
review -> lesson
review -> quiz
```

## Quy ước

- `lesson` là màn đọc học liệu.
- `processing` là mô phỏng AI đang đọc slide hiện tại.
- `quiz` chỉ có 1 câu mỗi lần.
- `review` hiển thị nguồn, giải thích, và feedback.
- `insufficient` và `error` phải có đường quay lại rõ ràng.

## Dữ liệu nguồn

- `data/vlearn-pack/slides` là catalog file thật.
- `lesson-fixture.ts` giữ mock lesson và quiz để demo ổn định.
- Hai lớp này tách nhau để thay OCR/extraction sau này mà không phải sửa UI.
