"use strict";

// Wire tabs
document.querySelectorAll("nav.tabs button").forEach(btn => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

// Initial render
render();

// Reload data when window regains focus (in case it was edited elsewhere — unlikely but defensive)
window.addEventListener("pageshow", () => {
  _cachedData = null;
  render();
});

// Keyboard nav on desktop
document.addEventListener("keydown", e => {
  if (state.view !== "today") return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "ArrowLeft") setDate(addDays(state.currentDate, -1));
  if (e.key === "ArrowRight") setDate(addDays(state.currentDate, 1));
});

// Service worker — guarantees offline once first load completes.
// Skipped on file:// (won't register) and on http (registration silently fails).
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(err => {
      console.warn("SW registration failed:", err);
    });
  });
}

