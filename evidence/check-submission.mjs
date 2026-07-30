import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const checks = [];

function check(name, passed, evidence) {
  checks.push({ name, passed: Boolean(passed), evidence });
}

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function hasFile(relativePath) {
  return existsSync(resolve(root, relativePath));
}

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

const requiredPaths = [
  "README.md",
  "spec.md",
  "codebase",
  "eval/golden-set.jsonl",
  "eval/rubric.md",
  "validation/feedback-log.md",
  "reflection",
];
for (const path of requiredPaths) {
  check(`Cấu trúc: ${path}`, hasFile(path), path);
}

const golden = read("eval/golden-set.jsonl")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const bucketCounts = Object.fromEntries(
  ["normal", "risk", "rare"].map((bucket) => [bucket, golden.filter((item) => item.bucket === bucket).length]),
);
const classCounts = Object.fromEntries(
  ["source_of_truth", "ambiguity", "out_of_scope", "domain_harm"].map((difficultyClass) => [
    difficultyClass,
    golden.filter((item) => item.difficultyClass === difficultyClass).length,
  ]),
);
const chatlogCount = golden.filter((item) => item.sourceType === "chatlog").length;
check("R4: golden set ≥20", golden.length >= 20, `${golden.length} case`);
check(
  "R4: cơ cấu 8-10 thường, 2-4 hiếm",
  bucketCounts.normal >= 8 && bucketCounts.normal <= 10 && bucketCounts.rare >= 2 && bucketCounts.rare <= 4,
  JSON.stringify(bucketCounts),
);
check(
  "R4: ≥2 case cho mỗi lớp khó",
  Object.values(classCounts).every((count) => count >= 2),
  JSON.stringify(classCounts),
);
check("R4: ≥10 case từ chatlog", chatlogCount >= 10, `${chatlogCount} case`);

const runFiles = readdirSync(resolve(root, "eval/runs"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => {
    const data = JSON.parse(read(`eval/runs/${name}`));
    return { name, data };
  })
  .sort((a, b) => String(a.data.summary?.completedAt).localeCompare(String(b.data.summary?.completedAt)));
const latestRun = runFiles.at(-1);
check("R4: có lượt chạy trọn bộ", Boolean(latestRun), latestRun?.name ?? "không có JSON run");
if (latestRun) {
  const { summary } = latestRun.data;
  check("R4: run chứa đủ mọi case", summary.total === golden.length && latestRun.data.results.length === golden.length, `${summary.total}/${golden.length}`);
  check("R4: đối chiếu quality bar", summary.meetsQualityBar === true, `${summary.overallPercent}% · critical ${summary.criticalDecisionPercent}%`);
}

const topbar = read("codebase/src/features/quiz-from-slides/components/topbar.tsx");
const sidebars = read("codebase/src/features/quiz-from-slides/components/sidebars.tsx");
const workbench = read("codebase/src/features/quiz-from-slides/components/workbench.tsx");
check("UI: nút Quay lại có aria-label", /aria-label="Quay lại"/.test(topbar), "topbar.tsx");
check("UI: học liệu có nhãn thu/mở rộng", /Thu gọn học liệu/.test(sidebars) && /Mở rộng học liệu/.test(sidebars), "sidebars.tsx");
check("UI: Tutor có nhãn thu/mở rộng", /Thu gọn VLearn Tutor/.test(sidebars) && /Mở rộng VLearn Tutor/.test(sidebars), "sidebars.tsx");
check(
  "UI: icon panel chỉ render khi chưa thu gọn",
  /!collapsed\s*\?\s*\([\s\S]*?materials-icon[\s\S]*?\)\s*:\s*null/.test(sidebars)
    && /!collapsed\s*\?\s*\([\s\S]*?tutor-icon[\s\S]*?\)\s*:\s*null/.test(sidebars),
  "sidebars.tsx",
);
check("UI: nút ngôn ngữ đổi VI ↔ EN", /state\.language === "vi" \? "VI" : "EN"/.test(topbar) && /language: state\.language === "vi" \? "en" : "vi"/.test(workbench), "topbar.tsx + workbench.tsx");
check(
  "UI/API: chọn 4/6/8 câu được truyền tới model",
  /option value=\{4\}/.test(sidebars)
    && /option value=\{6\}/.test(sidebars)
    && /option value=\{8\}/.test(sidebars)
    && /questionCount: state\.quizQuestionCount/.test(workbench)
    && /ALLOWED_QUESTION_COUNTS = \[4, 6, 8\]/.test(read("codebase/app/api/quiz/generate/route.ts")),
  "sidebars.tsx + workbench.tsx + API route",
);

const feedback = read("validation/feedback-log.md");
const feedbackRows = feedback.split(/\r?\n/).filter((line) => /^\|\s*\d+\s*\|/.test(line));
const completedFeedbackRows = feedbackRows.filter((line) => !/CẦN DỮ LIỆU THẬT|\|\s*\|/.test(line));
const willingCount = completedFeedbackRows.filter((line) => /\|\s*(Có|Yes|X)\s*\|/iu.test(line)).length;
check("R6: ≥5 feedback thật từ ≥5 người", completedFeedbackRows.length >= 5, `${completedFeedbackRows.length}/5 dòng hoàn chỉnh`);
check("R6: ≥2 willing users", willingCount >= 2, `${willingCount}/2`);
check("R6: có changelog từ validation", /## Changelog từ validation[\s\S]*\|\s*(?!\[CẦN DỮ LIỆU THẬT\])/u.test(feedback) && !/Feedback nguồn\s*\|\s*Thay đổi[\s\S]*\[CẦN DỮ LIỆU THẬT\]/u.test(feedback), "validation/feedback-log.md");

const reflectionFiles = readdirSync(resolve(root, "reflection"))
  .filter((name) => name.endsWith(".md") && !["README.md", "TEMPLATE.md"].includes(name));
check("Reflection: có file cá nhân", reflectionFiles.length > 0, `${reflectionFiles.length} file`);

const submissionText = [
  read("README.md"),
  read("spec.md"),
  feedback,
  ...reflectionFiles.map((name) => read(`reflection/${name}`)),
].join("\n");
check("R7: không còn placeholder bắt buộc", !/\[CẦN|CẦN DỮ LIỆU THẬT|\[THÀNH VIÊN|\[HỌ TÊN|\bTODO\b/u.test(submissionText), "README/spec/validation/reflection");
check("Demo: có demo-slides.pdf", hasFile("demo-slides.pdf"), "demo-slides.pdf");
check("Demo: có kịch bản 5 phút", hasFile("demo-script.md"), "demo-script.md");

const trackedData = git("ls-files", "data");
check("Bảo mật: data pack không bị track", trackedData.length === 0, trackedData ? `${trackedData.split(/\r?\n/).length} file còn bị track` : "0 file");

const passed = checks.filter((item) => item.passed).length;
console.log("| Gate | Trạng thái | Bằng chứng |");
console.log("|---|:---:|---|");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.evidence).replaceAll("|", "\\|")} |`);
}
console.log(`\nTổng: ${passed}/${checks.length} gate PASS.`);
console.log("Lưu ý: giờ nộp CP1-CP5 chỉ được xác minh trên hệ thống của khoá, không thể suy ra từ nội dung repo.");

if (passed !== checks.length) process.exitCode = 1;
