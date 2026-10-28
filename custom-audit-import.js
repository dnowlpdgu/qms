// Reads an Excel (or CSV) file with the columns:
// Section ID, Section Title, Question, Assessment, Evidence
// and turns its rows into custom audit sections, ratings and evidence.
import { library } from "./exports.js";
import { RATING_OPTIONS } from "./checklist-page.js";

const HEADERS = { id: "section id", title: "section title", question: "question", assessment: "assessment", evidence: "evidence" };

// Matches "4", "4 - Conforms", or "Conforms" (case-insensitive) to a rating value.
function ratingFor(text) {
  const value = String(text ?? "").trim().toLowerCase();
  if (!value) return { rating: null };
  for (const [number, label] of RATING_OPTIONS) {
    const short = label.split(" - ")[1].toLowerCase();
    if (value === number || value === label.toLowerCase() || value === short) return { rating: Number(number) };
  }
  return { rating: null, unmatched: true };
}

export async function readAuditWorkbook(file) {
  const XLSX = await library("vendor/xlsx.full.min.js", "XLSX");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The workbook has no sheets.");
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false, blankrows: false });
  const headerRow = (rows[0] || []).map(cell => String(cell).trim().toLowerCase());
  const column = name => headerRow.indexOf(HEADERS[name]);
  if (column("question") < 0) throw new Error('The first row needs a "Question" column.');

  const cell = (row, index) => (index >= 0 ? String(row[index] ?? "").trim() : "");
  const sections = [];
  const byKey = new Map();
  const ratings = {};
  const evidence = {};
  let skipped = 0;
  let unmatched = 0;

  for (const row of rows.slice(1)) {
    const question = cell(row, column("question"));
    if (!question) {
      if (row.some(value => String(value).trim())) skipped++;
      continue;
    }
    const sectionId = cell(row, column("id"));
    const sectionTitle = cell(row, column("title"));
    const key = sectionId + "|" + sectionTitle;
    let section = byKey.get(key);
    if (!section) {
      section = { id: "s" + sections.length, label: sectionId, title: sectionTitle, items: [] };
      byKey.set(key, section);
      sections.push(section);
    }
    const itemId = section.id + "-" + (section.items.length + 1);
    section.items.push(question);

    const result = ratingFor(cell(row, column("assessment")));
    if (result.unmatched) unmatched++;
    if (result.rating) ratings[itemId] = result.rating;
    const note = cell(row, column("evidence"));
    if (note) evidence[itemId] = note;
  }

  const count = sections.reduce((sum, section) => sum + section.items.length, 0);
  if (!count) throw new Error("No questions found in the file.");
  return { sections, ratings, evidence, count, skipped, unmatched };
}
