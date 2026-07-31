const promptBoilerplate = new Set<string>([
  "ai",
  "ap",
  "bieu",
  "can",
  "cach",
  "cau",
  "chinh",
  "chon",
  "cho",
  "cua",
  "dau",
  "diem",
  "dung",
  "duoc",
  "giai",
  "ghi",
  "gi",
  "hien",
  "hieu",
  "khi",
  "kien",
  "ket",
  "khong",
  "la",
  "lam",
  "lua",
  "mot",
  "mo",
  "nao",
  "nhan",
  "nhat",
  "nho",
  "noi",
  "phan",
  "phat",
  "phu",
  "qua",
  "quyet",
  "ta",
  "thich",
  "thong",
  "thuc",
  "the",
  "trong",
  "trinh",
  "tinh",
  "tro",
  "vai",
  "van",
  "ve",
  "voi",
  "xu",
  "xac",
  "y",
]);

export function normalizeQuizText(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function meaningfulQuizTokens(value: string) {
  return new Set(
    (normalizeQuizText(value).match(/[\p{L}\p{N}]+/gu) ?? [])
      .filter((token) => token.length >= 2 && !promptBoilerplate.has(token)),
  );
}

export function promptsAreNearDuplicate(left: string, right: string) {
  const normalizedLeft = normalizeQuizText(left);
  const normalizedRight = normalizeQuizText(right);
  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;

  const leftTokens = meaningfulQuizTokens(left);
  const rightTokens = meaningfulQuizTokens(right);
  if (!leftTokens.size || !rightTokens.size) return false;

  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const containment = shared / Math.min(leftTokens.size, rightTokens.size);

  // Sau khi bỏ từ đệm của mẫu câu, một câu chỉ còn 1-2 từ thường chính là
  // tên khái niệm. Trùng toàn bộ phần này nghĩa là đang hỏi lại cùng một ý.
  return shared > 0 && containment >= 0.75;
}

export function promptAppearsInHistory(prompt: string, history: string[]) {
  return history.some((previous) => promptsAreNearDuplicate(prompt, previous));
}
