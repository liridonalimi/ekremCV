document.documentElement.classList.replace("no-js", "js");

const hasAcademicData = Boolean(window.academicData);
const data = window.academicData || {
  appointments: [], education: [], publications: [], conferences: [], projects: [], academicContribution: {}, knowledgeExchange: [], researchAreas: [],
};

const topicNames = Object.fromEntries((data.researchAreas || []).map((topic) => [topic.id, topic.shortTitle || topic.title]));
topicNames.participation = "Participation";

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function safeHref(value) {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function makeLink(label, href, className) {
  const validHref = safeHref(href);
  if (!validHref) return null;
  const link = createElement("a", className, label);
  link.href = validHref;
  return link;
}

function appendTags(parent, topics = []) {
  if (!topics.length) return;
  const wrap = createElement("div", "topic-tags");
  topics.forEach((topic) => wrap.append(createElement("span", "topic-tag", topicNames[topic] || topic)));
  parent.append(wrap);
}

if (!hasAcademicData) {
  const warning = createElement("div", "data-error", "The detailed academic record could not be loaded. The core profile and external academic links remain available.");
  warning.setAttribute("role", "alert");
  document.querySelector("[data-header]")?.after(warning);
}

function renderFeaturedPublications() {
  const container = document.querySelector("[data-featured-publications]");
  if (!container) return;
  data.publications.filter((publication) => publication.featured).slice(0, 6).forEach((publication) => {
    const article = createElement("article", "featured-publication reveal");
    const meta = createElement("div", "featured-publication-meta");
    meta.append(
      createElement("span", "", publication.year || "Year not supplied"),
      createElement("span", "featured-publication-status", publication.status === "forthcoming" ? "Forthcoming" : "Published"),
    );
    article.append(meta, createElement("h3", "", publication.title), createElement("p", "featured-publication-authors", publication.authors.join(" · ")));
    appendTags(article, publication.topics);
    const footer = createElement("div", "featured-publication-footer");
    const citation = createElement("cite", "", [publication.venue, publication.details].filter(Boolean).join(" · "));
    footer.append(citation);
    const link = makeLink(publication.doi ? "Open DOI →" : "View source →", publication.href);
    if (link) footer.append(link);
    article.append(footer);
    container.append(article);
  });
}

function renderCareer() {
  const container = document.querySelector("[data-career-timeline]");
  if (!container) return;
  data.appointments.forEach((appointment) => {
    const article = createElement("article", `career-item reveal${appointment.current ? " is-current" : ""}`);
    article.append(createElement("div", "career-period", appointment.period));
    const content = createElement("div", "career-content");
    content.append(
      createElement("h3", "", appointment.role),
      createElement("p", "career-institution", appointment.institution),
      createElement("p", "career-location", appointment.location),
    );
    if (appointment.leadership) content.append(createElement("span", "career-badge", appointment.leadership));
    if (appointment.courses?.length) {
      const details = createElement("details", "career-courses");
      details.append(createElement("summary", "", `${appointment.courses.length} courses taught`));
      const list = createElement("ul");
      appointment.courses.forEach((course) => list.append(createElement("li", "", course)));
      details.append(list);
      content.append(details);
    }
    article.append(content);
    container.append(article);
  });
}

function renderEducation() {
  const container = document.querySelector("[data-education-list]");
  if (!container) return;
  data.education.forEach((record) => {
    const article = createElement("article", "education-item reveal");
    article.append(createElement("div", "education-year", record.year));
    const content = createElement("div", "education-content");
    content.append(
      createElement("h3", "", record.qualification),
      createElement("p", "", `${record.institution} · ${record.faculty}`),
    );
    const subjects = createElement("ul", "education-subjects");
    record.subjects.forEach((subject) => subjects.append(createElement("li", "", subject)));
    content.append(subjects);
    article.append(content);
    container.append(article);
  });
}

function renderProjects() {
  const container = document.querySelector("[data-project-grid]");
  if (!container) return;
  data.projects.forEach((project, index) => {
    const article = createElement("article", "project-card reveal");
    article.dataset.acronym = project.acronym || "PROJECT";
    article.append(createElement("span", "project-number", String(index + 1).padStart(2, "0")), createElement("h3", "", project.title));
    const details = createElement("div", "project-details");
    const facts = createElement("dl", "project-facts");
    const appendFact = (label, value, className = "") => {
      if (!value) return;
      const row = createElement("div", `project-fact${className ? ` ${className}` : ""}`);
      row.append(createElement("dt", "", label), createElement("dd", "", value));
      facts.append(row);
    };
    appendFact("Role", project.role, "project-fact-role");
    appendFact("Context", project.context);
    appendFact("Reference", project.reference);
    details.append(facts);
    const link = makeLink("Project website →", project.href, "project-link");
    if (link) {
      link.setAttribute("aria-label", `Visit the ${project.acronym || project.title} project website`);
      details.append(link);
    }
    article.append(details);
    container.append(article);
  });
}

function renderAcademicContribution() {
  const contribution = data.academicContribution || {};
  const highlights = document.querySelector("[data-contribution-highlights]");
  contribution.highlights?.forEach((item) => {
    const article = createElement("article", "contribution-stat reveal");
    if (item.kind) article.dataset.kind = item.kind;
    article.append(
      createElement("strong", "contribution-value", item.value),
      createElement("h3", "", item.title),
      createElement("p", "", item.detail),
    );
    highlights?.append(article);
  });

  const development = document.querySelector("[data-professional-development]");
  contribution.professionalDevelopment?.forEach((item) => {
    const record = createElement("li", "contribution-record");
    const meta = createElement("div", "contribution-record-meta");
    const time = createElement("time", "", item.date);
    if (item.dateTime) time.dateTime = item.dateTime;
    meta.append(time);
    if (item.credential) meta.append(createElement("span", "", item.credential));
    record.append(meta, createElement("h4", "", item.title), createElement("p", "", item.organizer));
    development?.append(record);
  });

  const curriculum = document.querySelector("[data-curriculum-contributions]");
  contribution.curriculumContributions?.forEach((item) => {
    const record = createElement("li", "contribution-record");
    record.append(
      createElement("div", "contribution-record-meta", item.year),
      createElement("h4", "", item.title),
      createElement("p", "", item.context),
    );
    curriculum?.append(record);
  });

  const engagement = document.querySelector("[data-professional-engagement]");
  contribution.professionalEngagement?.forEach((item) => {
    const record = createElement("li", "contribution-record");
    record.append(
      createElement("div", "contribution-record-meta", item.acronym),
      createElement("h4", "", item.name),
      createElement("p", "", item.role),
    );
    engagement?.append(record);
  });
}

function renderActivityYears() {
  const container = document.querySelector("[data-activity-years]");
  if (!container) return;
  container.setAttribute("role", "list");
  const records = data.conferences.filter((record) => !record.duplicateOf);
  for (let year = 2013; year <= 2026; year += 1) {
    const yearRecords = records.filter((record) => record.year === year);
    const item = createElement("div", "activity-year");
    item.setAttribute("role", "listitem");
    item.setAttribute("aria-label", `${year}: ${yearRecords.length} recorded ${yearRecords.length === 1 ? "activity" : "activities"}`);
    const dots = createElement("div", "activity-dots");
    dots.setAttribute("aria-hidden", "true");
    yearRecords.forEach((record) => {
      const kind = record.type === "participation" ? "participation" : record.topics?.includes("education") ? "education" : "research";
      dots.append(createElement("i", `activity-dot type-${kind}`));
    });
    item.append(dots, createElement("strong", "", year));
    container.append(item);
  }
}

function renderFeaturedConferences() {
  const container = document.querySelector("[data-featured-conferences]");
  if (!container) return;
  data.conferences.filter((record) => record.featured && !record.duplicateOf).slice(0, 6).forEach((record) => {
    const article = createElement("article", "talk-card reveal");
    const meta = createElement("div", "talk-meta");
    meta.append(createElement("span", "", record.year), createElement("span", "", record.type));
    article.append(meta, createElement("h3", "", record.title));
    const context = [record.event, record.location, record.date].filter(Boolean).join(" · ");
    if (context) article.append(createElement("p", "", context));
    const link = makeLink("Conference source →", record.href);
    if (link) article.append(link);
    container.append(article);
  });
}

function renderKnowledgeExchange() {
  const container = document.querySelector("[data-knowledge-list]");
  if (!container) return;
  data.knowledgeExchange.forEach((item, index) => {
    const article = createElement("article", "knowledge-item reveal");
    const copy = createElement("div");
    copy.append(createElement("h3", "", item.title), createElement("p", "", item.description));
    article.append(createElement("span", "", String(index + 1).padStart(2, "0")), copy);
    container.append(article);
  });
}

function searchableText(record) {
  return [record.year, record.title, record.event, record.location, record.date, record.venue, record.details, ...(record.authors || [])]
    .filter(Boolean).join(" ").toLocaleLowerCase();
}

function renderFilterButtons(container, topics, selected, onSelect) {
  if (!container) return;
  container.replaceChildren();
  [{ id: "all", label: "All" }, ...topics].forEach((topic) => {
    const button = createElement("button", "filter-button", topic.label);
    button.type = "button";
    button.dataset.filter = topic.id;
    button.setAttribute("aria-pressed", String(selected === topic.id));
    button.addEventListener("click", () => onSelect(topic.id));
    container.append(button);
  });
}

function updateFilterButtons(container, selected) {
  container?.querySelectorAll("[data-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === selected));
  });
}

const conferenceState = { filter: "all", query: "" };
const publicationState = { filter: "all", query: "" };

function filteredConferences() {
  return data.conferences.filter((record) => {
    if (record.duplicateOf) return false;
    const matchesFilter = conferenceState.filter === "all" || record.topics?.includes(conferenceState.filter);
    const matchesQuery = !conferenceState.query || searchableText(record).includes(conferenceState.query);
    return matchesFilter && matchesQuery;
  });
}

function renderConferenceList() {
  const container = document.querySelector("[data-conference-list]");
  const count = document.querySelector("[data-conference-count]");
  if (!container) return;
  const records = filteredConferences();
  container.replaceChildren();
  if (count) count.textContent = `${records.length} ${records.length === 1 ? "record" : "records"} shown`;
  if (!records.length) {
    container.append(createElement("p", "empty-state", "No conference records match this search. Choose another topic or clear the search field."));
    return;
  }
  const groups = new Map();
  records.forEach((record) => {
    const key = record.year || "Undated";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });
  [...groups.entries()].sort((a, b) => Number(b[0]) - Number(a[0])).forEach(([year, yearRecords]) => {
    const section = createElement("section", "conference-year-group");
    section.append(createElement("h3", "", year));
    const list = createElement("ul");
    yearRecords.forEach((record) => {
      const item = createElement("li", "conference-record");
      const body = createElement("div");
      body.append(createElement("h4", "", record.title));
      const details = [record.event, record.date, record.location].filter(Boolean).join(" · ");
      if (details) body.append(createElement("p", "", details));
      body.append(createElement("span", "record-type", record.type === "participation" ? "Participation" : "Presentation"));
      item.append(body);
      const link = makeLink("Source →", record.href);
      if (link) item.append(link);
      list.append(item);
    });
    section.append(list);
    container.append(section);
  });
}

function setupConferenceArchive() {
  const filters = document.querySelector("[data-conference-filters]");
  const input = document.querySelector("[data-conference-search]");
  const topics = [
    { id: "convergence", label: "Convergence" },
    { id: "approximation", label: "Approximation" },
    { id: "optimisation", label: "Computational" },
    { id: "geometry", label: "Geometry" },
    { id: "education", label: "Education" },
    { id: "participation", label: "Participation" },
  ];
  const select = (id) => {
    conferenceState.filter = id;
    updateFilterButtons(filters, id);
    renderConferenceList();
  };
  renderFilterButtons(filters, topics, "all", select);
  let searchTimer;
  input?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      conferenceState.query = input.value.trim().toLocaleLowerCase();
      renderConferenceList();
    }, 120);
  });
  renderConferenceList();
}

function makeAuthors(authors) {
  const paragraph = createElement("p", "publication-authors");
  authors.forEach((author, index) => {
    const authorNode = /^Ekrem (Alimi|Aljimi|Halimi)$/.test(author) ? createElement("strong", "", author) : document.createTextNode(author);
    paragraph.append(authorNode);
    if (index < authors.length - 1) paragraph.append(document.createTextNode(" · "));
  });
  return paragraph;
}

function citationText(publication) {
  const year = publication.year || "Year not supplied";
  const details = publication.details ? ` ${publication.details}.` : "";
  const doi = publication.doi ? ` https://doi.org/${publication.doi}` : publication.href ? ` ${publication.href}` : "";
  return `${publication.authors.join(", ")}. ${publication.title}. ${publication.venue}. ${year}.${details}${doi}`;
}

function filteredPublications() {
  return data.publications.filter((publication) => {
    const matchesFilter = publicationState.filter === "all" || publication.topics?.includes(publicationState.filter);
    const matchesQuery = !publicationState.query || searchableText(publication).includes(publicationState.query);
    return matchesFilter && matchesQuery;
  });
}

function renderPublicationList() {
  const container = document.querySelector("[data-publication-list]");
  const count = document.querySelector("[data-publication-count]");
  if (!container) return;
  const publications = filteredPublications();
  container.replaceChildren();
  if (count) count.textContent = `${publications.length} ${publications.length === 1 ? "publication" : "publications"} shown`;
  if (!publications.length) {
    const item = createElement("li", "empty-state", "No publications match this search. Choose another topic or clear the search field.");
    container.append(item);
    return;
  }
  publications.forEach((publication) => {
    const item = createElement("li", "publication-item");
    item.append(createElement("span", "publication-index"));
    const body = createElement("div", "publication-body");
    body.append(createElement("h3", "", publication.title), makeAuthors(publication.authors));
    body.append(createElement("p", "publication-venue", [publication.venue, publication.details].filter(Boolean).join(" · ")));
    const meta = createElement("div", "publication-meta");
    meta.append(createElement("span", "publication-year", publication.year || "—"));
    if (publication.status === "forthcoming") meta.append(createElement("span", "publication-status", "Forthcoming"));
    appendTags(meta, publication.topics);
    const source = makeLink(publication.doi ? "Open DOI →" : "View source →", publication.href);
    if (source) meta.append(source);
    const copy = createElement("button", "copy-citation", "Copy citation");
    copy.type = "button";
    copy.dataset.citation = citationText(publication);
    meta.append(copy);
    item.append(body, meta);
    container.append(item);
  });
}

function setupPublicationArchive() {
  const filters = document.querySelector("[data-publication-filters]");
  const input = document.querySelector("[data-publication-search]");
  const topics = (data.researchAreas || []).map((topic) => ({ id: topic.id, label: topic.shortTitle || topic.title }));
  const select = (id) => {
    publicationState.filter = id;
    updateFilterButtons(filters, id);
    renderPublicationList();
  };
  renderFilterButtons(filters, topics, "all", select);
  let searchTimer;
  input?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      publicationState.query = input.value.trim().toLocaleLowerCase();
      renderPublicationList();
    }, 120);
  });
  renderPublicationList();
}

function showStatus(message) {
  const status = document.querySelector("[data-copy-status]");
  if (!status) return;
  status.textContent = message;
  status.classList.add("is-visible");
  window.setTimeout(() => status.classList.remove("is-visible"), 2200);
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-citation]");
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.citation);
    showStatus("Citation copied");
  } catch {
    showStatus("Copy unavailable in this browser");
  }
});

renderFeaturedPublications();
renderCareer();
renderEducation();
renderProjects();
renderAcademicContribution();
renderActivityYears();
renderFeaturedConferences();
renderKnowledgeExchange();
setupConferenceArchive();
setupPublicationArchive();

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const main = document.querySelector("main");
const footer = document.querySelector("footer");
const wordmark = document.querySelector(".wordmark");
let returnFocus = null;

function updateScrollState() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setBackgroundInert(isInert) {
  if (main) main.inert = isInert;
  if (footer) footer.inert = isInert;
  if (!wordmark) return;
  if (isInert) {
    wordmark.setAttribute("aria-hidden", "true");
    wordmark.setAttribute("tabindex", "-1");
  } else {
    wordmark.removeAttribute("aria-hidden");
    wordmark.removeAttribute("tabindex");
  }
}

function openMenu() {
  if (!menuButton || !navigation) return;
  returnFocus = document.activeElement;
  menuButton.setAttribute("aria-expanded", "true");
  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");
  setBackgroundInert(true);
  navigation.querySelector("a")?.focus();
}

function closeMenu(restoreFocus = false) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  setBackgroundInert(false);
  if (restoreFocus && returnFocus instanceof HTMLElement) returnFocus.focus();
}

menuButton?.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  if (opening) openMenu();
  else closeMenu(true);
});

navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (!menuButton || !navigation) return;
  const menuOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (event.key === "Escape" && menuOpen) {
    event.preventDefault();
    closeMenu(true);
  }
  if (event.key !== "Tab" || !menuOpen) return;
  const focusable = [menuButton, ...navigation.querySelectorAll("a")];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -7%", threshold: 0.06 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = [...(navigation?.querySelectorAll('a[href^="#"]') || [])];
const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => {
      const current = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("is-active", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-25% 0px -60%", threshold: [0, .15, .5] });
  sections.forEach((section) => sectionObserver.observe(section));
}

const printState = { archiveOpen: false, conferenceFilter: "all", conferenceQuery: "", publicationFilter: "all", publicationQuery: "" };
window.addEventListener("beforeprint", () => {
  const archive = document.querySelector("[data-conference-archive]");
  const conferenceInput = document.querySelector("[data-conference-search]");
  const publicationInput = document.querySelector("[data-publication-search]");
  printState.archiveOpen = archive?.open || false;
  printState.conferenceFilter = conferenceState.filter;
  printState.conferenceQuery = conferenceState.query;
  printState.publicationFilter = publicationState.filter;
  printState.publicationQuery = publicationState.query;
  if (archive) archive.open = true;
  conferenceState.filter = "all";
  conferenceState.query = "";
  publicationState.filter = "all";
  publicationState.query = "";
  if (conferenceInput) conferenceInput.value = "";
  if (publicationInput) publicationInput.value = "";
  renderConferenceList();
  renderPublicationList();
});

window.addEventListener("afterprint", () => {
  const archive = document.querySelector("[data-conference-archive]");
  const conferenceInput = document.querySelector("[data-conference-search]");
  const publicationInput = document.querySelector("[data-publication-search]");
  if (archive) archive.open = printState.archiveOpen;
  conferenceState.filter = printState.conferenceFilter;
  conferenceState.query = printState.conferenceQuery;
  publicationState.filter = printState.publicationFilter;
  publicationState.query = printState.publicationQuery;
  if (conferenceInput) conferenceInput.value = conferenceState.query;
  if (publicationInput) publicationInput.value = publicationState.query;
  renderConferenceList();
  renderPublicationList();
});

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", () => { if (window.innerWidth > 800) closeMenu(); updateScrollState(); });
updateScrollState();
