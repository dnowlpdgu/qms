// Demo data for Onboarding, Internal audit, Quick audit and Custom audit.
// "Demo" fills all four with sample answers and keeps a copy of the data it replaces.
// "Clear demo" puts that copy back and removes the Demo audit.
import { readinessSections } from "./readiness-data.js";
import { auditSections } from "./audit-data.js";
import { quickAuditClauses } from "./quick-audit-data.js";

const PAGES = ["readiness", "audit", "quick-audit", "custom-audit"];
const BACKUP_KEY = "site-ready-demo-backup-v1";
const LIST_KEY = "site-ready-custom-audits-v1";
const DEMO_ID = "demo";
const KEYS = [
  "site-ready-assessment-v1",
  "site-ready-internal-audit-v1",
  "site-ready-quick-audit-v1",
  "site-ready-quick-audit-evidence-v1",
  "site-ready-quick-audit-location-v1",
  LIST_KEY,
  "site-ready-custom-audit-" + DEMO_ID + "-ratings-v1",
  "site-ready-custom-audit-" + DEMO_ID + "-evidence-v1"
];

const READY = ["ready", "ready", "partial", "ready", "gap", "ready", "ready", "na", "ready", "partial", "ready", "ready"];
const AUDIT = ["conform", "conform", "ofi", "conform", "conform", "minor", "conform", "na", "conform", "conform", "ofi", "conform", "conform", "minor"];
const QUICK = ["4", "5", "4", "3", "4", "4", "2", "5", "4", "4"];
const OK_NOTES = ["Checked on the walk-through; records sighted.", "Confirmed with the shift supervisor.", "Procedure and sign-off record reviewed.", "Observed working as described on the day."];
const GAP_NOTES = ["Drafted but not yet approved.", "Only partly applied on the night shift.", "No record found for the last quarter."];
const NA_NOTE = "Not applicable: no outsourced design work at this site.";

const iso = date => date.toISOString().slice(0, 10);
const daysFromNow = days => iso(new Date(Date.now() + days * 86400000));
const pick = (list, n) => list[n % list.length];

function noteFor(status, n) {
  if (status === "na") return NA_NOTE;
  if (status === "ready" || status === "conform" || status === "ofi") return pick(OK_NOTES, n);
  return pick(GAP_NOTES, n);
}

function sampleMeta() {
  return {
    organization: "Northgate Logistics Ltd",
    location: "Site 12 · Riverside depot",
    "assessment-date": iso(new Date()),
    "assessment-lead": "A. Patel",
    scope: "Warehouse, dispatch and returns",
    criteria: "ISO 9001:2026"
  };
}

function onboardingState() {
  const answers = {};
  let n = 0;
  readinessSections.forEach((section, si) => section.items.forEach((_, ii) => {
    const status = pick(READY, n);
    answers[si + "-" + ii] = { status, note: noteFor(status, n) };
    n++;
  }));
  return { meta: sampleMeta(), answers };
}

function auditState() {
  const answers = {};
  let n = 0;
  for (const section of auditSections) for (const item of section.items) {
    const status = pick(AUDIT, n);
    const answer = { status, note: noteFor(status, n) };
    if (status === "minor" || status === "major") {
      answer.finding = "Induction records missing for two recent starters.";
      answer.action = "Complete the missing records and add a sign-off step to the induction checklist.";
      answer.owner = "Site manager";
      answer.due = daysFromNow(30);
    }
    answers[item.id] = answer;
    n++;
  }
  return { meta: sampleMeta(), answers };
}

function quickAuditData() {
  const ratings = {};
  const evidence = {};
  let n = 0;
  for (const group of quickAuditClauses) for (const item of group.items) {
    if (n % 6 !== 5) ratings[item.id] = pick(QUICK, n);
    if (n % 3 === 0) evidence[item.id] = pick(OK_NOTES, n);
    n++;
  }
  return { ratings, evidence };
}

const DEMO_SECTIONS = [
  { id: "s0", label: "1", title: "Site access and safety", items: [
    "Does the organization control access to the site?",
    "Are visitors signed in and escorted?",
    "Are hazards identified and recorded for each work area?"
  ] },
  { id: "s1", label: "2", title: "Dispatch and records", items: [
    "Are dispatch records complete and signed?",
    "Are returns checked before stock is put back?",
    "Are delivery records kept for the required period?"
  ] },
  { id: "s2", label: "3", title: "Staff training", items: [
    "Are all operators trained before they work unsupervised?",
    "Are training records kept up to date?"
  ] }
];
const DEMO_RATINGS = { "s0-1": "4", "s0-2": "5", "s0-3": "3", "s1-1": "4", "s1-2": "2", "s1-3": "4", "s2-1": "5", "s2-2": "4" };
const DEMO_EVIDENCE = { "s0-2": "Visitor log checked for the last month.", "s1-2": "Two returns were put back without a check.", "s2-2": "Training matrix reviewed with the site manager." };

function snapshot() {
  const keys = {};
  for (const key of KEYS) keys[key] = localStorage.getItem(key);
  return keys;
}

// Real work exists if any answer store is filled, or the visitor has more than one custom audit.
function hasData() {
  const answers = KEYS.filter(key => key !== LIST_KEY && !key.includes("-" + DEMO_ID + "-"));
  return answers.some(key => localStorage.getItem(key) !== null) || readList().filter(audit => audit.id !== DEMO_ID).length > 1;
}

function loadDemo() {
  const audits = readList().filter(audit => audit.id !== DEMO_ID);
  const data = { onboarding: onboardingState(), audit: auditState(), quick: quickAuditData() };
  if (!localStorage.getItem(BACKUP_KEY)) {
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), keys: snapshot() }));
  }
  localStorage.setItem("site-ready-assessment-v1", JSON.stringify(data.onboarding));
  localStorage.setItem("site-ready-internal-audit-v1", JSON.stringify(data.audit));
  localStorage.setItem("site-ready-quick-audit-v1", JSON.stringify(data.quick.ratings));
  localStorage.setItem("site-ready-quick-audit-evidence-v1", JSON.stringify(data.quick.evidence));
  localStorage.setItem("site-ready-quick-audit-location-v1", "Northgate Logistics · Site 12");
  localStorage.setItem("site-ready-custom-audit-" + DEMO_ID + "-ratings-v1", JSON.stringify(DEMO_RATINGS));
  localStorage.setItem("site-ready-custom-audit-" + DEMO_ID + "-evidence-v1", JSON.stringify(DEMO_EVIDENCE));
  audits.push({ id: DEMO_ID, name: "Demo audit", sections: DEMO_SECTIONS });
  localStorage.setItem(LIST_KEY, JSON.stringify({ audits, current: DEMO_ID }));
}

function clearDemo() {
  let backup;
  try { backup = JSON.parse(localStorage.getItem(BACKUP_KEY)); } catch { backup = null; }
  if (!backup?.keys) return;
  for (const key of KEYS) {
    const value = backup.keys[key];
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
  localStorage.removeItem(BACKUP_KEY);
}

function readList() {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || "{}").audits || []; } catch { return []; }
}

function mount() {
  const host = document.querySelector(".file-actions") || document.querySelector(".page-heading");
  if (!host) return;
  const demoButton = document.createElement("button");
  demoButton.className = "button";
  demoButton.type = "button";
  demoButton.id = "demo-load";
  demoButton.textContent = "Demo";
  const clearButton = document.createElement("button");
  clearButton.className = "button";
  clearButton.type = "button";
  clearButton.id = "demo-clear";
  clearButton.textContent = "Clear demo";
  clearButton.hidden = !localStorage.getItem(BACKUP_KEY);

  demoButton.addEventListener("click", () => {
    if (hasData() && !confirm("Replace the answers on Onboarding, Internal audit, Quick audit and Custom audit with sample data? Clear demo puts your current data back.")) return;
    loadDemo();
    location.reload();
  });
  clearButton.addEventListener("click", () => {
    if (!confirm("Clear the demo? This puts back the data saved before the demo and removes the Demo audit.")) return;
    clearDemo();
    location.reload();
  });
  host.append(demoButton, clearButton);
}

if (PAGES.includes(document.body.dataset.page)) mount();
