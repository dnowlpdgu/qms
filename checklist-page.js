import { exportChecklistWorkbook } from "./exports.js";
import { createChecklistStore } from "./checklist-edits.js";

export const RATING_OPTIONS = [["5", "5 - Exceeds"], ["4", "4 - Conforms"], ["3", "3 - OFI"], ["2", "2 - Minor NCR"], ["1", "1 - NCR"]];

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch { return {}; }
}

// groups: [{ id, label, title, anchor, items: [question, ...] }]
// Questions can be edited in place and deleted. Edits are stored by checklist-edits.js under `type`.
// addable: show a form that adds a question to the first group.
// exportType: optional name for the workbook file (defaults to type).
export function mountChecklistPage({ type, exportType, title, groups, ratingKey, evidenceKey, root, addable = false }) {
  const ratings = load(ratingKey);
  const evidence = load(evidenceKey);
  const store = createChecklistStore(type);
  const status = document.getElementById("workbook-status");
  const empty = document.getElementById("checklist-empty");
  let items = [];
  if (empty) empty.hidden = groups.length > 0;

  const saveRatings = () => localStorage.setItem(ratingKey, JSON.stringify(ratings));
  const saveEvidence = () => localStorage.setItem(evidenceKey, JSON.stringify(evidence));

  const setStatus = (message, error = false) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error", error);
  };

  function questionText(id, question) {
    const text = document.createElement("span");
    text.className = "checklist-question-text";
    text.textContent = question;
    text.tabIndex = 0;
    text.title = "Click to edit";
    text.addEventListener("click", () => editQuestion(text, id));
    text.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        editQuestion(text, id);
      }
    });
    return text;
  }

  function editQuestion(text, id) {
    const entry = items.find(item => item.id === id);
    if (!entry) return;
    const field = document.createElement("textarea");
    field.className = "checklist-edit";
    field.rows = 2;
    field.value = entry.question;
    field.setAttribute("aria-label", "Edit question");
    let done = false;
    const finish = save => {
      if (done) return;
      done = true;
      const value = field.value.trim();
      if (save && value && value !== entry.question) {
        entry.question = value;
        store.setText(id, value);
      }
      field.replaceWith(questionText(id, entry.question));
    };
    field.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      } else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        finish(true);
      }
    });
    field.addEventListener("blur", () => finish(true));
    text.replaceWith(field);
    field.focus();
    field.select();
  }

  function questionItem(id, question, label) {
    const item = document.createElement("li");
    item.className = "checklist-question";
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Rating for " + label + ": " + question);
    const prompt = document.createElement("option");
    prompt.value = "";
    prompt.textContent = "Select rating";
    select.append(prompt);
    for (const [value, text] of RATING_OPTIONS) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.append(option);
    }
    select.value = ratings[id] || "";
    select.addEventListener("change", () => {
      if (select.value) ratings[id] = Number(select.value);
      else delete ratings[id];
      saveRatings();
    });
    const evidenceLabel = document.createElement("label");
    evidenceLabel.className = "evidence-field";
    const evidenceCaption = document.createElement("span");
    evidenceCaption.textContent = "Response / evidence";
    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    textarea.placeholder = "Record response, evidence reviewed, or notes";
    textarea.setAttribute("aria-label", "Response or evidence for " + label + ": " + question);
    textarea.value = evidence[id] || "";
    textarea.addEventListener("input", () => {
      if (textarea.value.trim()) evidence[id] = textarea.value;
      else delete evidence[id];
      saveEvidence();
    });
    evidenceLabel.append(evidenceCaption, textarea);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "question-delete";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete question: " + question);
    remove.addEventListener("click", () => {
      store.remove(id);
      render();
    });
    item.append(questionText(id, question), select, remove, evidenceLabel);
    return item;
  }

  function footer() {
    const wrap = document.createElement("div");
    wrap.className = "checklist-footer";
    const removed = store.removedCount();
    if (removed) {
      const restore = document.createElement("button");
      restore.type = "button";
      restore.className = "text-button";
      restore.textContent = "Restore " + removed + " removed question" + (removed === 1 ? "" : "s");
      restore.addEventListener("click", () => {
        store.restore();
        render();
      });
      wrap.append(restore);
    }
    if (addable && groups[0]) {
      const form = document.createElement("form");
      form.className = "checklist-add";
      const label = document.createElement("label");
      label.textContent = "New question";
      const field = document.createElement("textarea");
      field.rows = 2;
      field.placeholder = "Type the question";
      label.append(field);
      const add = document.createElement("button");
      add.type = "submit";
      add.className = "button";
      add.textContent = "Add question";
      form.addEventListener("submit", event => {
        event.preventDefault();
        const value = field.value.trim();
        if (!value) {
          field.focus();
          return;
        }
        store.add(groups[0].id, value);
        render();
        root?.querySelector(".checklist-add textarea")?.focus();
      });
      form.append(label, add);
      wrap.append(form);
    }
    return wrap;
  }

  function render() {
    root?.replaceChildren();
    items = [];
    for (const group of groups) {
      const questions = store.effectiveItems(group);
      if (!questions.length) continue;
      const label = (group.label ? group.label + " " : "") + group.title;
      const section = document.createElement("section");
      section.id = group.anchor;
      section.className = "clause-checklist";
      const heading = document.createElement("h2");
      if (group.label) {
        const number = document.createElement("span");
        number.textContent = group.label;
        heading.append(number, " " + group.title);
      } else {
        heading.textContent = group.title;
      }
      const list = document.createElement("ul");
      for (const { id, question } of questions) {
        items.push({ id, section: label, question });
        list.append(questionItem(id, question, label));
      }
      section.append(heading, list);
      root?.append(section);
    }
    root?.append(footer());
  }

  const exportButton = document.getElementById("export-xlsx");
  if (exportButton) {
    exportButton.onclick = async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        await exportChecklistWorkbook({ type: exportType || type, title, items, ratings, evidence, ratingOptions: RATING_OPTIONS });
        setStatus("Workbook downloaded.");
      } catch (error) {
        console.error(error);
        setStatus("Export failed: " + error.message, true);
      } finally {
        button.disabled = false;
      }
    };
  }

  render();
}
