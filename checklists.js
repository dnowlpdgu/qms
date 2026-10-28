import { clauseChecklists } from "./checklists-data.js";
import { mountChecklistPage } from "./checklist-page.js";

mountChecklistPage({
  type: "clause-checklists",
  title: "Clause checklists",
  groups: clauseChecklists.map(([clause, title, questions]) => ({
    id: clause,
    label: clause,
    title,
    anchor: "clause-" + clause.replace(/\./g, "-"),
    items: questions
  })),
  ratingKey: "site-ready-clause-checklists-v1",
  evidenceKey: "site-ready-clause-checklist-evidence-v1",
  root: document.getElementById("checklists")
});

// Opened from a dashboard rating (checklists.html?rating=N): highlight the questions with that rating.
const rating = new URLSearchParams(location.search).get("rating");
if (rating) {
  const matches = [...document.querySelectorAll("#checklists .checklist-question")]
    .filter(item => item.querySelector("select")?.value === rating);
  for (const item of matches) item.classList.add("is-match");
  matches[0]?.scrollIntoView({ block: "center" });
}
