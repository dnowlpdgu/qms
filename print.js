// Print to PDF for Onboarding, Internal audit, Quick audit and Custom audit.
// Adds a PDF button. Before printing, answers are shown as plain text, collapsed sections are opened
// and a report heading is added. Everything is put back after printing.
const PAGES = ['readiness', 'audit', 'quick-audit', 'custom-audit'];
const page = document.body.dataset.page;

let undo = [];

if (PAGES.includes(page)) mount();

function mount() {
  const host = document.querySelector('.file-actions');
  if (host) {
    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'button';
    button.id = 'print-pdf';
    button.textContent = '↓ PDF';
    button.addEventListener('click', () => window.print());
    host.append(button);
  }
  window.addEventListener('beforeprint', prepare);
  window.addEventListener('afterprint', restore);
}

function valueOf(field) {
  if (field.tagName === 'SELECT') return field.selectedOptions[0]?.textContent.trim() || 'Not recorded';
  return field.value.trim() || '—';
}

const PREFIX = { note: 'Evidence / justification: ', finding: 'Finding: ', action: 'Corrective action: ' };

function prepare() {
  restore();
  const main = document.querySelector('main') || document.body;

  // Open collapsed sections so the whole checklist prints.
  main.querySelectorAll('.section-items[hidden]').forEach(node => {
    node.hidden = false;
    undo.push(() => { node.hidden = true; });
  });

  // Show each answer as text in place of its form control.
  main.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.closest('[hidden], dialog, .print-value')) return;
    if (field.classList.contains('question-edit') || field.classList.contains('checklist-edit')) return;
    if (['button', 'submit', 'search', 'hidden', 'checkbox', 'radio', 'file'].includes(field.type)) return;
    const value = document.createElement('span');
    value.className = 'print-value';
    value.textContent = (PREFIX[field.dataset.field] || '') + valueOf(field);
    const previous = field.style.display;
    field.style.display = 'none';
    field.after(value);
    undo.push(() => { field.style.display = previous; value.remove(); });
  });

  // Report heading.
  const heading = document.querySelector('.page-heading h1, main h1');
  const name = document.getElementById('audit-name')?.value.trim();
  const location = (document.getElementById('quick-location') || document.getElementById('location'))?.value.trim();
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const cover = document.createElement('header');
  cover.className = 'print-cover';
  const brand = document.createElement('p');
  brand.className = 'print-brand';
  brand.textContent = 'Site Ready · Quality management workspace';
  const title = document.createElement('h1');
  title.textContent = name || heading?.textContent || document.title;
  const meta = document.createElement('p');
  meta.className = 'print-meta';
  meta.textContent = [name && heading ? heading.textContent : '', location ? 'Location: ' + location : '', 'Printed ' + date].filter(Boolean).join(' · ');
  cover.append(brand, title, meta);
  main.prepend(cover);
  undo.push(() => cover.remove());
}

function restore() {
  while (undo.length) undo.pop()();
}
