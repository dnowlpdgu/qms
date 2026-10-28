// Shared edit and delete state for question lists (internal audit, location onboarding, quick audit).
const KEY = 'site-ready-question-edits-v1';

function readAll() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
}

function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full or blocked */ }
}

export function createQuestionEdits(type) {
  const bucket = () => {
    const all = readAll();
    const saved = all[type] && typeof all[type] === 'object' ? all[type] : {};
    return {
      all,
      text: saved.text && typeof saved.text === 'object' ? saved.text : {},
      deleted: saved.deleted && typeof saved.deleted === 'object' ? saved.deleted : {}
    };
  };
  const put = (all, text, deleted) => { all[type] = { text, deleted }; writeAll(all); };
  return {
    text(id, original) {
      const { text } = bucket();
      return typeof text[id] === 'string' ? text[id] : original;
    },
    setText(id, value, original) {
      const { all, text, deleted } = bucket();
      if (value === original) delete text[id]; else text[id] = value;
      put(all, text, deleted);
    },
    isDeleted(id) {
      return !!bucket().deleted[id];
    },
    remove(id) {
      const { all, text, deleted } = bucket();
      deleted[id] = true;
      put(all, text, deleted);
    },
    restore() {
      const { all, text } = bucket();
      put(all, text, {});
    },
    removedCount() {
      return Object.keys(bucket().deleted).length;
    }
  };
}

// Turns a text element into an inline editor. Enter or blur saves, Shift+Enter adds a line, Escape cancels.
export function editInPlace(node, value, onSave) {
  if (node.dataset.editing) return;
  node.dataset.editing = 'true';
  const area = document.createElement('textarea');
  area.className = 'question-edit';
  area.value = value;
  area.rows = Math.max(2, Math.ceil(value.length / 70));
  area.setAttribute('aria-label', 'Edit question');
  let done = false;
  const finish = save => {
    if (done) return;
    done = true;
    const next = area.value.trim();
    delete node.dataset.editing;
    area.replaceWith(node);
    if (save && next && next !== value) onSave(next);
  };
  area.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); finish(true); }
    else if (event.key === 'Escape') { event.preventDefault(); finish(false); }
  });
  area.addEventListener('blur', () => finish(true));
  node.replaceWith(area);
  area.focus();
  area.select();
}
