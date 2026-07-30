import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const defaultSourceUrl = new URL("../data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv", import.meta.url);
const inputArgument = process.argv.find((value) => value.startsWith("--input="))?.slice("--input=".length);
const source = inputArgument
  ? resolve(process.cwd(), inputArgument)
  : process.env.CHATLOG_PATH
    ? resolve(process.cwd(), process.env.CHATLOG_PATH)
    : defaultSourceUrl;

let csv;
try {
  csv = await readFile(source, "utf8");
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
    console.error(
      "Không tìm thấy data pack cục bộ. Đặt CHATLOG_PATH hoặc chạy với " +
      "--input=<đường-dẫn-chat_history_anonymized_for_hackathon.csv>.",
    );
    process.exit(1);
  }
  throw error;
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  const [rawHeader, ...dataRows] = rows;
  const header = rawHeader.map((item) => item.replace(/^\uFEFF/, ""));
  return dataRows
    .filter((item) => item.length === header.length)
    .map((item) => Object.fromEntries(header.map((key, index) => [key, item[index]])));
}

function countUnique(rows, key) {
  return new Set(rows.map((row) => row[key])).size;
}

function hasEmptyCitation(row) {
  return !row.citations.trim() || row.citations.trim() === "[]";
}

function roundPercent(part, total) {
  return Number((part * 100 / total).toFixed(1));
}

const rows = parseCsv(csv);
const studentRows = rows.filter((row) => row.role === "student");
const tutorRows = rows.filter((row) => row.role === "tutor");
const reviewRows = tutorRows.filter((row) => row.move_used === "review_concept");
const summaryPattern = /tóm tắt|tom tat|summar|ôn tập|on tap/iu;
const summaryRows = studentRows.filter((row) => summaryPattern.test(row.content));
const summaryTurnIds = new Set(summaryRows.map((row) => row.turn_id));
const summaryTutorRows = tutorRows.filter((row) => summaryTurnIds.has(row.turn_id));
const sampleIds = ["T0663", "T0896", "T1201", "T1190", "T0984"];

const report = {
  source: inputArgument || process.env.CHATLOG_PATH || "data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv",
  methodVersion: "1.0.0",
  totals: {
    messageRows: rows.length,
    studentTurns: studentRows.length,
    users: countUnique(studentRows, "user_id"),
    conversations: countUnique(studentRows, "conversation_id"),
  },
  candidates: {
    conceptReview: {
      turns: reviewRows.length,
      users: countUnique(reviewRows, "user_id"),
      conversations: countUnique(reviewRows, "conversation_id"),
      turnsPerUser: Number((reviewRows.length / countUnique(reviewRows, "user_id")).toFixed(2)),
      emptyCitationAnswers: reviewRows.filter(hasEmptyCitation).length,
      emptyCitationPercent: roundPercent(reviewRows.filter(hasEmptyCitation).length, reviewRows.length),
    },
    explicitSummaryOrReview: {
      rule: String(summaryPattern),
      turns: summaryRows.length,
      users: countUnique(summaryRows, "user_id"),
      conversations: countUnique(summaryRows, "conversation_id"),
      turnsPerUser: Number((summaryRows.length / countUnique(summaryRows, "user_id")).toFixed(2)),
      emptyCitationAnswers: summaryTutorRows.filter(hasEmptyCitation).length,
      emptyCitationPercent: roundPercent(summaryTutorRows.filter(hasEmptyCitation).length, summaryTutorRows.length),
    },
    openTutorQa: {
      turns: studentRows.length,
      users: countUnique(studentRows, "user_id"),
      conversations: countUnique(studentRows, "conversation_id"),
      turnsPerUser: Number((studentRows.length / countUnique(studentRows, "user_id")).toFixed(2)),
      emptyCitationAnswers: tutorRows.filter(hasEmptyCitation).length,
      emptyCitationPercent: roundPercent(tutorRows.filter(hasEmptyCitation).length, tutorRows.length),
    },
  },
  examples: sampleIds.map((turnId) => {
    const row = studentRows.find((item) => item.turn_id === turnId);
    if (!row) throw new Error(`Không tìm thấy ${turnId}.`);
    return {
      turnId,
      userId: row.user_id,
      conversationId: row.conversation_id,
      content: row.content,
    };
  }),
};

console.log(JSON.stringify(report, null, 2));
