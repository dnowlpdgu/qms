const input = document.getElementById("requirements-search");
const status = document.getElementById("requirements-search-status");
const doc = document.querySelector(".intro-document");
const sections = Array.from(doc.querySelectorAll(".intro-section, .intro-subsection, .definition-entry"));
const textBlocks = Array.from(doc.querySelectorAll("p, li, figcaption, .definition-number, .definition-entry > h3"));
const headings = Array.from(doc.querySelectorAll(".intro-section-title h2, .intro-subsection > h3"));

function updateSearch() {
  const query = input.value.trim().toLocaleLowerCase();
  if (!query) {
    for (const element of [...textBlocks, ...headings, ...sections, ...doc.querySelectorAll("figure")]) element.hidden = false;
    status.textContent = "";
    return;
  }

  const matched = new Set();
  for (const block of textBlocks) {
    const isMatch = block.textContent.toLocaleLowerCase().includes(query);
    block.hidden = !isMatch;
    if (isMatch) matched.add(block);
  }

  for (const figure of doc.querySelectorAll("figure")) {
    const isMatch = figure.textContent.toLocaleLowerCase().includes(query);
    figure.hidden = !isMatch;
    if (isMatch) matched.add(figure);
  }

  for (const section of sections) {
    const containsMatch = Array.from(matched).some(element => section.contains(element));
    section.hidden = !containsMatch;
  }

  for (const heading of headings) {
    const parent = heading.closest(".intro-section, .intro-subsection");
    heading.hidden = !(heading.textContent.toLocaleLowerCase().includes(query) || (parent && !parent.hidden));
  }

  const matchingUnits = sections.filter(section => !section.hidden && !sections.some(other => other !== section && section.contains(other) && !other.hidden));
  status.textContent = matchingUnits.length ? matchingUnits.length + (matchingUnits.length === 1 ? " matching section" : " matching sections") : "No matches";
}

input.addEventListener("input", updateSearch);
input.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    input.value = "";
    updateSearch();
  }
});
