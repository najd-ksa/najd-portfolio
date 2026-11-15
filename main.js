/* Najd portfolio: mobile menu, scroll reveal, Arabic/English switch */
const $ = id => document.getElementById(id);
const mb = $("mb"), nav = $("links");

/* mobile menu */
mb.onclick = () => { const o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); };
nav.addEventListener("click", e => {
  if (e.target.tagName === "A") { nav.classList.remove("open"); mb.setAttribute("aria-expanded", false); }
});

/* scroll reveal */
const els = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  els.forEach(el => io.observe(el));
} else els.forEach(el => el.classList.add("in"));

/* language switch: Arabic is the original text, English comes from translations.js */
const saved = new Map(), AR_TITLE = document.title;
const skipNode = n => n.parentElement.closest("script,style,svg,.logo,.pj .pills");

function setLang(l) {
  const en = l === "en", root = document.documentElement;
  root.lang = l; root.dir = en ? "ltr" : "rtl";
  $("lang").textContent = en ? "عربي" : "EN";
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), nodes = [];
  while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => {
    if (skipNode(n)) return;
    if (en) {
      if (saved.has(n)) return;
      const t = n.nodeValue.trim();
      if (EN[t] !== undefined) { saved.set(n, n.nodeValue); n.nodeValue = n.nodeValue.replace(t, () => EN[t]); }
    } else if (saved.has(n)) { n.nodeValue = saved.get(n); saved.delete(n); }
  });
  document.querySelectorAll("[alt],[aria-label]").forEach(el => ["alt", "aria-label"].forEach(a => {
    const v = el.getAttribute(a), k = "ar" + a.replace("-", "");
    if (v === null) return;
    if (en) { if (!el.dataset[k] && EN[v]) { el.dataset[k] = v; el.setAttribute(a, EN[v]); } }
    else if (el.dataset[k]) { el.setAttribute(a, el.dataset[k]); delete el.dataset[k]; }
  }));
  document.title = en ? EN[AR_TITLE] : AR_TITLE;
  try { localStorage.setItem("lang", l); } catch (e) {}
}
let cur = "ar";
try { cur = localStorage.getItem("lang") || "ar"; } catch (e) {}
if (cur === "en") setLang("en");
$("lang").onclick = () => { cur = cur === "ar" ? "en" : "ar"; setLang(cur); };
