import { shopReviewChecklists } from "./shop-reviews-data.js";
import { mountChecklistPage } from "./checklist-page.js";

mountChecklistPage({
  type: "shop-reviews",
  title: "Shop",
  groups: shopReviewChecklists.map((checklist, index) => {
    const id = String(checklist.id ?? index + 1);
    return { id, label: "", title: checklist.title, anchor: "checklist-" + id, items: checklist.items || [] };
  }),
  ratingKey: "site-ready-shop-reviews-v1",
  evidenceKey: "site-ready-shop-review-evidence-v1",
  root: document.getElementById("checklists")
});
