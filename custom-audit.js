import { mountChecklistPage } from "./checklist-page.js";
import { createChecklistStore } from "./checklist-edits.js";
import { readAuditWorkbook } from "./custom-audit-import.js";

// Custom audits: a list of named audits, each with its own questions, ratings and evidence.
const LIST_KEY = "site-ready-custom-audits-v1";
const root = document.getElementById("checklists");
const select = document.getElementById("audit-select");
const nameField = document.getElementById("audit-name");
const newButton = document.getElementById("new-audit");
const deleteButton = document.getElementById("delete-audit");
const importButton = document.getElementById("import-excel");
const importFile = document.getElementById("import-file");
const workbookStatus = document.getElementById("workbook-status");

function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(LIST_KEY) || "{}") || {};
    return { audits: Array.isArray(value.audits) ? value.audits : [], current: value.current || "" };
  } catch {
    return { audits: [], current: "" };
  }
}

let state = readState();
const saveState = () => localStorage.setItem(LIST_KEY, JSON.stringify(state));
const newId = () => "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function createAudit() {
  const audit = { id: newId(), name: "Custom audit " + (state.audits.length + 1) };
  state.audits.push(audit);
  state.current = audit.id;
  return audit;
}

if (!state.audits.length) createAudit();
if (!state.audits.some(audit => audit.id === state.current)) state.current = state.audits[0].id;
saveState();

const currentAudit = () => state.audits.find(audit => audit.id === state.current) || state.audits[0];
const slug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "audit";

const ratingKeyFor = id => "site-ready-custom-audit-" + id + "-ratings-v1";
const evidenceKeyFor = id => "site-ready-custom-audit-" + id + "-evidence-v1";

// Imported audits carry their sections; other audits start with one empty group.
function groupsFor(audit) {
  if (audit.sections?.length) return audit.sections.map(section => ({ id: section.id, label: section.label, title: section.title, anchor: "section-" + section.id, items: section.items }));
  return [{ id: "custom", label: "", title: audit.name, anchor: "custom-questions", items: [] }];
}

function renderSelect() {
  select.replaceChildren(...state.audits.map(audit => {
    const option = document.createElement("option");
    option.value = audit.id;
    option.textContent = audit.name;
    return option;
  }));
  select.value = state.current;
}

function show() {
  const audit = currentAudit();
  nameField.value = audit.name;
  renderSelect();
  mountChecklistPage({
    type: "custom-audit-" + audit.id,
    exportType: "custom-" + slug(audit.name),
    title: audit.name,
    groups: groupsFor(audit),
    ratingKey: ratingKeyFor(audit.id),
    evidenceKey: evidenceKeyFor(audit.id),
    root,
    addable: true
  });
}

select.addEventListener("change", () => {
  state.current = select.value;
  saveState();
  show();
});

newButton.addEventListener("click", () => {
  createAudit();
  saveState();
  show();
  nameField.focus();
  nameField.select();
});

nameField.addEventListener("change", () => {
  const audit = currentAudit();
  const name = nameField.value.trim();
  if (!name) {
    nameField.value = audit.name;
    return;
  }
  audit.name = name;
  saveState();
  show();
});

deleteButton.addEventListener("click", () => {
  const audit = currentAudit();
  if (!confirm('Delete "' + audit.name + '" with its questions, ratings and evidence?')) return;
  state.audits = state.audits.filter(entry => entry.id !== audit.id);
  localStorage.removeItem("site-ready-custom-audit-" + audit.id + "-ratings-v1");
  localStorage.removeItem("site-ready-custom-audit-" + audit.id + "-evidence-v1");
  createChecklistStore("custom-audit-" + audit.id).clear();
  if (!state.audits.length) createAudit();
  state.current = state.audits[0].id;
  saveState();
  show();
});

importButton.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  importFile.value = "";
  if (!file) return;
  try {
    const result = await readAuditWorkbook(file);
    const id = newId();
    const name = file.name.replace(/\.[^.]+$/, "").trim() || "Imported audit";
    state.audits.push({ id, name, sections: result.sections });
    state.current = id;
    saveState();
    localStorage.setItem(ratingKeyFor(id), JSON.stringify(result.ratings));
    localStorage.setItem(evidenceKeyFor(id), JSON.stringify(result.evidence));
    show();
    let message = "Imported " + result.count + " question" + (result.count === 1 ? "" : "s") + " in " + result.sections.length + " section" + (result.sections.length === 1 ? "" : "s") + ".";
    if (result.skipped) message += " " + result.skipped + " row" + (result.skipped === 1 ? " was" : "s were") + " skipped because the question was empty.";
    if (result.unmatched) message += " " + result.unmatched + " assessment" + (result.unmatched === 1 ? " was" : "s were") + " not recognised and left unrated.";
    workbookStatus.textContent = message;
    workbookStatus.classList.remove("error");
  } catch (error) {
    console.error(error);
    workbookStatus.textContent = "Import failed: " + error.message;
    workbookStatus.classList.add("error");
  }
});

show();
