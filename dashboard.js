import { clauseChecklists } from "./checklists-data.js";
import { createChecklistStore } from "./checklist-edits.js";
const STORAGE_KEY = "site-ready-clause-checklists-v1";
const EVIDENCE_KEY = "site-ready-clause-checklist-evidence-v1";
const RATING_NAMES = { 5: "Exceeds", 4: "Conforms", 3: "OFI", 2: "Minor NCR", 1: "NCR" };
let answers = {};
try { answers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { answers = {}; }
let evidence = {};
try { evidence = JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "{}"); } catch { evidence = {}; }
document.getElementById("dash-evidence").textContent = String(Object.values(evidence).filter(value => String(value).trim()).length);
// Deleted questions are left out of every count and chart; edited text is not shown here.
const store = createChecklistStore("clause-checklists");
const all = clauseChecklists.flatMap(([clause, title, questions]) => store.effectiveItems({ id: clause, items: questions }).map(item => ({ clause, title, id: item.id })));
const scored = all.filter(item => [1,2,3,4,5].includes(Number(answers[item.id])));
const average = scored.length ? scored.reduce((sum, item) => sum + Number(answers[item.id]), 0) / scored.length : null;
document.getElementById("dash-completion").textContent = Math.round(scored.length / (all.length || 1) * 100) + "%";
document.getElementById("dash-completed-count").textContent = scored.length + " of " + all.length + " rated";
document.getElementById("dash-average").textContent = average === null ? "—" : average.toFixed(2);
document.getElementById("dash-ncr").textContent = String(scored.filter(item => Number(answers[item.id]) <= 2).length);
function renderBars(target, values, max, formatter) {
  const root = document.getElementById(target);
  root.replaceChildren();
  for (const row of values) {
    const line = document.createElement(row.href ? "a" : "div");
    line.className = "dashboard-bar-row";
    if (row.href) line.href = row.href;
    const label = document.createElement("span");
    label.className = "dashboard-bar-label";
    label.textContent = row.label;
    const track = document.createElement("div");
    track.className = "dashboard-bar-track";
    const fill = document.createElement("span");
    fill.className = "dashboard-bar-fill";
    fill.style.width = Math.max(0, Math.min(100, row.value / max * 100)) + "%";
    fill.style.backgroundColor = row.color || "#464646";
    track.append(fill);
    const value = document.createElement("strong");
    value.className = "dashboard-bar-value";
    value.textContent = formatter(row.value);
    line.append(label, track, value);
    root.append(line);
  }
}
const distribution = [5,4,3,2,1].map(score => ({ label: score + " · " + RATING_NAMES[score], href: "checklists.html?rating=" + score, value: scored.filter(item => Number(answers[item.id]) === score).length, color: score >= 4 ? "#6a6a6a" : score === 3 ? "#c5a44b" : score === 2 ? "#d98b4b" : "#bd5c4d" }));
renderBars("rating-chart", distribution, Math.max(1, ...distribution.map(row => row.value)), v => String(v));
const chapterStats = Array.from({length: 10}, (_, i) => String(i + 1)).map(clause => {
  const items = scored.filter(item => item.clause === clause || item.clause.startsWith(clause + "."));
  const score = items.length ? items.reduce((sum, item) => sum + Number(answers[item.id]), 0) / items.length : 0;
  return { label: "Clause " + clause, href: "checklists.html#clause-" + clause, value: score, color: score ? (score <= 2 ? "#bd5c4d" : score < 4 ? "#c5a44b" : "#6a6a6a") : "#e2e2e2", count: items.length };
});
renderBars("clause-chart", chapterStats, 5, value => value ? value.toFixed(2) : "—");
for (const [i, row] of chapterStats.entries()) {
  const el = document.querySelectorAll("#clause-chart .dashboard-bar-row")[i];
  if (el) el.title = row.count ? row.count + " ratings" : "No ratings";
}
