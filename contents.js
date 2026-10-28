const rows = document.querySelectorAll(".contents-table tbody tr");
for (const row of rows) {
  const clause = row.querySelector(".toc-clause")?.textContent.trim();
  if (!/^(?:[1-9]|10)(?:\.\d+)*$/.test(clause || "")) continue;
  const anchor = "clause-" + clause.replace(/\./g, "-");
  row.title = "Right-click to open this checklist";
  row.addEventListener("contextmenu", event => {
    event.preventDefault();
    window.location.href = "checklists.html#" + anchor;
  });
}
