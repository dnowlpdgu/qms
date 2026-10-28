// Save and import the answers on Onboarding, Internal audit and Quick audit as one JSON file.
import { download } from './exports.js';

const SCHEMA = 'SiteReady/Backup';
const QUESTION_EDITS_KEY = 'site-ready-question-edits-v1';

const PAGES = {
  readiness: { label: 'Onboarding', questionType: 'readiness', keys: ['site-ready-assessment-v1'] },
  audit: { label: 'Internal audit', questionType: 'audit', keys: ['site-ready-internal-audit-v1'] },
  'quick-audit': {
    label: 'Quick audit',
    questionType: 'quick-audit',
    keys: ['site-ready-quick-audit-v1', 'site-ready-quick-audit-evidence-v1', 'site-ready-quick-audit-location-v1'],
    rawKeys: ['site-ready-quick-audit-location-v1']
  }
};

const page = document.body.dataset.page;
const config = PAGES[page];
const host = document.querySelector('.file-actions');
if (config && host) mount();

function mount() {
  const save = document.createElement('button');
  save.className = 'button';
  save.type = 'button';
  save.textContent = '↓ Save data';

  const load = document.createElement('button');
  load.className = 'button';
  load.type = 'button';
  load.textContent = '↑ Import data';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.hidden = true;

  const status = document.createElement('span');
  status.className = 'backup-status';
  status.setAttribute('role', 'status');

  host.append(save, load, input, status);
  save.addEventListener('click', () => saveData(status));
  load.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    input.value = '';
    if (file) importData(file, status);
  });
}

function readRaw(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function readQuestionEdits() {
  try {
    const all = JSON.parse(readRaw(QUESTION_EDITS_KEY));
    return all && typeof all === 'object' ? all : {};
  } catch { return {}; }
}

function saveData(status) {
  const data = {};
  for (const key of config.keys) data[key] = readRaw(key);
  const all = readQuestionEdits();
  const payload = {
    schema: SCHEMA,
    version: 1,
    page,
    savedAt: new Date().toISOString(),
    data,
    questionEdits: all[config.questionType] ?? null
  };
  const name = 'site-ready-' + page + '-' + new Date().toISOString().slice(0, 10) + '.json';
  download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), name);
  show(status, 'Saved to ' + name + '.');
}

function isJson(text) {
  try { JSON.parse(text); return true; } catch { return false; }
}

function validate(payload) {
  if (!payload || typeof payload !== 'object') return 'This file is not a Site Ready backup.';
  if (payload.schema !== SCHEMA) return 'This file is not a Site Ready backup.';
  if (payload.page !== page) return 'This backup is for ' + (PAGES[payload.page]?.label || 'another page') + ', not ' + config.label + '.';
  if (!payload.data || typeof payload.data !== 'object') return 'The backup has no data.';
  for (const key of config.keys) {
    const value = payload.data[key];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return 'The backup data is damaged.';
    if (!(config.rawKeys || []).includes(key) && !isJson(value)) return 'The backup data is damaged.';
  }
  const edits = payload.questionEdits;
  if (edits !== null && edits !== undefined && (typeof edits !== 'object' || Array.isArray(edits))) return 'The backup data is damaged.';
  return null;
}

function importData(file, status) {
  const reader = new FileReader();
  reader.onload = () => {
    let payload;
    try { payload = JSON.parse(reader.result); } catch {
      show(status, 'This file is not a valid backup.', true);
      return;
    }
    const problem = validate(payload);
    if (problem) {
      show(status, problem, true);
      return;
    }
    if (!window.confirm('Replace the current ' + config.label + ' data with this backup?')) return;
    try {
      for (const key of config.keys) {
        const value = payload.data[key];
        if (value === undefined || value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
      const all = readQuestionEdits();
      if (payload.questionEdits) all[config.questionType] = payload.questionEdits;
      else delete all[config.questionType];
      localStorage.setItem(QUESTION_EDITS_KEY, JSON.stringify(all));
    } catch {
      show(status, 'The backup could not be stored on this device.', true);
      return;
    }
    show(status, 'Imported. Reloading…');
    setTimeout(() => location.reload(), 400);
  };
  reader.onerror = () => show(status, 'The file could not be read.', true);
  reader.readAsText(file);
}

function show(status, message, error = false) {
  status.textContent = message;
  status.classList.toggle('error', error);
}
