document.documentElement.classList.replace("no-js", "js");

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const copyButton = document.querySelector("[data-copy-orcid]");
const copyStatus = document.querySelector("[data-copy-status]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const main = document.querySelector("main");
const footer = document.querySelector("footer");
const wordmark = document.querySelector(".wordmark");
let returnFocus = null;

function updateScrollState() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setBackgroundInert(isInert) {
  main.inert = isInert;
  footer.inert = isInert;
  if (isInert) {
    wordmark.setAttribute("aria-hidden", "true");
    wordmark.setAttribute("tabindex", "-1");
  } else {
    wordmark.removeAttribute("aria-hidden");
    wordmark.removeAttribute("tabindex");
  }
}

function openMenu() {
  returnFocus = document.activeElement;
  menuButton.setAttribute("aria-expanded", "true");
  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");
  setBackgroundInert(true);
  navigation.querySelector("a").focus();
}

function closeMenu(restoreFocus = false) {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  setBackgroundInert(false);
  if (restoreFocus && returnFocus instanceof HTMLElement) returnFocus.focus();
}

menuButton.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  if (opening) openMenu();
  else closeMenu(true);
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
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

copyButton.addEventListener("click", async () => {
  const identifier = "0000-0003-1530-5459";
  const label = copyButton.querySelector("[data-copy-label]");
  try {
    await navigator.clipboard.writeText(identifier);
    label.textContent = "Copied";
    copyStatus.textContent = "ORCID identifier copied";
  } catch {
    copyStatus.textContent = `ORCID: ${identifier}`;
  }
  copyStatus.classList.add("is-visible");
  window.setTimeout(() => {
    copyStatus.classList.remove("is-visible");
    label.textContent = "Copy";
  }, 2200);
});

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
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
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
  }, { rootMargin: "-25% 0px -60%", threshold: [0, 0.15, 0.5] });
  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", () => { if (window.innerWidth > 780) closeMenu(); updateScrollState(); });
updateScrollState();
