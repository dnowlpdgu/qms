// Per-checklist edits: changed question text, deleted questions and questions added by the user.
// Stored in one localStorage object, keyed by checklist type. Base questions keep their IDs
// (group id + position), so ratings and evidence stay attached when a question is edited.
const KEY = "site-ready-checklist-edits-v1";

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; }
}

function writeAll(all) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

// type: a checklist key such as "clause-checklists" or "custom-audit-<id>".
export function createChecklistStore(type) {
  const read = () => {
    const all = readAll();
    const bucket = all[type] || {};
    return { all, bucket: { edits: bucket.edits || {}, added: bucket.added || [] } };
  };
  const write = (all, bucket) => {
    all[type] = bucket;
    writeAll(all);
  };

  return {
    // group: { id, items: [question, ...] }. Returns the questions still in use, with edits applied.
    effectiveItems(group) {
      const { bucket } = read();
      const base = [];
      group.items.forEach((question, index) => {
        const id = group.id + "-" + (index + 1);
        const edit = bucket.edits[id] || {};
        if (!edit.deleted) base.push({ id, question: edit.text ?? question });
      });
      const added = bucket.added
        .filter(entry => entry.group === group.id)
        .map(({ id, question }) => ({ id, question }));
      return [...base, ...added];
    },
    setText(id, question) {
      const { all, bucket } = read();
      const added = bucket.added.find(entry => entry.id === id);
      if (added) added.question = question;
      else bucket.edits[id] = { ...(bucket.edits[id] || {}), text: question };
      write(all, bucket);
    },
    remove(id) {
      const { all, bucket } = read();
      const index = bucket.added.findIndex(entry => entry.id === id);
      if (index >= 0) bucket.added.splice(index, 1);
      else bucket.edits[id] = { ...(bucket.edits[id] || {}), deleted: true };
      write(all, bucket);
    },
    add(group, question) {
      const { all, bucket } = read();
      const id = "added-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
      bucket.added.push({ id, group, question });
      write(all, bucket);
      return id;
    },
    // Number of base questions removed (added questions are removed outright).
    removedCount() {
      const { bucket } = read();
      return Object.values(bucket.edits).filter(edit => edit.deleted).length;
    },
    // Put back every removed base question. Edited text is kept.
    restore() {
      const { all, bucket } = read();
      for (const [id, edit] of Object.entries(bucket.edits)) {
        delete edit.deleted;
        if (!Object.keys(edit).length) delete bucket.edits[id];
      }
      write(all, bucket);
    },
    // Forget everything stored for this checklist (used when a custom audit is deleted).
    clear() {
      const all = readAll();
      delete all[type];
      writeAll(all);
    }
  };
}
