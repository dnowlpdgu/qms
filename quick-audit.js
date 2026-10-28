import { quickAuditClauses, quickAuditRequiredSections } from './quick-audit-data.js';
import { RATING_OPTIONS } from './checklist-page.js';
import { exportQuickAuditWorkbook, exportQuickAuditWord, exportQuickAuditPowerPoint } from './quick-audit-export.js';
import { createQuestionEdits, editInPlace } from './question-edits.js';

const RATINGS_KEY = 'site-ready-quick-audit-v1';
const EVIDENCE_KEY = 'site-ready-quick-audit-evidence-v1';
const LOCATION_KEY = 'site-ready-quick-audit-location-v1';

const root = document.getElementById('quick-audit');
const countLine = document.getElementById('quick-count');
const status = document.getElementById('workbook-status');
const locationInput = document.getElementById('quick-location');
const restoreButton = document.getElementById('restore-questions');

function read(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const ratings = read(RATINGS_KEY);
const evidence = read(EVIDENCE_KEY);
const ratingOptions = [['', 'Not rated']].concat(RATING_OPTIONS);
const questionEdits = createQuestionEdits('quick-audit');
const baseQuestions = new Map(quickAuditClauses.flatMap(group => group.items.map(item => [item.id, item.question])));
let groups = [];
let items = [];
let coverage = {};

function rebuild() {
  groups = quickAuditClauses.map(group => ({
    ...group,
    items: group.items
      .filter(item => !questionEdits.isDeleted(item.id))
      .map(item => ({ ...item, question: questionEdits.text(item.id, baseQuestions.get(item.id)), clause: group.clause, clauseTitle: group.title }))
  }));
  items = groups.flatMap(group => group.items);
  coverage = {};
  for (const item of items) {
    for (const section of item.covers) {
      if (!coverage[section]) coverage[section] = [];
      coverage[section].push(item.id);
    }
  }
}

function ratingLabel(value) {
  const option = RATING_OPTIONS.find(([key]) => key === value);
  return option ? option[1] : '';
}

function updateCount() {
  const rated = items.filter(item => ratings[item.id]).length;
  const covered = quickAuditRequiredSections.filter(section => coverage[section]).length;
  countLine.textContent = items.length + ' questions cover ' + covered + ' of ' + quickAuditRequiredSections.length + ' requirement sections in clauses 4 to 10. Rated ' + rated + ' of ' + items.length + '.';
  const removed = questionEdits.removedCount();
  restoreButton.hidden = !removed;
  restoreButton.textContent = 'Restore ' + removed + ' removed question' + (removed === 1 ? '' : 's');
}

function renderItem(item) {
  const li = el('li', 'checklist-question');
  const text = el('div', 'checklist-question-text');
  const question = el('span', 'quick-question', item.question);
  question.tabIndex = 0;
  question.title = 'Click to edit';
  const remove = el('button', 'question-remove', 'Delete question');
  remove.type = 'button';
  remove.addEventListener('click', () => {
    questionEdits.remove(item.id);
    renderAll();
  });
  const edit = () => editInPlace(question, item.question, next => {
    questionEdits.setText(item.id, next, baseQuestions.get(item.id));
    renderAll();
  });
  question.addEventListener('click', edit);
  question.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); edit(); }
  });
  text.append(
    el('span', 'quick-ref', item.id + ' · ' + item.ref),
    el('span', 'quick-requirement', item.summary),
    question,
    remove
  );
  const select = el('select');
  select.id = item.id + '-rating';
  select.setAttribute('aria-label', item.id + ' rating');
  for (const [value, label] of ratingOptions) {
    const option = el('option', '', label);
    option.value = value;
    select.append(option);
  }
  select.value = ratings[item.id] || '';
  select.addEventListener('change', () => {
    if (select.value) ratings[item.id] = select.value; else delete ratings[item.id];
    write(RATINGS_KEY, ratings);
    updateCount();
  });
  const field = el('label', 'evidence-field');
  const area = el('textarea');
  area.rows = 2;
  area.value = evidence[item.id] || '';
  area.addEventListener('input', () => {
    if (area.value) evidence[item.id] = area.value; else delete evidence[item.id];
    write(EVIDENCE_KEY, evidence);
  });
  field.append(el('span', '', 'Response / evidence'), area);
  li.append(text, select, field);
  return li;
}

function renderAll() {
  rebuild();
  root.replaceChildren();
  for (const group of groups) {
    if (!group.items.length) continue;
    const section = el('section', 'clause-checklist');
    section.id = 'clause-' + group.clause;
    const heading = el('h2');
    heading.append(el('span', '', group.clause), document.createTextNode(group.title));
    const list = el('ul');
    for (const item of group.items) list.append(renderItem(item));
    section.append(heading, el('p', 'clause-summary', group.summary), list);
    root.append(section);
  }
  updateCount();
}

restoreButton.addEventListener('click', () => {
  questionEdits.restore();
  renderAll();
});

renderAll();

locationInput.value = localStorage.getItem(LOCATION_KEY) || '';
locationInput.addEventListener('input', () => localStorage.setItem(LOCATION_KEY, locationInput.value));

function buildReport() {
  return {
    location: locationInput.value.trim(),
    ratingScale: RATING_OPTIONS.map(([, label]) => label),
    sections: quickAuditRequiredSections,
    coverage,
    groups: groups.filter(group => group.items.length).map(group => ({
      clause: group.clause,
      title: group.title,
      summary: group.summary,
      items: group.items.map(item => ({
        id: item.id,
        ref: item.ref,
        summary: item.summary,
        question: item.question,
        covers: item.covers,
        rating: ratingLabel(ratings[item.id] || ''),
        evidence: evidence[item.id] || ''
      }))
    }))
  };
}

const exporters = [
  ['export-xlsx', 'Excel', exportQuickAuditWorkbook],
  ['export-docx', 'Word', exportQuickAuditWord],
  ['export-pptx', 'PowerPoint', exportQuickAuditPowerPoint]
];
for (const [id, label, exporter] of exporters) {
  document.getElementById(id).addEventListener('click', async () => {
    status.textContent = 'Preparing ' + label + ' export…';
    try {
      await exporter(buildReport());
      status.textContent = label + ' export ready.';
    } catch (error) {
      status.textContent = 'Export failed: ' + error.message;
    }
  });
}
