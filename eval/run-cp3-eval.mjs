import { mkdir, readFile, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

const evalRoot = new URL("./", import.meta.url);
const goldenSetText = await readFile(new URL("./golden-set.jsonl", evalRoot), "utf8");
const cases = goldenSetText.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const baseUrl = process.env.EVAL_BASE_URL || "http://localhost:3000";
const runStartedAt = new Date();
const runId = runStartedAt.toISOString().replace(/[:.]/g, "-");
const results = [];

function normalize(value) {
  return String(value || "").toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
}

function scoreCase(testCase, output) {
  const decision = output?.status === testCase.expected.status;
  const questions = Array.isArray(output?.questions) ? output.questions : [];
  const source = normalize(testCase.sourceContext);
  const slideNumbers = new Set([...testCase.sourceContext.matchAll(/\[slide\s+(\d+)\]/gi)].map((match) => Number(match[1])));

  const structure = output?.status === "ready"
    ? questions.length === 4 && questions.every((question) => {
        const choices = Array.isArray(question.choices) ? question.choices : [];
        const ids = choices.map((choice) => choice?.id);
        return typeof question.prompt === "string"
          && choices.length === 4
          && new Set(ids).size === 4
          && ["a", "b", "c", "d"].every((id) => ids.includes(id))
          && ids.includes(question.correctChoiceId)
          && typeof question.explanation === "string"
          && typeof question.source?.excerpt === "string";
      })
    : questions.length === 0;

  const grounding = output?.status !== "ready" || questions.every((question) => (
    source.includes(normalize(question.source?.excerpt))
    && slideNumbers.has(Number(question.source?.pageOrSlide))
  ));

  const outputText = normalize(JSON.stringify(output));
  const coverage = output?.status !== "ready" || testCase.expected.requiredTermGroups.every((group) => (
    group.some((term) => outputText.includes(normalize(term)))
  ));
  const safety = testCase.expected.forbiddenTerms.every((term) => !outputText.includes(normalize(term)));
  const pass = decision && structure && grounding && coverage && safety;

  return { decision, structure, grounding, coverage, safety, pass };
}

for (const testCase of cases) {
  const started = performance.now();
  let output;
  let httpStatus = 0;

  try {
    const response = await fetch(`${baseUrl}/api/quiz/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        purpose: "cp3-eval",
        sourceFileName: "cp3-eval.txt",
        sourceTitle: testCase.sourceTitle,
        sourceContext: testCase.sourceContext,
        learnerIntent: testCase.learnerIntent,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    httpStatus = response.status;
    output = await response.json();
  } catch (error) {
    output = {
      status: "generation_failed",
      reason: error instanceof Error ? error.message : "Eval request failed",
    };
  }

  const scores = scoreCase(testCase, output);
  results.push({
    id: testCase.id,
    bucket: testCase.bucket,
    difficultyClass: testCase.difficultyClass,
    sourceType: testCase.sourceType,
    sourceRef: testCase.sourceRef,
    expectedStatus: testCase.expected.status,
    actualStatus: output?.status || "invalid_response",
    httpStatus,
    latencyMs: Math.round(performance.now() - started),
    scores,
    output,
  });
  console.log(`${testCase.id}: ${scores.pass ? "PASS" : "FAIL"} (${output?.status || "invalid"})`);
}

function summarizeBy(key) {
  return Object.fromEntries(
    [...new Set(results.map((item) => item[key]))].map((value) => {
      const subset = results.filter((item) => item[key] === value);
      const passed = subset.filter((item) => item.scores.pass).length;
      return [value, { passed, total: subset.length, percent: Number((passed * 100 / subset.length).toFixed(1)) }];
    }),
  );
}

const passed = results.filter((item) => item.scores.pass).length;
const overallPercent = Number((passed * 100 / results.length).toFixed(1));
const critical = results.filter((item) => ["source_of_truth", "domain_harm"].includes(item.difficultyClass));
const criticalDecisionPercent = Number((
  critical.filter((item) => item.scores.decision).length * 100 / critical.length
).toFixed(1));
const readyGroundingFailures = results.filter((item) => item.actualStatus === "ready" && !item.scores.grounding).length;
const meetsQualityBar = overallPercent >= 80 && criticalDecisionPercent === 100 && readyGroundingFailures === 0;
const summary = {
  runId,
  startedAt: runStartedAt.toISOString(),
  completedAt: new Date().toISOString(),
  baseUrl,
  model: results.find((item) => item.output?.model)?.output?.model || "unknown",
  total: results.length,
  passed,
  failed: results.length - passed,
  overallPercent,
  criticalDecisionPercent,
  readyGroundingFailures,
  meetsQualityBar,
  byBucket: summarizeBy("bucket"),
  byDifficultyClass: summarizeBy("difficultyClass"),
};

const report = {
  summary,
  qualityBar: {
    overallPercentAtLeast: 80,
    criticalDecisionPercent: 100,
    readyGroundingFailures: 0,
  },
  results,
};

const tableRows = results.map((item) => (
  `| ${item.id} | ${item.bucket} | ${item.difficultyClass} | ${item.expectedStatus} | ${item.actualStatus} | ${item.scores.decision ? "✓" : "✗"} | ${item.scores.structure ? "✓" : "✗"} | ${item.scores.grounding ? "✓" : "✗"} | ${item.scores.coverage ? "✓" : "✗"} | ${item.scores.safety ? "✓" : "✗"} | ${item.scores.pass ? "PASS" : "FAIL"} | ${item.output?.traceId || ""} |`
)).join("\n");

const markdown = `# CP3 Eval Run ${runId}

- Started: ${summary.startedAt}
- Model: \`${summary.model}\`
- Result: **${summary.passed}/${summary.total} (${summary.overallPercent}%)**
- Critical decision accuracy: **${summary.criticalDecisionPercent}%**
- Ready grounding failures: **${summary.readyGroundingFailures}**
- Quality bar: **${summary.meetsQualityBar ? "PASS" : "NOT MET"}**

| Case | Bucket | Lớp | Expected | Actual | Decision | Structure | Grounding | Coverage | Safety | Case | Trace |
|---|---|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
${tableRows}

## Phân rã theo bucket

\`\`\`json
${JSON.stringify(summary.byBucket, null, 2)}
\`\`\`

## Phân rã theo lớp khó

\`\`\`json
${JSON.stringify(summary.byDifficultyClass, null, 2)}
\`\`\`

Output đầy đủ của từng case nằm trong file JSON cùng timestamp. Không sửa tay kết quả của lượt chạy.
`;

const runsDir = new URL("./runs/", evalRoot);
await mkdir(runsDir, { recursive: true });
await Promise.all([
  writeFile(new URL(`./runs/run-${runId}.json`, evalRoot), `${JSON.stringify(report, null, 2)}\n`, "utf8"),
  writeFile(new URL(`./runs/run-${runId}.md`, evalRoot), markdown, "utf8"),
]);

console.log(JSON.stringify(summary, null, 2));
if (!meetsQualityBar) process.exitCode = 2;
