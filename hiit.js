"use strict";

// ==================================================================
// HIIT BUILDER
// CrossFit benchmark library, format engine, adaptive timer.
//
// Runs parallel to the Gym builder (hiitState / renderHiit) but shares
// the #builder-root overlay and all .bld-* styling.
//
// Timer rule: every piece of state is DERIVED from the startedAt epoch
// on each tick. Nothing is accumulated by counting intervals, because
// iOS throttles timers on a locked screen. That is what makes resume
// land on the genuinely correct second.
// ==================================================================

// ------------------------------------------------------------------
// MOVEMENT LIBRARY   <<< ADD YOUR OWN MOVEMENTS IN THIS BLOCK >>>
// unit: reps | distance | calories | time
// ------------------------------------------------------------------
const HIIT_MOVEMENTS_SEED = {
  "thruster":          { name: "Thruster",              unit: "reps", loadable: true },
  "pull-up":           { name: "Pull-up",               unit: "reps" },
  "chest-to-bar":      { name: "Chest-to-Bar Pull-up",  unit: "reps" },
  "clean-and-jerk":    { name: "Clean and Jerk",        unit: "reps", loadable: true },
  "snatch":            { name: "Snatch",                unit: "reps", loadable: true },
  "squat-clean":       { name: "Squat Clean",           unit: "reps", loadable: true },
  "hang-power-clean":  { name: "Hang Power Clean",      unit: "reps", loadable: true },
  "push-jerk":         { name: "Push Jerk",             unit: "reps", loadable: true },
  "deadlift":          { name: "Deadlift",              unit: "reps", loadable: true },
  "ohs":               { name: "Overhead Squat",        unit: "reps", loadable: true },
  "front-squat":       { name: "Front Squat",           unit: "reps", loadable: true },
  "run":               { name: "Run",                   unit: "distance" },
  "row":               { name: "Row",                   unit: "distance" },
  "row-cal":           { name: "Row (calories)",        unit: "calories" },
  "bike-cal":          { name: "Assault Bike (calories)", unit: "calories" },
  "ski-cal":           { name: "Ski Erg (calories)",    unit: "calories" },
  "kb-swing":          { name: "Kettlebell Swing",      unit: "reps", loadable: true },
  "push-up":           { name: "Push-up",               unit: "reps" },
  "air-squat":         { name: "Air Squat",             unit: "reps" },
  "double-under":      { name: "Double-under",          unit: "reps" },
  "single-under":      { name: "Single-under",          unit: "reps" },
  "sit-up":            { name: "Sit-up",                unit: "reps" },
  "wall-ball":         { name: "Wall Ball",             unit: "reps", loadable: true },
  "hspu":              { name: "Handstand Push-up",     unit: "reps" },
  "pike-pushup":       { name: "Pike Push-up",          unit: "reps" },
  "ring-dip":          { name: "Ring Dip",              unit: "reps" },
  "box-dip":           { name: "Box Dip",               unit: "reps" },
  "ring-row":          { name: "Ring Row",              unit: "reps" },
  "box-jump":          { name: "Box Jump",              unit: "reps", heightBased: true },
  "box-step-up":       { name: "Box Step-up",           unit: "reps", heightBased: true },
  "burpee":            { name: "Burpee",                unit: "reps" },
  "toes-to-bar":       { name: "Toes-to-Bar",           unit: "reps" },
  "knee-raise":        { name: "Hanging Knee Raise",    unit: "reps" },
  "lunge":             { name: "Walking Lunge",         unit: "reps", loadable: true },
  "db-snatch":         { name: "Dumbbell Snatch",       unit: "reps", loadable: true },
  "plank-hold":        { name: "Plank Hold",            unit: "time" },
  "rest":              { name: "Rest",                  unit: "time" }
};

function getHiitMovements() {
  const data = loadData();
  if (!data.hiitMovements) data.hiitMovements = {};
  return Object.assign({}, HIIT_MOVEMENTS_SEED, data.hiitMovements);
}
function getMovement(key) {
  return getHiitMovements()[key] || { name: key, unit: "reps" };
}
function movementName(key) { return getMovement(key).name; }

function addCustomMovement(name) {
  const data = loadData();
  const clean = (name || "").trim();
  if (!clean) return null;
  const key = "cm-" + clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!data.hiitMovements) data.hiitMovements = {};
  if (!getHiitMovements()[key]) {
    data.hiitMovements[key] = { name: clean, unit: "reps", custom: true };
    saveData();
  }
  return key;
}

// ------------------------------------------------------------------
// FORMATS
// ------------------------------------------------------------------
const HIIT_FORMATS = {
  "for-time": { label: "For time",        blurb: "Finish the work as fast as you can", countsUp: true },
  "amrap":    { label: "AMRAP",           blurb: "As many rounds as possible in a set time", countsUp: false },
  "emom":     { label: "EMOM",            blurb: "Every minute on the minute", countsUp: false },
  "rounds":   { label: "Rounds for time", blurb: "Fixed rounds, fastest time", countsUp: true },
  "tabata":   { label: "Tabata / intervals", blurb: "Work and rest phases on repeat", countsUp: false },
  "chipper":  { label: "Chipper",         blurb: "One pass through a long list", countsUp: true }
};

// ------------------------------------------------------------------
// CROSSFIT BENCHMARK LIBRARY  <<< ADD YOUR OWN WORKOUTS IN THIS BLOCK >>>
// Loads are [men, women] in kg; heights [men, women] in cm.
// repScheme, when present, drives reps for every movement in order.
// ------------------------------------------------------------------
const CROSSFIT_WORKOUTS = [
  { key: "fran", name: "Fran", category: "girl", format: "for-time", capMin: 10,
    repScheme: [21, 15, 9], stimulus: "Sprint. It should hurt and be over fast.",
    movements: [ { key: "thruster", loadKg: [43, 29] }, { key: "pull-up" } ] },

  { key: "grace", name: "Grace", category: "girl", format: "for-time", capMin: 12,
    stimulus: "Short and heavy. Singles with a rhythm beat touch-and-go.",
    movements: [ { key: "clean-and-jerk", reps: 30, loadKg: [61, 43] } ] },

  { key: "isabel", name: "Isabel", category: "girl", format: "for-time", capMin: 12,
    stimulus: "Short and heavy. Technique holds up or the clock does not.",
    movements: [ { key: "snatch", reps: 30, loadKg: [61, 43] } ] },

  { key: "helen", name: "Helen", category: "girl", format: "rounds", rounds: 3, capMin: 20,
    stimulus: "Sprint. Run controlled, swing unbroken.",
    movements: [ { key: "run", distanceM: 400 },
                 { key: "kb-swing", reps: 21, loadKg: [24, 16] },
                 { key: "pull-up", reps: 12 } ] },

  { key: "cindy", name: "Cindy", category: "girl", format: "amrap", durationMin: 20,
    stimulus: "Long grind. Steady pace beats early heroics.",
    movements: [ { key: "pull-up", reps: 5 }, { key: "push-up", reps: 10 },
                 { key: "air-squat", reps: 15 } ] },

  { key: "annie", name: "Annie", category: "girl", format: "for-time", capMin: 15,
    repScheme: [50, 40, 30, 20, 10], stimulus: "Sprint. Rope efficiency is the whole workout.",
    movements: [ { key: "double-under" }, { key: "sit-up" } ] },

  { key: "karen", name: "Karen", category: "girl", format: "for-time", capMin: 20,
    stimulus: "Long grind. Pick a set size you can hold and never break it.",
    movements: [ { key: "wall-ball", reps: 150, loadKg: [9, 6] } ] },

  { key: "diane", name: "Diane", category: "girl", format: "for-time", capMin: 15,
    repScheme: [21, 15, 9], stimulus: "Short and heavy. Deadlifts fast, HSPU is the bottleneck.",
    movements: [ { key: "deadlift", loadKg: [102, 70] }, { key: "hspu" } ] },

  { key: "elizabeth", name: "Elizabeth", category: "girl", format: "for-time", capMin: 15,
    repScheme: [21, 15, 9], stimulus: "Short and heavy. Cleans drain the grip before the dips.",
    movements: [ { key: "squat-clean", loadKg: [61, 43] }, { key: "ring-dip" } ] },

  { key: "jackie", name: "Jackie", category: "girl", format: "chipper", capMin: 15,
    stimulus: "Sprint. Row easier than feels right, thrusters unbroken.",
    movements: [ { key: "row", distanceM: 1000 },
                 { key: "thruster", reps: 50, loadKg: [20, 15] },
                 { key: "pull-up", reps: 30 } ] },

  { key: "kelly", name: "Kelly", category: "girl", format: "rounds", rounds: 5, capMin: 40,
    stimulus: "Long grind. Forty minutes of honest work.",
    movements: [ { key: "run", distanceM: 400 },
                 { key: "box-jump", reps: 30, heightCm: [60, 50] },
                 { key: "wall-ball", reps: 30, loadKg: [9, 6] } ] },

  { key: "nancy", name: "Nancy", category: "girl", format: "rounds", rounds: 5, capMin: 25,
    stimulus: "Sprint. Overhead squats on tired legs test position.",
    movements: [ { key: "run", distanceM: 400 },
                 { key: "ohs", reps: 15, loadKg: [43, 29] } ] },

  { key: "chelsea", name: "Chelsea", category: "girl", format: "emom", durationMin: 30,
    stimulus: "Long grind. Falling behind early is unrecoverable.",
    movements: [ { key: "pull-up", reps: 5 }, { key: "push-up", reps: 10 },
                 { key: "air-squat", reps: 15 } ] },

  { key: "murph", name: "Murph", category: "hero", format: "chipper", capMin: 60,
    vestKg: [9, 6], stimulus: "Long grind. Partition the middle 20 rounds of Cindy.",
    movements: [ { key: "run", distanceM: 1600 },
                 { key: "pull-up", reps: 100 }, { key: "push-up", reps: 200 },
                 { key: "air-squat", reps: 300 }, { key: "run", distanceM: 1600 } ] },

  { key: "dt", name: "DT", category: "hero", format: "rounds", rounds: 5, capMin: 20,
    stimulus: "Short and heavy. Grip decides this one.",
    movements: [ { key: "deadlift", reps: 12, loadKg: [70, 47.5] },
                 { key: "hang-power-clean", reps: 9, loadKg: [70, 47.5] },
                 { key: "push-jerk", reps: 6, loadKg: [70, 47.5] } ] }
];

// ------------------------------------------------------------------
// SCALING
// ------------------------------------------------------------------
const SCALE_SUBS = {
  "pull-up":      { key: "ring-row",     note: "or banded pull-up" },
  "chest-to-bar": { key: "ring-row" },
  "hspu":         { key: "pike-pushup" },
  "ring-dip":     { key: "box-dip" },
  "double-under": { key: "single-under", repMult: 3 },
  "box-jump":     { key: "box-step-up" },
  "toes-to-bar":  { key: "knee-raise" }
};
const SCALE_LOAD_PCT = 0.65;
const SCALE_RUN_PCT  = 0.6;

function hiitSex() {
  const m = loadData().meta;
  return m.hiitLoadSex || m.sex || "male";
}
function sexIdx() { return hiitSex() === "female" ? 1 : 0; }

function pickLoad(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr[sexIdx()];
}

// Resolve a library workout into concrete movements for the chosen sex + scaling.
function resolveWorkout(w, scaling) {
  const idx = sexIdx();
  const movements = w.movements.map(m => {
    const out = { key: m.key, reps: m.reps, distanceM: m.distanceM,
                  calories: m.calories, timeSec: m.timeSec };
    if (m.loadKg)   out.loadKg   = pickLoad(m.loadKg);
    if (m.heightCm) out.heightCm = pickLoad(m.heightCm);

    if (scaling === "scaled") {
      const sub = SCALE_SUBS[m.key];
      if (sub) {
        out.key = sub.key;
        out.subNote = sub.note || null;
        if (sub.repMult && out.reps) out.reps = out.reps * sub.repMult;
        if (sub.repMult) out.repMult = sub.repMult;
      }
      if (out.loadKg)    out.loadKg    = Math.round(out.loadKg * SCALE_LOAD_PCT * 2) / 2;
      if (out.distanceM) out.distanceM = Math.round(out.distanceM * SCALE_RUN_PCT / 10) * 10;
      if (out.heightCm)  out.heightCm  = Math.max(20, out.heightCm - 20);
    }
    return out;
  });

  let repScheme = w.repScheme ? w.repScheme.slice() : null;
  // A scaled double-under scheme has to scale too
  if (scaling === "scaled" && repScheme) {
    const mult = movements.find(m => m.repMult);
    if (mult) repScheme = repScheme.map(r => r * mult.repMult);
  }

  return {
    key: w.key, name: w.name, category: w.category, format: w.format,
    durationMin: w.durationMin, rounds: w.rounds, capMin: w.capMin,
    workSec: w.workSec, restSec: w.restSec,
    repScheme, stimulus: w.stimulus,
    vestKg: w.vestKg ? (scaling === "scaled" ? null : pickLoad(w.vestKg)) : null,
    movements, scaling
  };
}

function describeMovement(m) {
  const mv = getMovement(m.key);
  const bits = [];
  if (m.distanceM != null) bits.push(m.distanceM + " m");
  else if (m.calories != null) bits.push(m.calories + " cal");
  else if (m.timeSec != null) bits.push(m.timeSec + " s");
  else if (m.reps != null) bits.push(m.reps);
  bits.push(mv.name);
  let s = bits.join(" ");
  if (m.loadKg)   s += " " + m.loadKg + " kg";
  if (m.heightCm) s += " " + m.heightCm + " cm";
  return s;
}

function workoutSummary(w) {
  if (w.repScheme) {
    return w.repScheme.join("-") + ": " +
      w.movements.map(m => {
        const mv = getMovement(m.key);
        return mv.name + (m.loadKg ? " " + m.loadKg + "kg" : "");
      }).join(", ");
  }
  return w.movements.map(describeMovement).join(" · ");
}

function formatLabel(w) {
  const f = HIIT_FORMATS[w.format];
  if (w.format === "amrap") return "AMRAP " + w.durationMin + " min";
  if (w.format === "emom")  return "EMOM " + w.durationMin + " min";
  if (w.format === "rounds") return w.rounds + " rounds for time";
  if (w.format === "tabata") return "Intervals " + w.workSec + "s / " + w.restSec + "s × " + w.rounds;
  return f ? f.label : w.format;
}

// ------------------------------------------------------------------
// USER WORKOUTS
// ------------------------------------------------------------------
function getUserHiitWorkouts() {
  const data = loadData();
  return data.hiitWorkouts || [];
}
function saveUserHiitWorkout(w) {
  const data = loadData();
  if (!data.hiitWorkouts) data.hiitWorkouts = [];
  const rec = Object.assign({}, w, { key: "uw-" + uid(), mine: true, createdAt: Date.now() });
  data.hiitWorkouts.push(rec);
  saveData();
  return rec;
}
function deleteUserHiitWorkout(key) {
  const data = loadData();
  data.hiitWorkouts = (data.hiitWorkouts || []).filter(w => w.key !== key);
  saveData();
}
function allHiitWorkouts() {
  return getUserHiitWorkouts().concat(CROSSFIT_WORKOUTS);
}
function findWorkout(key) {
  return allHiitWorkouts().find(w => w.key === key) || null;
}

// ------------------------------------------------------------------
// HISTORY + PERSONAL BESTS
// PBs are keyed on (workout, scaling) so a Scaled run can never
// overwrite an Rx best.
// ------------------------------------------------------------------
function hiitHistory(workoutKey) {
  const data = loadData();
  const out = [];
  for (const iso of Object.keys(data.days).sort().reverse()) {
    for (const es of (data.days[iso].extraSessions || [])) {
      if (es.hiit && es.workoutKey === workoutKey) out.push(Object.assign({ iso }, es));
    }
  }
  return out;  // newest first
}

function resultScore(format, result) {
  if (!result) return null;
  if (format === "amrap") return (result.roundsDone || 0) * 1000 + (result.partialReps || 0);
  if (result.capped) return null;           // a capped effort is not a result to beat
  return result.timeSec != null ? result.timeSec : null;
}

function isBetter(format, a, b) {
  if (a == null) return false;
  if (b == null) return true;
  return format === "amrap" ? a > b : a < b;   // more work, or less time
}

function hiitBest(workoutKey, scaling, excludeId) {
  const w = findWorkout(workoutKey);
  if (!w) return null;
  let best = null;
  for (const h of hiitHistory(workoutKey)) {
    if (h.id === excludeId) continue;
    if (scaling && h.scaling !== scaling) continue;
    const sc = resultScore(w.format, h.result);
    if (sc == null) continue;
    if (!best || isBetter(w.format, sc, best.score)) best = { score: sc, entry: h };
  }
  return best;
}

function formatResult(format, result) {
  if (!result) return "—";
  if (format === "amrap") {
    return (result.roundsDone || 0) + " rounds" +
           (result.partialReps ? " + " + result.partialReps + " reps" : "");
  }
  if (format === "emom" || format === "tabata") {
    return result.completedAll ? "Completed" :
           "Partial" + (result.missedMinutes ? " (" + result.missedMinutes + " missed)" : "");
  }
  if (result.capped) return "Capped" + (result.partialReps ? " · " + result.partialReps + " reps" : "");
  return result.timeSec != null ? fmtClock(result.timeSec) : "—";
}

function weeksSince(iso) {
  return Math.floor(daysBetween(iso, todayISO()) / 7);
}

// ------------------------------------------------------------------
// WAKE LOCK  (iOS 16.4+ over HTTPS; degrades silently otherwise)
// ------------------------------------------------------------------
let _wakeLock = null;
async function acquireWake() {
  try {
    if ("wakeLock" in navigator) _wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) { _wakeLock = null; }
}
function releaseWake() {
  try { if (_wakeLock) { _wakeLock.release(); _wakeLock = null; } } catch (e) {}
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && hiitState.open && hiitState.step === "timer") {
    acquireWake();
  }
});

// ------------------------------------------------------------------
// TIMER ENGINE  — all state derived from epochs
// ------------------------------------------------------------------
const PREP_SEC = 3;
let _hiitTick = null;
let _lastPhaseKey = null;

function timerElapsed(t) {
  if (!t || !t.startedAt) return 0;
  const end = t.pausedAt || Date.now();
  return (end - t.startedAt - (t.pausedTotal || 0)) / 1000;
}

// Returns everything the display needs, computed fresh from the clock.
function timerView(t, w) {
  const raw = timerElapsed(t);
  const prep = raw < 0;
  const el = Math.max(0, raw);
  const v = { prep, prepLeft: Math.ceil(-raw), elapsed: el, phase: null, phaseLeft: null };

  if (w.format === "amrap") {
    const total = (w.durationMin || 0) * 60;
    v.remaining = Math.max(0, total - el);
    v.done = el >= total;
  } else if (w.format === "emom") {
    const total = (w.durationMin || 0) * 60;
    v.minute = Math.floor(el / 60) + 1;
    v.phaseLeft = 60 - (el % 60);
    v.remaining = Math.max(0, total - el);
    v.done = el >= total;
  } else if (w.format === "tabata") {
    const work = w.workSec || 20, rest = w.restSec || 10;
    const cycle = work + rest;
    const idx = Math.floor(el / cycle);
    const into = el % cycle;
    v.round = Math.min((w.rounds || 8), idx + 1);
    v.phase = into < work ? "work" : "rest";
    v.phaseLeft = into < work ? work - into : cycle - into;
    v.done = idx >= (w.rounds || 8);
  } else {
    const cap = (w.capMin || 0) * 60;
    v.capSec = cap;
    v.overCap = cap > 0 && el >= cap;
  }
  return v;
}

function phaseKeyFor(v, w) {
  if (v.prep) return "prep-" + v.prepLeft;
  if (w.format === "emom")   return "min-" + v.minute;
  if (w.format === "tabata") return "tab-" + v.round + "-" + v.phase;
  // Formats without recurring phases still need one transition out of prep,
  // otherwise there is no audible GO - the most important cue of the lot.
  return "go";
}

function startHiitTimer() {
  stopHiitTimer();
  _hiitTick = setInterval(renderTimerFace, 200);
  renderTimerFace();
}
function stopHiitTimer() { if (_hiitTick) clearInterval(_hiitTick); _hiitTick = null; }

function renderTimerFace() {
  const t = hiitState.timer, w = hiitState.workout;
  if (!t || !w) return;
  const v = timerView(t, w);
  const big = document.getElementById("hiit-clock");
  const sub = document.getElementById("hiit-sub");
  const face = document.getElementById("hiit-face");
  if (!big) return;

  // audio cues on phase boundaries only
  const pk = phaseKeyFor(v, w);
  if (pk && pk !== _lastPhaseKey) {
    _lastPhaseKey = pk;
    if (v.prep) beepLow();
    else beepHigh();
  }

  if (v.prep) {
    big.textContent = v.prepLeft > 0 ? String(v.prepLeft) : "GO";
    if (sub) sub.textContent = "Get ready";
    if (face) face.className = "hiit-face prep";
    return;
  }

  if (w.format === "amrap") {
    big.textContent = fmtClock(v.remaining);
    if (sub) sub.textContent = "remaining · " + (t.roundsDone || 0) + " rounds done";
    if (face) face.className = "hiit-face " + (v.done ? "done" : "run");
    if (v.done && !t.autoFinished) { t.autoFinished = true; beepHigh(); finishHiit(true); }
  } else if (w.format === "emom") {
    big.textContent = fmtClock(v.phaseLeft);
    if (sub) sub.textContent = "Minute " + v.minute + " of " + w.durationMin +
                               " · " + fmtClock(v.remaining) + " left";
    if (face) face.className = "hiit-face " + (v.done ? "done" : "run");
    const mv = document.getElementById("emom-move");
    if (mv) mv.innerHTML = emomMovementHtml(w, v.minute);
    if (v.done && !t.autoFinished) { t.autoFinished = true; beepHigh(); finishHiit(true); }
  } else if (w.format === "tabata") {
    big.textContent = fmtClock(v.phaseLeft);
    if (sub) sub.textContent = v.phase.toUpperCase() + " · round " + v.round + " of " + (w.rounds || 8);
    if (face) face.className = "hiit-face " + (v.done ? "done" : v.phase);
    if (v.done && !t.autoFinished) { t.autoFinished = true; beepHigh(); finishHiit(true); }
  } else {
    big.textContent = fmtClock(v.elapsed);
    const capTxt = v.capSec ? " · cap " + fmtClock(v.capSec) : "";
    if (sub) sub.textContent = (v.overCap ? "OVER CAP" : "elapsed") + capTxt +
      (w.rounds ? " · round " + Math.min(w.rounds, (t.roundsDone || 0) + 1) + "/" + w.rounds : "");
    if (face) face.className = "hiit-face " + (v.overCap ? "over" : "run");
    if (v.overCap && !t.cappedBeeped) { t.cappedBeeped = true; beepHigh(); }
  }
  const rb = document.getElementById("round-count");
  if (rb) rb.textContent = String(t.roundsDone || 0);
}

function emomMovementHtml(w, minute) {
  if (!w.movements.length) return "";
  // Alternating EMOM cycles movements; a fixed one shows the whole list each minute
  if (w.emomAlternate) {
    const m = w.movements[(minute - 1) % w.movements.length];
    return `<strong>${escapeHtml(describeMovement(m))}</strong>`;
  }
  return w.movements.map(m => escapeHtml(describeMovement(m))).join("<br>");
}

// ------------------------------------------------------------------
// DRAFT / RESUME
// ------------------------------------------------------------------
function getHiitDraft() { return loadData().hiitDraft || null; }
function saveHiitDraft() {
  const data = loadData();
  data.hiitDraft = {
    iso: hiitState.iso, workout: hiitState.workout,
    scaling: hiitState.scaling, timer: hiitState.timer
  };
  saveData();
}
function clearHiitDraft() {
  const data = loadData();
  data.hiitDraft = null;
  saveData();
}

// ------------------------------------------------------------------
// STATE + SHELL
// ------------------------------------------------------------------
let hiitState = { open: false, step: "menu", iso: null, workout: null,
                  scaling: "rx", timer: null, build: null, editingId: null };

function openHiit(iso, step) {
  hiitState = { open: true, step: step || "menu", iso: iso, workout: null,
                scaling: "rx", timer: null, build: null, editingId: null };
  renderHiit();
}

function closeHiit() {
  hiitState.open = false;
  stopHiitTimer();
  releaseWake();
  document.getElementById("builder-root").innerHTML = "";
  document.body.style.overflow = "";
  render();
}

function hiitGo(step) { hiitState.step = step; renderHiit(); }

function renderHiit() {
  const root = document.getElementById("builder-root");
  if (!hiitState.open) { root.innerHTML = ""; document.body.style.overflow = ""; return; }
  document.body.style.overflow = "hidden";
  const s = hiitState.step;
  const body =
      s === "menu"   ? hiitMenuHtml()
    : s === "list"   ? hiitListHtml()
    : s === "detail" ? hiitDetailHtml()
    : s === "build"  ? hiitBuildHtml()
    : s === "timer"  ? hiitTimerHtml()
    : s === "result" ? hiitResultHtml()
    : "";
  const titles = { menu: "HIIT session", list: "CrossFit workouts", detail: hiitState.workout ? hiitState.workout.name : "Workout",
                   build: "Build my own", timer: hiitState.workout ? hiitState.workout.name : "Workout",
                   result: "Log result" };
  const backTo = { list: "menu", detail: "list", build: "menu" };

  root.innerHTML = `
    <div class="builder-overlay">
      <header class="builder-head">
        <button class="bld-back" data-h="back">${s === "menu" ? "✕" : "‹"}</button>
        <div class="bld-title">${titles[s] || ""}</div>
        <div style="width:38px"></div>
      </header>
      <div class="builder-body">${body}</div>
    </div>`;
  wireHiit(backTo[s]);
  if (s === "timer") { startHiitTimer(); acquireWake(); }
  else { stopHiitTimer(); releaseWake(); }
}

// ------------------------------------------------------------------
// SCREENS
// ------------------------------------------------------------------
function hiitMenuHtml() {
  const draft = getHiitDraft();
  const last = lastHiitSession();
  return `
    ${draft && draft.workout ? `
      <div class="bld-resume">
        <div><strong>Workout in progress</strong>
          <div class="dim">${escapeHtml(draft.workout.name)} · ${formatPrettyDate(draft.iso)}</div></div>
        <div class="bld-resume-btns">
          <button class="btn primary" data-h="resume">Resume</button>
          <button class="btn danger" data-h="discard">Discard</button>
        </div>
      </div>` : ""}
    <button class="bld-choice" data-h="go-list">
      <div class="bc-title">CrossFit workouts</div>
      <div class="bc-sub">${CROSSFIT_WORKOUTS.length} benchmarks${getUserHiitWorkouts().length ? " + " + getUserHiitWorkouts().length + " of yours" : ""}</div>
    </button>
    <button class="bld-choice" data-h="go-build">
      <div class="bc-title">Build my own</div>
      <div class="bc-sub">Pick a format, add movements, save it for next time</div>
    </button>
    ${last ? `
      <button class="bld-choice" data-h="repeat-last">
        <div class="bc-title">Repeat last HIIT workout</div>
        <div class="bc-sub">${escapeHtml(last.workoutName || last.name || "Workout")} · ${formatPrettyDate(last.iso)}</div>
      </button>` : ""}
    <button class="bld-choice" data-h="quick-log">
      <div class="bc-title">Quick log</div>
      <div class="bc-sub">Just a name, duration and comments</div>
    </button>
    <p class="bld-note">Loads shown for <strong>${hiitSex() === "female" ? "women" : "men"}</strong>. Change in Settings.</p>`;
}

function hiitListHtml() {
  const list = allHiitWorkouts();
  return `<div class="bld-list">
    ${list.map(w => {
      const resolved = resolveWorkout(w, "rx");
      const hist = hiitHistory(w.key);
      const best = hiitBest(w.key, "rx");
      const staleWeeks = hist.length ? weeksSince(hist[0].iso) : null;
      return `
        <button class="bld-choice hiit-card" data-h="pick-wk" data-wk="${w.key}">
          <div class="hiit-card-top">
            <span class="bc-title">${escapeHtml(w.name)}${w.mine ? `<span class="mine-flag">mine</span>` : ""}</span>
            <span class="hiit-fmt">${formatLabel(resolved)}</span>
          </div>
          <div class="bc-sub">${escapeHtml(workoutSummary(resolved))}</div>
          <div class="hiit-card-foot">
            ${best ? `<span class="hiit-best">Best ${formatResult(w.format, best.entry.result)}</span>`
                   : `<span class="dim">Not done yet</span>`}
            ${staleWeeks != null && staleWeeks >= 8 ? `<span class="hiit-stale">${staleWeeks}w ago — retest?</span>` : ""}
          </div>
        </button>`;
    }).join("")}
  </div>`;
}

function hiitDetailHtml() {
  const w = hiitState.workout;
  const base = findWorkout(w.key);
  const hist = hiitHistory(w.key);
  return `
    <div class="hiit-detail-head">
      <div class="hiit-fmt big">${formatLabel(w)}</div>
      ${w.capMin ? `<div class="dim">Time cap ${w.capMin} min</div>` : ""}
    </div>
    <div class="bld-note" style="margin:0 0 14px;">${escapeHtml(w.stimulus || "")}</div>
    ${w.vestKg ? `<div class="bld-planned">Wear a ${w.vestKg} kg vest.</div>` : ""}
    <div class="bld-section-label">The workout</div>
    <div class="hiit-moves">
      ${w.repScheme ? `<div class="hiit-scheme">${w.repScheme.join(" – ")} reps of:</div>` : ""}
      ${w.movements.map(m => `<div class="hiit-move">${escapeHtml(describeMovement(m))}${m.subNote ? `<span class="dim"> (${escapeHtml(m.subNote)})</span>` : ""}</div>`).join("")}
    </div>
    <div class="bld-section-label">Scaling</div>
    <div class="hiit-scale-row">
      ${["rx","scaled","custom"].map(sc => `
        <button class="hiit-scale ${hiitState.scaling === sc ? "on" : ""}" data-h="set-scale" data-sc="${sc}">
          ${sc === "rx" ? "Rx" : sc === "scaled" ? "Scaled" : "Custom"}
        </button>`).join("")}
    </div>
    ${hiitState.scaling === "custom" ? `<button class="btn" data-h="edit-custom" style="width:100%;margin-bottom:12px;">Edit movements →</button>` : ""}
    ${hist.length ? `
      <div class="bld-section-label">History</div>
      ${hist.slice(0, 8).map(h => {
        const best = hiitBest(w.key, h.scaling);
        const isPb = best && best.entry.id === h.id;
        return `<div class="hist-row">
          <span>${formatPrettyDate(h.iso)} <span class="dim">${h.scaling}</span>${isPb ? `<span class="pb-badge">PB</span>` : ""}</span>
          <span class="hr-1rm">${formatResult(base.format, h.result)}</span>
        </div>`;
      }).join("")}
      ${renderHiitTrend(w.key)}` : ""}
    <button class="btn primary bld-start" data-h="start">Start workout</button>`;
}

function hiitTimerHtml() {
  const w = hiitState.workout;
  const showRounds = w.format === "amrap" || w.format === "rounds" || w.format === "chipper";
  return `
    <div class="hiit-face prep" id="hiit-face">
      <div class="hiit-clock" id="hiit-clock">${PREP_SEC}</div>
      <div class="hiit-subline" id="hiit-sub">Get ready</div>
    </div>
    ${w.format === "emom" ? `<div class="hiit-emom" id="emom-move"></div>` : ""}
    ${w.format !== "emom" ? `
      <div class="hiit-movelist">
        ${w.repScheme ? `<div class="hiit-scheme">${w.repScheme.join(" – ")}</div>` : ""}
        ${w.movements.map(m => `<div class="hiit-move">${escapeHtml(describeMovement(m))}</div>`).join("")}
      </div>` : ""}
    ${showRounds ? `
      <div class="hiit-rounds">
        <div class="hr-label">Rounds</div>
        <div class="hr-count" id="round-count">0</div>
        <div class="hr-btns">
          <button data-h="round-minus">−</button>
          <button class="plus" data-h="round-plus">+1 round</button>
        </div>
      </div>` : ""}
    <div class="hiit-ctl">
      <button class="btn" data-h="pause">${hiitState.timer && hiitState.timer.pausedAt ? "Resume" : "Pause"}</button>
      <button class="btn primary" data-h="finish">Finish</button>
    </div>`;
}

function hiitResultHtml() {
  const w = hiitState.workout, t = hiitState.timer || {};
  const r = hiitState.pending || {};
  const mins = r.durationMin != null ? r.durationMin : "";
  const isAmrap = w.format === "amrap";
  const isInterval = w.format === "emom" || w.format === "tabata";
  const prevBest = hiitBest(w.key, hiitState.scaling, hiitState.editingId);
  const myScore = resultScore(w.format, r);
  const beatsPb = myScore != null && isBetter(w.format, myScore, prevBest ? prevBest.score : null);

  return `
    ${beatsPb ? `<div class="hiit-pb">New personal best — ${hiitState.scaling.toUpperCase()}</div>` : ""}
    <div class="bld-summary">${escapeHtml(w.name)} · ${hiitState.scaling.toUpperCase()}<br>
      <span style="font-size:22px;">${formatResult(w.format, r)}</span></div>

    ${isAmrap ? `
      <div class="macro-input-grid">
        <div class="field"><label>Rounds</label>
          <input type="number" inputmode="numeric" id="res-rounds" value="${r.roundsDone != null ? r.roundsDone : 0}"></div>
        <div class="field"><label>+ Reps</label>
          <input type="number" inputmode="numeric" id="res-reps" value="${r.partialReps != null ? r.partialReps : 0}"></div>
      </div>`
    : isInterval ? `
      <label class="form-checkbox" for="res-all">
        <input type="checkbox" id="res-all" ${r.completedAll !== false ? "checked" : ""}>
        <span>Completed every round</span>
      </label>
      <div class="form-row"><label>Missed minutes / rounds</label>
        <input type="number" inputmode="numeric" id="res-missed" value="${r.missedMinutes || 0}"></div>`
    : `
      <div class="macro-input-grid">
        <div class="field"><label>Minutes</label>
          <input type="number" inputmode="numeric" id="res-min" value="${Math.floor((r.timeSec || 0) / 60)}"></div>
        <div class="field"><label>Seconds</label>
          <input type="number" inputmode="numeric" id="res-sec" value="${Math.round((r.timeSec || 0) % 60)}"></div>
      </div>
      <label class="form-checkbox" for="res-capped">
        <input type="checkbox" id="res-capped" ${r.capped ? "checked" : ""}>
        <span>Hit the time cap</span>
      </label>
      ${r.capped || w.format === "chipper" ? `
        <div class="form-row"><label>Reps completed at cap (optional)</label>
          <input type="number" inputmode="numeric" id="res-partial" value="${r.partialReps || ""}"></div>` : ""}`}

    <div class="form-row"><label>Session effort (1-10)</label>
      <input type="number" inputmode="numeric" min="1" max="10" id="res-effort" value="${r.effortRating || ""}" placeholder="optional"></div>
    <div class="form-row"><label>Duration (min)</label>
      <input type="number" inputmode="numeric" id="res-dur" value="${mins}"></div>
    <div class="form-row"><label>Avg HR</label>
      <input type="number" inputmode="numeric" min="40" max="220" id="res-hr" value="${r.hrAvg || ""}" placeholder="optional"></div>
    <div class="form-row"><label>Comments</label>
      <input type="text" id="res-notes" value="${escapeHtml(r.notes || "")}" autocomplete="off"></div>
    ${prevBest ? `<p class="bld-note">Previous ${hiitState.scaling} best: ${formatResult(w.format, prevBest.entry.result)} (${formatPrettyDate(prevBest.entry.iso)})</p>` : ""}
    <div class="bld-actions">
      ${hiitState.editingId ? `<button class="btn danger" data-h="delete-result">Delete</button>` : ""}
      <button class="btn primary" data-h="save-result">${hiitState.editingId ? "Save changes" : "Save workout"}</button>
    </div>`;
}

// ---- build my own --------------------------------------------------
function hiitBuildHtml() {
  const b = hiitState.build;
  if (!b || !b.format) {
    return `<div class="bld-tiles">
      ${Object.keys(HIIT_FORMATS).map(f => `
        <button class="bld-tile" data-h="pick-format" data-fmt="${f}">
          ${HIIT_FORMATS[f].label}
          <span class="tile-flag">${HIIT_FORMATS[f].blurb}</span>
        </button>`).join("")}
    </div>`;
  }
  const needsMins   = b.format === "amrap" || b.format === "emom";
  const needsRounds = b.format === "rounds" || b.format === "tabata";
  const needsWork   = b.format === "tabata";
  const needsCap    = b.format === "for-time" || b.format === "rounds" || b.format === "chipper";
  return `
    <div class="bld-meta">${HIIT_FORMATS[b.format].label} · ${HIIT_FORMATS[b.format].blurb}</div>
    <div class="macro-input-grid">
      ${needsMins   ? `<div class="field"><label>Minutes</label><input type="number" inputmode="numeric" id="b-mins" value="${b.durationMin || 20}"></div>` : ""}
      ${needsRounds ? `<div class="field"><label>Rounds</label><input type="number" inputmode="numeric" id="b-rounds" value="${b.rounds || (b.format === "tabata" ? 8 : 5)}"></div>` : ""}
      ${needsWork   ? `<div class="field"><label>Work (s)</label><input type="number" inputmode="numeric" id="b-work" value="${b.workSec || 20}"></div>
                       <div class="field"><label>Rest (s)</label><input type="number" inputmode="numeric" id="b-rest" value="${b.restSec || 10}"></div>` : ""}
      ${needsCap    ? `<div class="field"><label>Cap (min)</label><input type="number" inputmode="numeric" id="b-cap" value="${b.capMin || ""}" placeholder="none"></div>` : ""}
    </div>
    ${b.format === "emom" ? `
      <label class="form-checkbox" for="b-alt">
        <input type="checkbox" id="b-alt" ${b.emomAlternate ? "checked" : ""}>
        <span>Alternate movements each minute</span>
      </label>` : ""}
    <div class="bld-section-label">Movements</div>
    <div class="bld-list">
      ${(b.movements || []).length ? b.movements.map((m, i) => `
        <div class="bld-row">
          <div class="br-main">
            <div class="br-name">${escapeHtml(movementName(m.key))}</div>
            <div class="br-spec">${escapeHtml(describeMovement(m))}</div>
          </div>
          <div class="br-actions">
            <button data-h="edit-move" data-i="${i}">✎</button>
            <button data-h="rm-move" data-i="${i}">✕</button>
          </div>
        </div>`).join("") : `<p class="muted" style="font-size:12px;">No movements yet.</p>`}
    </div>
    <button class="btn" data-h="add-move" style="width:100%;margin-top:10px;">+ Add movement</button>
    <div class="form-row" style="margin-top:16px;"><label>Workout name</label>
      <input type="text" id="b-name" value="${escapeHtml(b.name || "")}" placeholder="e.g. Thursday burner" autocomplete="off"></div>
    <div class="bld-actions">
      <button class="btn" data-h="save-mine">Save as my workout</button>
      <button class="btn primary" data-h="start-build">Start</button>
    </div>`;
}

function renderHiitTrend(key) {
  const w = findWorkout(key);
  const hist = hiitHistory(key).filter(h => resultScore(w.format, h.result) != null).reverse();
  if (hist.length < 2) return "";
  const W = 360, H = 130, pad = { t: 10, r: 10, b: 20, l: 40 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const vals = hist.map(h => resultScore(w.format, h.result));
  const lo = Math.min(...vals) * 0.95, hi = Math.max(...vals) * 1.05;
  const x = i => pad.l + (i / (hist.length - 1)) * iw;
  const y = v => pad.t + ih - ((v - lo) / (hi - lo || 1)) * ih;
  const path = hist.map((h, i) => (i ? "L" : "M") + x(i) + "," + y(vals[i])).join("");
  const dots = hist.map((h, i) => `<circle cx="${x(i)}" cy="${y(vals[i])}" r="2.5" fill="#ff6b35"/>`).join("");
  const fmtAxis = v => w.format === "amrap" ? Math.floor(v / 1000) + "r" : fmtClock(v);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="margin-top:10px;">
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${H - pad.b}" stroke="#2a2a2a"/>
    <text x="${pad.l - 4}" y="${y(Math.max(...vals)) + 4}" font-size="9" fill="#707070" text-anchor="end">${fmtAxis(Math.max(...vals))}</text>
    <text x="${pad.l - 4}" y="${y(Math.min(...vals)) + 4}" font-size="9" fill="#707070" text-anchor="end">${fmtAxis(Math.min(...vals))}</text>
    <path d="${path}" stroke="#ff6b35" stroke-width="2" fill="none"/>${dots}
  </svg>`;
}

function lastHiitSession() {
  const data = loadData();
  for (const iso of Object.keys(data.days).sort().reverse()) {
    for (const es of (data.days[iso].extraSessions || [])) {
      if (es.hiit) return Object.assign({ iso }, es);
    }
  }
  return null;
}

// ------------------------------------------------------------------
// WIRING
// ------------------------------------------------------------------
function wireHiit(backStep) {
  const root = document.getElementById("builder-root");
  const on = (sel, fn) => root.querySelectorAll(sel).forEach(el => el.addEventListener("click", fn));

  root.querySelector('[data-h="back"]').addEventListener("click", () => {
    if (!backStep) { closeHiit(); return; }
    hiitGo(backStep);
  });

  on('[data-h="go-list"]',  () => hiitGo("list"));
  on('[data-h="go-build"]', () => { hiitState.build = { movements: [] }; hiitGo("build"); });
  on('[data-h="quick-log"]', () => { closeHiit(); openExtraModal(hiitState.iso, null, "hiit"); });

  on('[data-h="resume"]', () => {
    const d = getHiitDraft();
    hiitState.workout = d.workout; hiitState.scaling = d.scaling;
    hiitState.timer = d.timer; hiitState.iso = d.iso || hiitState.iso;
    if (hiitState.timer) hiitState.timer.autoFinished = false;
    primeAudio();
    hiitGo("timer");
  });
  on('[data-h="discard"]', () => {
    if (confirm("Discard the workout in progress?")) { clearHiitDraft(); renderHiit(); }
  });
  on('[data-h="repeat-last"]', () => {
    const last = lastHiitSession();
    if (!last) return;
    const base = findWorkout(last.workoutKey);
    if (!base) { showToast("That workout is no longer in the library"); return; }
    hiitState.scaling = last.scaling || "rx";
    hiitState.workout = resolveWorkout(base, hiitState.scaling);
    hiitGo("detail");
  });

  on('[data-h="pick-wk"]', e => {
    const base = findWorkout(e.currentTarget.dataset.wk);
    if (!base) return;
    hiitState.scaling = "rx";
    hiitState.workout = resolveWorkout(base, "rx");
    hiitGo("detail");
  });
  on('[data-h="set-scale"]', e => {
    const sc = e.currentTarget.dataset.sc;
    const base = findWorkout(hiitState.workout.key);
    hiitState.scaling = sc;
    hiitState.workout = resolveWorkout(base, sc === "custom" ? "rx" : sc);
    hiitState.workout.scaling = sc;
    renderHiit();
  });
  on('[data-h="edit-custom"]', () => {
    hiitState.build = Object.assign({}, hiitState.workout,
      { movements: hiitState.workout.movements.map(m => Object.assign({}, m)),
        name: hiitState.workout.name + " (custom)", fromCustom: true });
    hiitGo("build");
  });

  on('[data-h="start"]', () => startWorkoutRun(hiitState.workout));

  // ---- build screen ----
  on('[data-h="pick-format"]', e => {
    hiitState.build = { format: e.currentTarget.dataset.fmt, movements: [] };
    renderHiit();
  });
  on('[data-h="add-move"]',  () => openMovementPicker());
  on('[data-h="edit-move"]', e => openMovementEditor(+e.currentTarget.dataset.i));
  on('[data-h="rm-move"]',   e => {
    hiitState.build.movements.splice(+e.currentTarget.dataset.i, 1);
    syncBuildFields(); renderHiit();
  });
  on('[data-h="save-mine"]', () => {
    syncBuildFields();
    const b = hiitState.build;
    if (!b.name) { showToast("Give it a name first"); return; }
    if (!b.movements.length) { showToast("Add at least one movement"); return; }
    saveUserHiitWorkout({
      name: b.name, category: "mine", format: b.format,
      durationMin: b.durationMin, rounds: b.rounds, capMin: b.capMin,
      workSec: b.workSec, restSec: b.restSec, emomAlternate: b.emomAlternate,
      stimulus: "Your own workout.",
      movements: b.movements.map(m => Object.assign({}, m))
    });
    showToast("Saved to your library");
    renderHiit();
  });
  on('[data-h="start-build"]', () => {
    syncBuildFields();
    const b = hiitState.build;
    if (!b.movements.length) { showToast("Add at least one movement"); return; }
    const w = Object.assign({}, b, { key: b.key || "adhoc", name: b.name || "Custom workout",
                                     scaling: b.fromCustom ? "custom" : "rx" });
    hiitState.scaling = w.scaling;
    startWorkoutRun(w);
  });

  // ---- timer ----
  on('[data-h="round-plus"]',  () => {
    hiitState.timer.roundsDone = (hiitState.timer.roundsDone || 0) + 1;
    beep(760, 0.08); saveHiitDraft(); renderTimerFace();
  });
  on('[data-h="round-minus"]', () => {
    hiitState.timer.roundsDone = Math.max(0, (hiitState.timer.roundsDone || 0) - 1);
    saveHiitDraft(); renderTimerFace();
  });
  on('[data-h="pause"]', () => {
    const t = hiitState.timer;
    if (t.pausedAt) { t.pausedTotal = (t.pausedTotal || 0) + (Date.now() - t.pausedAt); t.pausedAt = null; }
    else { t.pausedAt = Date.now(); }
    saveHiitDraft(); renderHiit();
  });
  on('[data-h="finish"]', () => finishHiit(false));

  // ---- result ----
  on('[data-h="save-result"]',   () => saveHiitResult());
  on('[data-h="delete-result"]', () => {
    if (!confirm("Delete this logged workout?")) return;
    deleteExtraSession(hiitState.iso, hiitState.editingId);
    closeHiit();
    showToast("Deleted");
  });
}

function syncBuildFields() {
  const b = hiitState.build;
  if (!b) return;
  const g = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const n = id => { const v = parseInt(g(id), 10); return Number.isFinite(v) ? v : null; };
  if (document.getElementById("b-mins"))   b.durationMin = n("b-mins");
  if (document.getElementById("b-rounds")) b.rounds = n("b-rounds");
  if (document.getElementById("b-work"))   b.workSec = n("b-work");
  if (document.getElementById("b-rest"))   b.restSec = n("b-rest");
  if (document.getElementById("b-cap"))    b.capMin = n("b-cap");
  if (document.getElementById("b-name"))   b.name = g("b-name").trim();
  const alt = document.getElementById("b-alt");
  if (alt) b.emomAlternate = alt.checked;
}

function startWorkoutRun(w) {
  primeAudio();                       // must happen inside the tap
  _lastPhaseKey = null;
  hiitState.workout = w;
  hiitState.timer = { startedAt: Date.now() + PREP_SEC * 1000, pausedAt: null,
                      pausedTotal: 0, roundsDone: 0 };
  saveHiitDraft();
  hiitGo("timer");
}

function finishHiit(auto) {
  const w = hiitState.workout, t = hiitState.timer;
  stopHiitTimer();
  releaseWake();
  const v = timerView(t, w);
  const r = {};
  if (w.format === "amrap") {
    r.roundsDone = t.roundsDone || 0;
    r.partialReps = 0;
  } else if (w.format === "emom" || w.format === "tabata") {
    r.completedAll = !!auto;
    r.missedMinutes = 0;
  } else {
    r.timeSec = Math.round(v.elapsed);
    r.capped = !!v.overCap;
  }
  r.durationMin = Math.max(1, Math.round(v.elapsed / 60));
  hiitState.pending = r;
  hiitGo("result");
}

function saveHiitResult() {
  const w = hiitState.workout;
  const g = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const n = id => { const v = parseInt(g(id), 10); return Number.isFinite(v) ? v : null; };
  const r = {};

  if (w.format === "amrap") {
    r.roundsDone  = n("res-rounds") || 0;
    r.partialReps = n("res-reps") || 0;
  } else if (w.format === "emom" || w.format === "tabata") {
    const all = document.getElementById("res-all");
    r.completedAll  = all ? all.checked : true;
    r.missedMinutes = n("res-missed") || 0;
  } else {
    const mins = n("res-min") || 0, secs = n("res-sec") || 0;
    r.timeSec = mins * 60 + secs;
    const cap = document.getElementById("res-capped");
    r.capped = cap ? cap.checked : false;
    const p = n("res-partial");
    if (p != null) r.partialReps = p;
  }

  const payload = {
    type: "hiit", hiit: true,
    name: w.name + (hiitState.scaling !== "rx" ? " (" + hiitState.scaling + ")" : ""),
    workoutKey: w.key, workoutName: w.name, format: w.format,
    scaling: hiitState.scaling,
    result: r,
    movements: w.movements.map(m => Object.assign({}, m)),
    effortRating: n("res-effort"),
    durationMin: n("res-dur"),
    hrAvg: n("res-hr"),
    notes: (g("res-notes") || "").trim()
  };

  if (hiitState.editingId) {
    updateExtraSession(hiitState.iso, hiitState.editingId, payload);
    showToast("Result updated");
  } else {
    const best = hiitBest(w.key, hiitState.scaling);
    const score = resultScore(w.format, r);
    const pb = score != null && isBetter(w.format, score, best ? best.score : null);
    addExtraSession(hiitState.iso, payload);
    clearHiitDraft();
    showToast(pb ? "Saved — new " + hiitState.scaling.toUpperCase() + " PB" : "Workout saved");
  }
  closeHiit();
}

// Re-open a logged HIIT result for editing
function openHiitResultEditor(iso, extraId) {
  const es = getExtraSessions(iso).find(e => e.id === extraId);
  if (!es) return;
  const base = findWorkout(es.workoutKey);
  hiitState = {
    open: true, step: "result", iso: iso,
    workout: base ? resolveWorkout(base, es.scaling === "custom" ? "rx" : es.scaling)
                  : { key: es.workoutKey, name: es.workoutName || es.name,
                      format: es.format, movements: es.movements || [] },
    scaling: es.scaling || "rx", timer: null, build: null, editingId: extraId,
    pending: Object.assign({}, es.result, {
      durationMin: es.durationMin, hrAvg: es.hrAvg, notes: es.notes,
      effortRating: es.effortRating })
  };
  renderHiit();
}

// ------------------------------------------------------------------
// SUB-MODALS
// ------------------------------------------------------------------
function openMovementPicker() {
  syncBuildFields();
  const lib = getHiitMovements();
  const keys = Object.keys(lib).sort((a, b) => lib[a].name.localeCompare(lib[b].name));
  const html = `
    <div class="form-row">
      <input type="text" id="mv-search" placeholder="Search, or type a new movement" autocomplete="off">
    </div>
    <button class="btn" data-mv="custom" style="width:100%;margin-bottom:10px;">+ Add as custom movement</button>
    <div class="bld-list">
      ${keys.map(k => `
        <button class="bld-choice" data-mv-key="${k}">
          <div class="bc-title">${escapeHtml(lib[k].name)}</div>
          <div class="bc-sub">${lib[k].unit}${lib[k].loadable ? " · loadable" : ""}</div>
        </button>`).join("")}
    </div>`;
  openModal("Add movement", html, root => {
    const search = root.querySelector("#mv-search");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      root.querySelectorAll("[data-mv-key]").forEach(b => {
        b.hidden = q && !b.textContent.toLowerCase().includes(q);
      });
    });
    const add = key => {
      const mv = getMovement(key);
      const m = { key };
      if (mv.unit === "distance") m.distanceM = 400;
      else if (mv.unit === "calories") m.calories = 15;
      else if (mv.unit === "time") m.timeSec = 30;
      else m.reps = 10;
      hiitState.build.movements.push(m);
      closeModal(); renderHiit();
    };
    root.querySelectorAll("[data-mv-key]").forEach(b =>
      b.addEventListener("click", () => add(b.dataset.mvKey)));
    root.querySelector('[data-mv="custom"]').addEventListener("click", () => {
      const key = addCustomMovement(search.value);
      if (!key) { showToast("Type a name first"); return; }
      add(key);
    });
  });
}

function openMovementEditor(i) {
  syncBuildFields();
  const m = hiitState.build.movements[i];
  const mv = getMovement(m.key);
  const unitField =
      mv.unit === "distance" ? { id: "mv-dist", label: "Distance (m)", val: m.distanceM }
    : mv.unit === "calories" ? { id: "mv-cal",  label: "Calories",     val: m.calories }
    : mv.unit === "time"     ? { id: "mv-time", label: "Seconds",      val: m.timeSec }
    :                          { id: "mv-reps", label: "Reps",         val: m.reps };
  const html = `
    <div class="form-row"><label>${unitField.label}</label>
      <input type="number" inputmode="numeric" id="${unitField.id}" value="${unitField.val != null ? unitField.val : ""}"></div>
    <div class="form-row"><label>Load (kg) — optional</label>
      <input type="number" inputmode="decimal" step="0.5" id="mv-load" value="${m.loadKg != null ? m.loadKg : ""}"></div>
    <div class="form-row"><label>Height (cm) — optional</label>
      <input type="number" inputmode="numeric" id="mv-height" value="${m.heightCm != null ? m.heightCm : ""}"></div>
    <div class="modal-btn-row"><button class="btn primary" data-mv="save">Save</button></div>`;
  openModal("Edit " + mv.name, html, root => {
    root.querySelector('[data-mv="save"]').addEventListener("click", () => {
      const num = id => { const el = root.querySelector("#" + id);
        if (!el || el.value === "") return null;
        const v = parseFloat(el.value); return Number.isFinite(v) ? v : null; };
      const uv = num(unitField.id);
      if (mv.unit === "distance") m.distanceM = uv;
      else if (mv.unit === "calories") m.calories = uv;
      else if (mv.unit === "time") m.timeSec = uv;
      else m.reps = uv;
      const l = num("mv-load"), h = num("mv-height");
      if (l != null) m.loadKg = l; else delete m.loadKg;
      if (h != null) m.heightCm = h; else delete m.heightCm;
      closeModal(); renderHiit();
    });
  });
}
