import { materialInspectionChecklists } from "./material-inspections-data.js";
import { mountChecklistPage } from "./checklist-page.js";

mountChecklistPage({
  type: "material-inspections",
  title: "Inspections",
  groups: materialInspectionChecklists.map((checklist, index) => {
    const id = String(checklist.id ?? index + 1);
    return { id, label: "", title: checklist.title, anchor: "checklist-" + id, items: checklist.items || [] };
  }),
  ratingKey: "site-ready-material-inspections-v1",
  evidenceKey: "site-ready-material-inspection-evidence-v1",
  root: document.getElementById("checklists")
});
