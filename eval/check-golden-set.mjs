import { readFile } from "node:fs/promises";

const goldenSetUrl = new URL("./golden-set.jsonl", import.meta.url);
const text = await readFile(goldenSetUrl, "utf8");
const cases = text.split(/\r?\n/).filter(Boolean).map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`JSONL không hợp lệ ở dòng ${index + 1}: ${error.message}`);
  }
});

const ids = new Set(cases.map((item) => item.id));
const classCounts = cases.reduce((counts, item) => {
  counts[item.difficultyClass] = (counts[item.difficultyClass] || 0) + 1;
  return counts;
}, {});
const bucketCounts = cases.reduce((counts, item) => {
  counts[item.bucket] = (counts[item.bucket] || 0) + 1;
  return counts;
}, {});
const chatlogCount = cases.filter((item) => item.sourceType === "chatlog").length;

const failures = [];
if (cases.length < 20) failures.push(`Cần ít nhất 20 case, hiện có ${cases.length}.`);
if (ids.size !== cases.length) failures.push("Có ID case bị trùng.");
if (chatlogCount < 10) failures.push(`Cần ít nhất 10 case từ chatlog, hiện có ${chatlogCount}.`);
if ((bucketCounts.normal || 0) < 8 || (bucketCounts.normal || 0) > 10) failures.push("Bucket normal phải có 8-10 case.");
if ((bucketCounts.rare || 0) < 2 || (bucketCounts.rare || 0) > 4) failures.push("Bucket rare phải có 2-4 case.");

for (const difficultyClass of ["source_of_truth", "ambiguity", "out_of_scope", "domain_harm"]) {
  if ((classCounts[difficultyClass] || 0) < 2) failures.push(`Lớp ${difficultyClass} cần ít nhất 2 case.`);
}

for (const item of cases) {
  if (!item.expected || !["ready", "insufficient_content", "out_of_scope"].includes(item.expected.status)) {
    failures.push(`${item.id}: expected.status không hợp lệ.`);
  }
  if (typeof item.sourceContext !== "string" || !item.sourceContext.trim()) {
    failures.push(`${item.id}: thiếu sourceContext.`);
  }
}

console.log(JSON.stringify({
  total: cases.length,
  chatlogCount,
  bucketCounts,
  classCounts,
  valid: failures.length === 0,
  failures,
}, null, 2));

if (failures.length) process.exitCode = 1;
