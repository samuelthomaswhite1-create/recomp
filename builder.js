"use strict";

// ==================================================================
// WORKOUT BUILDER
// Exercise library, template engine, guided builder, live logging,
// progression hints, per-exercise history and volume analytics.
//
// Exercise keys are deliberately SHARED with the training program's
// LIFT_TEMPLATES so last-used weights, estimated 1RM and PBs are
// unified across programmed sessions and builder sessions.
// ==================================================================

// ------------------------------------------------------------------
// EXERCISE LIBRARY  <<< ADD YOUR OWN EXERCISES IN THIS BLOCK >>>
// pattern groups define what can be swapped for what.
// ------------------------------------------------------------------
const EXERCISE_LIBRARY_SEED = {
  // ---- horizontal push ----
  "bench-press":         { name: "Barbell Bench Press",      muscles: ["chest","triceps","front delts"], pattern: "horizontal-push", equipment: "barbell",  unilateral: false },
  "db-bench":            { name: "Dumbbell Bench Press",     muscles: ["chest","triceps","front delts"], pattern: "horizontal-push", equipment: "dumbbell", unilateral: false },
  "incline-db":          { name: "Incline Dumbbell Press",   muscles: ["chest","front delts","triceps"], pattern: "horizontal-push", equipment: "dumbbell", unilateral: false },
  "incline-barbell":     { name: "Incline Barbell Press",    muscles: ["chest","front delts","triceps"], pattern: "horizontal-push", equipment: "barbell",  unilateral: false },
  "machine-chest-press": { name: "Machine Chest Press",      muscles: ["chest","triceps"],               pattern: "horizontal-push", equipment: "machine",  unilateral: false },
  "dips":                { name: "Weighted Dips",            muscles: ["chest","triceps"],               pattern: "horizontal-push", equipment: "bodyweight", unilateral: false },
  "close-grip-bench":    { name: "Close-Grip Bench Press",   muscles: ["triceps","chest"],               pattern: "horizontal-push", equipment: "barbell",  unilateral: false },
  "pushup":              { name: "Push-up",                  muscles: ["chest","triceps"],               pattern: "horizontal-push", equipment: "bodyweight", unilateral: false },

  // ---- vertical push ----
  "ohp":                   { name: "Standing Overhead Press",  muscles: ["shoulders","triceps"], pattern: "vertical-push", equipment: "barbell",  unilateral: false },
  "db-shoulder-press":     { name: "Dumbbell Shoulder Press",  muscles: ["shoulders","triceps"], pattern: "vertical-push", equipment: "dumbbell", unilateral: false },
  "machine-shoulder-press":{ name: "Machine Shoulder Press",   muscles: ["shoulders","triceps"], pattern: "vertical-push", equipment: "machine",  unilateral: false },
  "arnold-press":          { name: "Arnold Press",             muscles: ["shoulders","triceps"], pattern: "vertical-push", equipment: "dumbbell", unilateral: false },

  // ---- horizontal pull ----
  "barbell-row": { name: "Barbell Row",           muscles: ["back","biceps","rear delts"], pattern: "horizontal-pull", equipment: "barbell",  unilateral: false },
  "cable-row":   { name: "Seated Cable Row",      muscles: ["back","biceps"],              pattern: "horizontal-pull", equipment: "cable",    unilateral: false },
  "chest-row":   { name: "Chest-Supported Row",   muscles: ["back","rear delts"],          pattern: "horizontal-pull", equipment: "machine",  unilateral: false },
  "db-row":      { name: "Single-Arm Dumbbell Row", muscles: ["back","biceps"],            pattern: "horizontal-pull", equipment: "dumbbell", unilateral: true },
  "t-bar-row":   { name: "T-Bar Row",             muscles: ["back","biceps"],              pattern: "horizontal-pull", equipment: "barbell",  unilateral: false },
  "machine-row": { name: "Machine Row",           muscles: ["back","biceps"],              pattern: "horizontal-pull", equipment: "machine",  unilateral: false },

  // ---- vertical pull ----
  "wt-pullup":       { name: "Weighted Pull-up",   muscles: ["back","biceps"], pattern: "vertical-pull", equipment: "bodyweight", unilateral: false },
  "pullup":          { name: "Pull-up",            muscles: ["back","biceps"], pattern: "vertical-pull", equipment: "bodyweight", unilateral: false },
  "chin-up":         { name: "Chin-up",            muscles: ["back","biceps"], pattern: "vertical-pull", equipment: "bodyweight", unilateral: false },
  "assisted-pullup": { name: "Assisted Pull-up",   muscles: ["back","biceps"], pattern: "vertical-pull", equipment: "machine",    unilateral: false },
  "lat-pulldown":    { name: "Lat Pulldown",       muscles: ["back","biceps"], pattern: "vertical-pull", equipment: "cable",      unilateral: false },

  // ---- squat ----
  "back-squat":   { name: "Back Squat",   muscles: ["quads","glutes"], pattern: "squat", equipment: "barbell",  unilateral: false },
  "front-squat":  { name: "Front Squat",  muscles: ["quads","glutes"], pattern: "squat", equipment: "barbell",  unilateral: false },
  "goblet-squat": { name: "Goblet Squat", muscles: ["quads","glutes"], pattern: "squat", equipment: "dumbbell", unilateral: false },
  "hack-squat":   { name: "Hack Squat",   muscles: ["quads","glutes"], pattern: "squat", equipment: "machine",  unilateral: false },
  "leg-press":    { name: "Leg Press",    muscles: ["quads","glutes"], pattern: "squat", equipment: "machine",  unilateral: false },

  // ---- hinge ----
  "deadlift":          { name: "Conventional Deadlift", muscles: ["hamstrings","glutes","back"], pattern: "hinge", equipment: "barbell",  unilateral: false },
  "trap-bar-deadlift": { name: "Trap-Bar Deadlift",     muscles: ["hamstrings","glutes","quads"],pattern: "hinge", equipment: "barbell",  unilateral: false },
  "rdl":               { name: "Romanian Deadlift",     muscles: ["hamstrings","glutes"],        pattern: "hinge", equipment: "barbell",  unilateral: false },
  "sl-rdl":            { name: "Single-Leg RDL",        muscles: ["hamstrings","glutes"],        pattern: "hinge", equipment: "dumbbell", unilateral: true },
  "hip-thrust":        { name: "Hip Thrust",            muscles: ["glutes","hamstrings"],        pattern: "hinge", equipment: "barbell",  unilateral: false },
  "good-morning":      { name: "Good Morning",          muscles: ["hamstrings","glutes"],        pattern: "hinge", equipment: "barbell",  unilateral: false },

  // ---- lunge / single leg ----
  "bss":            { name: "Bulgarian Split Squat", muscles: ["quads","glutes"], pattern: "lunge", equipment: "dumbbell",   unilateral: true },
  "walking-lunge":  { name: "Walking Lunge",         muscles: ["quads","glutes"], pattern: "lunge", equipment: "dumbbell",   unilateral: true },
  "reverse-lunge":  { name: "Reverse Lunge",         muscles: ["quads","glutes"], pattern: "lunge", equipment: "dumbbell",   unilateral: true },
  "step-up":        { name: "Step-up",               muscles: ["quads","glutes"], pattern: "lunge", equipment: "dumbbell",   unilateral: true },
  "split-squat":    { name: "Split Squat",           muscles: ["quads","glutes"], pattern: "lunge", equipment: "bodyweight", unilateral: true },

  // ---- leg isolation ----
  "leg-curl":       { name: "Seated Leg Curl",   muscles: ["hamstrings"], pattern: "ham-isolation",  equipment: "machine",    unilateral: false },
  "nordic-curl":    { name: "Nordic Curl",       muscles: ["hamstrings"], pattern: "ham-isolation",  equipment: "bodyweight", unilateral: false },
  "glute-ham-raise":{ name: "Glute-Ham Raise",   muscles: ["hamstrings","glutes"], pattern: "ham-isolation", equipment: "machine", unilateral: false },
  "leg-extension":  { name: "Leg Extension",     muscles: ["quads"],      pattern: "quad-isolation", equipment: "machine",    unilateral: false },

  // ---- calves / ankle ----
  "calf-raise":       { name: "Standing Calf Raise",    muscles: ["calves"], pattern: "calf",  equipment: "machine",    unilateral: false },
  "seated-calf-raise":{ name: "Seated Calf Raise",      muscles: ["calves"], pattern: "calf",  equipment: "machine",    unilateral: false },
  "sl-calf-raise":    { name: "Single-Leg Calf Raise",  muscles: ["calves"], pattern: "calf",  equipment: "bodyweight", unilateral: true },
  "tibialis-raise":   { name: "Tibialis Raise",         muscles: ["shins"],  pattern: "ankle", equipment: "bodyweight", unilateral: false },

  // ---- hips ----
  "banded-lateral-walk":  { name: "Banded Lateral Walk", muscles: ["glute medius"], pattern: "hip-abduction", equipment: "band",    unilateral: false },
  "hip-abduction-machine":{ name: "Hip Abduction Machine", muscles: ["glute medius"], pattern: "hip-abduction", equipment: "machine", unilateral: false },
  "copenhagen-plank":     { name: "Copenhagen Plank",    muscles: ["adductors","core"], pattern: "hip-adduction", equipment: "bodyweight", unilateral: true, timeBased: true },

  // ---- delt / chest isolation ----
  "lateral-raise":       { name: "Dumbbell Lateral Raise", muscles: ["side delts"], pattern: "delt-isolation",  equipment: "dumbbell", unilateral: false },
  "cable-lateral-raise": { name: "Cable Lateral Raise",    muscles: ["side delts"], pattern: "delt-isolation",  equipment: "cable",    unilateral: false },
  "rear-delt-fly":       { name: "Rear Delt Fly",          muscles: ["rear delts"], pattern: "delt-isolation",  equipment: "dumbbell", unilateral: false },
  "face-pull":           { name: "Face Pull",              muscles: ["rear delts","upper back"], pattern: "delt-isolation", equipment: "cable", unilateral: false },
  "cable-fly":           { name: "Cable Fly",              muscles: ["chest"],      pattern: "chest-isolation", equipment: "cable",    unilateral: false },
  "pec-deck":            { name: "Pec Deck",               muscles: ["chest"],      pattern: "chest-isolation", equipment: "machine",  unilateral: false },

  // ---- arms ----
  "db-curl":              { name: "Dumbbell Curl",          muscles: ["biceps"],  pattern: "biceps-isolation",  equipment: "dumbbell", unilateral: false },
  "hammer-curl":          { name: "Hammer Curl",            muscles: ["biceps","forearms"], pattern: "biceps-isolation", equipment: "dumbbell", unilateral: false },
  "barbell-curl":         { name: "Barbell Curl",           muscles: ["biceps"],  pattern: "biceps-isolation",  equipment: "barbell",  unilateral: false },
  "preacher-curl":        { name: "Preacher Curl",          muscles: ["biceps"],  pattern: "biceps-isolation",  equipment: "machine",  unilateral: false },
  "triceps-pushdown":     { name: "Cable Triceps Pushdown", muscles: ["triceps"], pattern: "triceps-isolation", equipment: "cable",    unilateral: false },
  "skull-crusher":        { name: "Skull Crusher",          muscles: ["triceps"], pattern: "triceps-isolation", equipment: "barbell",  unilateral: false },
  "overhead-triceps-ext": { name: "Overhead Triceps Extension", muscles: ["triceps"], pattern: "triceps-isolation", equipment: "cable", unilateral: false },
  "curl-pushdown":        { name: "Curl + Pushdown Superset", muscles: ["biceps","triceps"], pattern: "arm-superset", equipment: "cable", unilateral: false },

  // ---- carries ----
  "farmers-carry":  { name: "Farmer's Carry",  muscles: ["traps","core","forearms"], pattern: "carry", equipment: "dumbbell", unilateral: false, distanceBased: true },
  "suitcase-carry": { name: "Suitcase Carry",  muscles: ["core","traps"],            pattern: "carry", equipment: "dumbbell", unilateral: true,  distanceBased: true },

  // ---- core ----
  "plank":             { name: "Plank",              muscles: ["core"], pattern: "core-anti-extension", equipment: "bodyweight", unilateral: false, timeBased: true },
  "hollow-hold":       { name: "Hollow Hold",        muscles: ["core"], pattern: "core-anti-extension", equipment: "bodyweight", unilateral: false, timeBased: true },
  "dead-bug":          { name: "Dead Bug",           muscles: ["core"], pattern: "core-anti-extension", equipment: "bodyweight", unilateral: true },
  "ab-wheel":          { name: "Ab Wheel Rollout",   muscles: ["core"], pattern: "core-anti-extension", equipment: "other",      unilateral: false },
  "bird-dog":          { name: "Bird Dog",           muscles: ["core"], pattern: "core-anti-extension", equipment: "bodyweight", unilateral: true },
  "side-plank":        { name: "Side Plank",         muscles: ["core"], pattern: "core-anti-lateral",   equipment: "bodyweight", unilateral: true, timeBased: true },
  "pallof":            { name: "Pallof Press",       muscles: ["core"], pattern: "core-anti-rotation",  equipment: "cable",      unilateral: true },
  "cable-woodchop":    { name: "Cable Woodchop",     muscles: ["core"], pattern: "core-anti-rotation",  equipment: "cable",      unilateral: true },
  "hanging-knee-raise":{ name: "Hanging Knee Raise", muscles: ["core","hip flexors"], pattern: "core-flexion", equipment: "bodyweight", unilateral: false },
  "cable-crunch":      { name: "Cable Crunch",       muscles: ["core"], pattern: "core-flexion",        equipment: "cable",      unilateral: false }
};

// Swaps are derived from the movement pattern, so adding an exercise above
// automatically makes it available as a swap for its pattern-mates.
function swapsFor(key) {
  const lib = getLibrary();
  const me = lib[key];
  if (!me) return [];
  return Object.keys(lib)
    .filter(k => k !== key && lib[k].pattern === me.pattern)
    .sort((a, b) => lib[a].name.localeCompare(lib[b].name));
}

// ------------------------------------------------------------------
// GOAL RULES
// ------------------------------------------------------------------
const BUILDER_GOALS = {
  strength:    { label: "Strength",          sets: [3,5], reps: [3,6],   restSec: 180, effort: "1-3 reps left in the tank", setScale: 1,   loadScale: 1 },
  hypertrophy: { label: "Hypertrophy",       sets: [3,4], reps: [6,12],  restSec: 90,  effort: "0-3 reps left in the tank", setScale: 1,   loadScale: 1 },
  endurance:   { label: "Muscular endurance",sets: [2,3], reps: [15,20], restSec: 45,  effort: "2-3 reps left in the tank", setScale: 1,   loadScale: 1 },
  short:       { label: "Short on time",     sets: [2,3], reps: [6,12],  restSec: 60,  effort: "1-3 reps left in the tank", setScale: 1,   loadScale: 1, superset: true },
  deload:      { label: "Deload / recovery", sets: [1,2], reps: [6,12],  restSec: 90,  effort: "4+ reps left in the tank",  setScale: 0.5, loadScale: 0.9 }
};

// Core & stability hides Strength and Hypertrophy: the whole template is
// anti-movement work, which isn't trained for 3-6 reps at 1 RIR.
const BUILDER_CATEGORIES = [
  { key: "upper",  label: "Upper body",       goals: ["strength","hypertrophy","endurance","short","deload"] },
  { key: "lower",  label: "Lower body",       goals: ["strength","hypertrophy","endurance","short","deload"] },
  { key: "full",   label: "Full body",        goals: ["strength","hypertrophy","endurance","short","deload"] },
  { key: "core",   label: "Core & stability", goals: ["endurance","short","deload"] },
  { key: "runner", label: "Runner support",   goals: ["strength","hypertrophy","endurance","short","deload"] }
];

// ------------------------------------------------------------------
// AUTHORED TEMPLATES
// Each entry: { key, sets, repLow, repHigh, restSec, unit? }
// Everything not authored here is derived by applying the goal rules
// to the category's hypertrophy/base template.
// ------------------------------------------------------------------
const WORKOUT_TEMPLATES_SEED = {
  "upper:hypertrophy": [
    { key: "bench-press",      sets: 4, repLow: 8,  repHigh: 10, restSec: 120 },
    { key: "cable-row",        sets: 4, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "incline-db",       sets: 3, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "lat-pulldown",     sets: 3, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "lateral-raise",    sets: 3, repLow: 12, repHigh: 15, restSec: 60 },
    { key: "triceps-pushdown", sets: 3, repLow: 12, repHigh: 15, restSec: 60 },
    { key: "db-curl",          sets: 3, repLow: 10, repHigh: 12, restSec: 60 }
  ],
  "upper:strength": [
    { key: "bench-press", sets: 5, repLow: 3,  repHigh: 5,  restSec: 210 },
    { key: "barbell-row", sets: 5, repLow: 3,  repHigh: 5,  restSec: 180 },
    { key: "ohp",         sets: 4, repLow: 4,  repHigh: 6,  restSec: 180 },
    { key: "wt-pullup",   sets: 4, repLow: 4,  repHigh: 6,  restSec: 180 },
    { key: "face-pull",   sets: 3, repLow: 12, repHigh: 15, restSec: 60 }
  ],
  "lower:hypertrophy": [
    { key: "back-squat",    sets: 4, repLow: 8,  repHigh: 10, restSec: 150 },
    { key: "rdl",           sets: 3, repLow: 8,  repHigh: 10, restSec: 120 },
    { key: "leg-press",     sets: 3, repLow: 10, repHigh: 15, restSec: 90 },
    { key: "leg-curl",      sets: 3, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "walking-lunge", sets: 3, repLow: 10, repHigh: 10, restSec: 90 },
    { key: "calf-raise",    sets: 4, repLow: 10, repHigh: 15, restSec: 60 }
  ],
  "lower:strength": [
    { key: "back-squat", sets: 5, repLow: 3, repHigh: 5,  restSec: 240 },
    { key: "deadlift",   sets: 3, repLow: 3, repHigh: 5,  restSec: 240 },
    { key: "bss",        sets: 3, repLow: 6, repHigh: 8,  restSec: 120 },
    { key: "leg-curl",   sets: 3, repLow: 8, repHigh: 10, restSec: 90 },
    { key: "calf-raise", sets: 3, repLow: 8, repHigh: 12, restSec: 60 }
  ],
  "full:hypertrophy": [
    { key: "goblet-squat",      sets: 3, repLow: 8,  repHigh: 12, restSec: 120 },
    { key: "db-bench",          sets: 3, repLow: 8,  repHigh: 12, restSec: 120 },
    { key: "rdl",               sets: 3, repLow: 8,  repHigh: 10, restSec: 120 },
    { key: "lat-pulldown",      sets: 3, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "db-shoulder-press", sets: 3, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "plank",             sets: 3, repLow: 30, repHigh: 45, restSec: 60, unit: "seconds" }
  ],
  "full:strength": [
    { key: "back-squat",  sets: 4, repLow: 4, repHigh: 6,  restSec: 210 },
    { key: "bench-press", sets: 4, repLow: 4, repHigh: 6,  restSec: 210 },
    { key: "barbell-row", sets: 4, repLow: 4, repHigh: 6,  restSec: 180 },
    { key: "rdl",         sets: 3, repLow: 5, repHigh: 6,  restSec: 150 },
    { key: "plank",       sets: 3, repLow: 45, repHigh: 45, restSec: 60, unit: "seconds" }
  ],
  "runner:hypertrophy": [
    { key: "sl-rdl",              sets: 3, repLow: 8,  repHigh: 10, restSec: 90 },
    { key: "step-up",             sets: 3, repLow: 8,  repHigh: 10, restSec: 90 },
    { key: "sl-calf-raise",       sets: 3, repLow: 12, repHigh: 15, restSec: 60 },
    { key: "copenhagen-plank",    sets: 3, repLow: 20, repHigh: 30, restSec: 60, unit: "seconds" },
    { key: "banded-lateral-walk", sets: 3, repLow: 12, repHigh: 12, restSec: 45 },
    { key: "tibialis-raise",      sets: 3, repLow: 15, repHigh: 20, restSec: 45 }
  ],
  "runner:strength": [
    { key: "sl-rdl",           sets: 4, repLow: 6,  repHigh: 6,  restSec: 150 },
    { key: "step-up",          sets: 4, repLow: 6,  repHigh: 6,  restSec: 150 },
    { key: "sl-calf-raise",    sets: 3, repLow: 10, repHigh: 12, restSec: 90 },
    { key: "copenhagen-plank", sets: 3, repLow: 20, repHigh: 30, restSec: 60, unit: "seconds" },
    { key: "tibialis-raise",   sets: 3, repLow: 15, repHigh: 15, restSec: 45 }
  ],
  "core:endurance": [
    { key: "dead-bug",           sets: 3, repLow: 8,  repHigh: 10, restSec: 45 },
    { key: "pallof",             sets: 3, repLow: 10, repHigh: 12, restSec: 45 },
    { key: "side-plank",         sets: 3, repLow: 30, repHigh: 30, restSec: 45, unit: "seconds" },
    { key: "cable-woodchop",     sets: 3, repLow: 10, repHigh: 12, restSec: 45 },
    { key: "hanging-knee-raise", sets: 3, repLow: 10, repHigh: 12, restSec: 45 }
  ]
};

// Which authored template each category derives its other goals from
const TEMPLATE_BASE = { upper: "hypertrophy", lower: "hypertrophy", full: "hypertrophy",
                        runner: "hypertrophy", core: "endurance" };

// Time- and distance-based items never take a rep range: a "strength" plank
// at 3-6 reps is meaningless. Only their duration/distance scales.
function isMeasuredExercise(key) {
  const ex = getLibrary()[key];
  return !!(ex && (ex.timeBased || ex.distanceBased));
}

function deriveTemplate(baseRows, goal) {
  const g = BUILDER_GOALS[goal];
  if (!g) return baseRows.slice();
  return baseRows.map(r => {
    const row = Object.assign({}, r);
    row.sets = Math.max(1, Math.round(r.sets * g.setScale));
    if (goal === "strength") row.sets = Math.min(5, Math.max(3, r.sets));
    row.restSec = g.restSec;
    if (isMeasuredExercise(r.key) || r.unit === "seconds") {
      // Holds and carries keep their own units; only volume moves.
      if (goal === "endurance") { row.repLow = Math.round(r.repLow * 1.3); row.repHigh = Math.round(r.repHigh * 1.3); }
      if (goal === "deload")    { row.repLow = Math.round(r.repLow * 0.7); row.repHigh = Math.round(r.repHigh * 0.7); }
      return row;
    }
    row.repLow  = g.reps[0];
    row.repHigh = g.reps[1];
    return row;
  });
}

function templateRowsFor(category, goal) {
  const exact = WORKOUT_TEMPLATES_SEED[category + ":" + goal];
  if (exact) return exact.map(r => Object.assign({}, r));
  const base = WORKOUT_TEMPLATES_SEED[category + ":" + TEMPLATE_BASE[category]];
  if (!base) return [];
  return deriveTemplate(base, goal);
}

// ------------------------------------------------------------------
// LIBRARY + TEMPLATE STORAGE
// ------------------------------------------------------------------
function getLibrary() {
  const data = loadData();
  if (!data.exerciseLibrary) data.exerciseLibrary = {};
  return Object.assign({}, EXERCISE_LIBRARY_SEED, data.exerciseLibrary);
}

function getExercise(key) {
  return getLibrary()[key] || { name: key, muscles: [], pattern: "other", equipment: "other", unilateral: false };
}

function exerciseName(key) { return getExercise(key).name; }

function addCustomExercise(name) {
  const data = loadData();
  const clean = (name || "").trim();
  if (!clean) return null;
  const key = "custom-" + clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!data.exerciseLibrary) data.exerciseLibrary = {};
  if (!getLibrary()[key]) {
    data.exerciseLibrary[key] = {
      name: clean, muscles: [], pattern: "other",
      equipment: "other", unilateral: false, custom: true
    };
    saveData();
  }
  return key;
}

function getUserTemplates(category) {
  const data = loadData();
  const all = data.workoutTemplates || [];
  return category ? all.filter(t => t.category === category) : all;
}

function saveUserTemplate(name, category, goal, exercises) {
  const data = loadData();
  if (!data.workoutTemplates) data.workoutTemplates = [];
  const t = {
    id: "tpl-" + uid(), name: (name || "Untitled").trim(),
    category, goal, createdAt: Date.now(),
    exercises: exercises.map(e => ({
      key: e.key, sets: e.sets, repLow: e.repLow, repHigh: e.repHigh,
      restSec: e.restSec, unit: e.unit || null
    }))
  };
  data.workoutTemplates.push(t);
  saveData();
  return t;
}

function deleteUserTemplate(id) {
  const data = loadData();
  data.workoutTemplates = (data.workoutTemplates || []).filter(t => t.id !== id);
  saveData();
}

// ------------------------------------------------------------------
// HISTORY / ESTIMATED 1RM / PERSONAL BESTS
// Scans programmed sessions AND builder sessions so history is unified.
// ------------------------------------------------------------------
function epley1RM(weightKg, reps) {
  if (!weightKg || !reps) return null;
  return weightKg * (1 + reps / 30);
}

function exerciseHistory(exerciseKey, maxDays = 400) {
  const data = loadData();
  const todayIso = todayISO();
  const out = [];
  for (const iso of Object.keys(data.days).sort().reverse()) {
    if (daysBetween(iso, todayIso) > maxDays) break;
    const day = data.days[iso];
    const found = [];
    for (const sid in (day.sessions || {})) {
      const s = day.sessions[sid];
      if (s.exercises && s.exercises[exerciseKey]) found.push({ src: sid, ex: s.exercises[exerciseKey] });
    }
    for (const es of (day.extraSessions || [])) {
      if (es.exercises && es.exercises[exerciseKey]) found.push({ src: es.id, ex: es.exercises[exerciseKey] });
    }
    for (const f of found) {
      const sets = (f.ex.setsLogged || []).filter(s => s && s.reps);
      if (!sets.length) continue;
      let best = null;
      for (const st of sets) {
        const e1 = epley1RM(st.weightKg, st.reps);
        if (e1 != null && (!best || e1 > best.e1rm)) best = { weightKg: st.weightKg, reps: st.reps, e1rm: e1 };
      }
      out.push({ iso, source: f.src, sets, best });
    }
  }
  return out;  // newest first
}

function lastUsedFor(exerciseKey) {
  const h = exerciseHistory(exerciseKey);
  if (!h.length) return null;
  const sets = h[0].sets.filter(s => s.weightKg != null);
  if (!sets.length) return { iso: h[0].iso, weightKg: null, reps: h[0].sets[0].reps };
  const top = sets.reduce((a, b) => (b.weightKg > a.weightKg ? b : a));
  return { iso: h[0].iso, weightKg: top.weightKg, reps: top.reps };
}

function bestE1RM(exerciseKey, excludeIso) {
  let best = null;
  for (const h of exerciseHistory(exerciseKey)) {
    if (excludeIso && h.iso === excludeIso) continue;
    if (h.best && (!best || h.best.e1rm > best.e1rm)) best = Object.assign({ iso: h.iso }, h.best);
  }
  return best;
}

// ------------------------------------------------------------------
// PROGRESSION HINT  (advisory only - never mutates the user's numbers)
// ------------------------------------------------------------------
function progressionNote(exerciseKey, repLow, repHigh) {
  if (isMeasuredExercise(exerciseKey)) return null;
  const h = exerciseHistory(exerciseKey);
  if (!h.length) return null;
  const ex = getExercise(exerciseKey);

  const hitTop = entry => {
    const s = entry.sets.filter(x => x.reps != null);
    return s.length > 0 && s.every(x => x.reps >= repHigh);
  };
  const missedBottom = entry => {
    const s = entry.sets.filter(x => x.reps != null);
    return s.length > 0 && s.some(x => x.reps < repLow);
  };

  if (hitTop(h[0])) {
    const isLower = ["quads","glutes","hamstrings","calves"].some(m => (ex.muscles || []).includes(m));
    const isIsolation = /isolation|delt|chest-isolation|arm-superset/.test(ex.pattern) || ex.equipment === "dumbbell";
    const inc = isIsolation ? 2 : (isLower ? 5 : 2.5);
    return { kind: "up", text: `Hit the top of the range last time — try +${inc}kg` };
  }
  if (h.length >= 2 && missedBottom(h[0]) && missedBottom(h[1])) {
    return { kind: "down", text: "Missed the bottom of the range twice — hold, or drop 5-10%" };
  }
  return null;
}

// ------------------------------------------------------------------
// WEEKLY HARD SETS PER MUSCLE GROUP
// ------------------------------------------------------------------
function weeklyHardSets(weekOffset) {
  const data = loadData();
  const mon = addDays(mondayOf(todayISO()), (weekOffset || 0) * 7);
  const tally = {};
  for (let i = 0; i < 7; i++) {
    const iso = addDays(mon, i);
    const day = data.days[iso];
    if (!day) continue;
    const buckets = [];
    for (const sid in (day.sessions || {})) {
      const s = day.sessions[sid];
      for (const k in (s.exercises || {})) buckets.push([k, s.exercises[k]]);
    }
    for (const es of (day.extraSessions || [])) {
      for (const k in (es.exercises || {})) buckets.push([k, es.exercises[k]]);
    }
    for (const [key, log] of buckets) {
      const done = (log.setsLogged || []).filter(s => s && s.completed).length;
      if (!done) continue;
      const muscles = getExercise(key).muscles || [];
      const primary = muscles.length ? [muscles[0]] : ["other"];
      for (const m of primary) tally[m] = (tally[m] || 0) + done;
    }
  }
  return tally;
}

// ------------------------------------------------------------------
// DRAFT / RESUME
// ------------------------------------------------------------------
function getDraft() { return loadData().builderDraft || null; }

function saveDraft(patch) {
  const data = loadData();
  data.builderDraft = Object.assign({}, data.builderDraft || {}, patch);
  saveData();
}

function clearDraft() {
  const data = loadData();
  data.builderDraft = null;
  saveData();
}

// ------------------------------------------------------------------
// TIMERS
// ------------------------------------------------------------------
let _wkTimerId = null, _restTimerId = null, _restEndsAt = 0;

function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}

function startWorkoutTimer() {
  stopWorkoutTimer();
  _wkTimerId = setInterval(() => {
    const d = getDraft();
    if (!d || !d.startedAt) return;
    const el = document.getElementById("wk-timer");
    if (el) el.textContent = fmtClock((Date.now() - d.startedAt) / 1000);
  }, 1000);
}
function stopWorkoutTimer() { if (_wkTimerId) clearInterval(_wkTimerId); _wkTimerId = null; }

function startRestTimer(seconds) {
  stopRestTimer();
  _restEndsAt = Date.now() + seconds * 1000;
  const bar = document.getElementById("rest-bar");
  if (bar) bar.hidden = false;
  const tick = () => {
    const left = (_restEndsAt - Date.now()) / 1000;
    const lbl = document.getElementById("rest-left");
    if (lbl) lbl.textContent = fmtClock(left);
    if (left <= 0) {
      stopRestTimer();
      // No haptics - navigator.vibrate is not implemented in iOS Safari.
      // Audio + the green flash are the end-of-rest cues.
      beepHigh();
      const b = document.getElementById("rest-bar");
      if (b) { b.classList.add("done"); setTimeout(() => { b.hidden = true; b.classList.remove("done"); }, 2500); }
    }
  };
  tick();
  _restTimerId = setInterval(tick, 250);
}
function stopRestTimer() { if (_restTimerId) clearInterval(_restTimerId); _restTimerId = null; }

// A re-render replaces #rest-bar with a fresh hidden one, so any live rest
// has to be reinstated or the countdown runs invisibly.
function syncRestBar() {
  const bar = document.getElementById("rest-bar");
  if (!bar) return;
  const left = (_restEndsAt - Date.now()) / 1000;
  if (_restTimerId && left > 0) {
    bar.hidden = false;
    const lbl = document.getElementById("rest-left");
    if (lbl) lbl.textContent = fmtClock(left);
  }
}

// ------------------------------------------------------------------
// BUILDER STATE + SHELL
// ------------------------------------------------------------------
let builderState = { open: false, step: "menu", iso: null, category: null, goal: null, exercises: [] };

function plannedLiftFor(iso) {
  const rx = getPrescriptionForDate(iso, loadData().meta);
  const lift = (rx.sessions || []).find(s => s.type === "lift");
  if (!lift) return null;
  const cat = /lower/.test(lift.key) ? "lower" : "upper";
  return { sessionId: lift.id, name: lift.name, category: cat };
}

function openBuilder(iso, step) {
  builderState = { open: true, step: step || "menu", iso: iso, category: null, goal: null, exercises: [] };
  renderBuilder();
}

function closeBuilder(opts) {
  builderState.open = false;
  stopWorkoutTimer(); stopRestTimer();
  document.getElementById("builder-root").innerHTML = "";
  document.body.style.overflow = "";
  if (!opts || !opts.keepDraft) { /* draft intentionally preserved unless finished */ }
  render();
}

function builderGo(step) { builderState.step = step; renderBuilder(); }

function renderBuilder() {
  const root = document.getElementById("builder-root");
  if (!builderState.open) { root.innerHTML = ""; document.body.style.overflow = ""; return; }
  document.body.style.overflow = "hidden";
  const s = builderState.step;
  const body =
      s === "menu"     ? builderMenuHtml()
    : s === "category" ? builderCategoryHtml()
    : s === "goal"     ? builderGoalHtml()
    : s === "review"   ? builderReviewHtml()
    : s === "live"     ? builderLiveHtml()
    : s === "finish"   ? builderFinishHtml()
    : s === "edit"     ? builderEditHtml()
    : "";
  const titles = { menu: "Gym session", category: "Choose a category", goal: "Choose a goal",
                   review: "Your workout", live: "Workout", finish: "Finish workout",
                   edit: "Edit workout" };
  // edit has no parent step - its back button closes the builder
  const backTo = { category: "menu", goal: "category", review: "goal", finish: "live" };

  root.innerHTML = `
    <div class="builder-overlay">
      <header class="builder-head">
        <button class="bld-back" data-bld="back">${s === "menu" ? "✕" : "‹"}</button>
        <div class="bld-title">${titles[s] || ""}</div>
        ${s === "live" ? `<div class="bld-timer" id="wk-timer">0:00</div>` : `<div style="width:38px"></div>`}
      </header>
      <div class="builder-body">${body}</div>
      ${s === "live" ? `
        <div class="rest-bar" id="rest-bar" hidden>
          <span>Rest</span><strong id="rest-left">0:00</strong>
          <button data-bld="skip-rest">Skip</button>
        </div>` : ""}
    </div>
  `;
  wireBuilder(backTo[s]);
  if (s === "live") { startWorkoutTimer(); syncRestBar(); }
}

// ------------------------------------------------------------------
// SCREENS
// ------------------------------------------------------------------
function builderMenuHtml() {
  const planned = plannedLiftFor(builderState.iso);
  const draft = getDraft();
  const lastWk = lastCompletedWorkout();
  return `
    ${draft && draft.exercises ? `
      <div class="bld-resume">
        <div><strong>Workout in progress</strong><div class="dim">${escapeHtml(draft.category || "")} · started ${formatPrettyDate(draft.iso)}</div></div>
        <div class="bld-resume-btns">
          <button class="btn primary" data-bld="resume">Resume</button>
          <button class="btn danger" data-bld="discard">Discard</button>
        </div>
      </div>` : ""}
    ${planned ? `<div class="bld-planned">Today's program: <strong>${escapeHtml(planned.name)}</strong> — saving will mark it complete.</div>` : ""}
    <button class="bld-choice" data-bld="go-category">
      <div class="bc-title">Suggested workout</div>
      <div class="bc-sub">Pick a category and goal, get a full session you can edit</div>
    </button>
    <button class="bld-choice" data-bld="go-manual">
      <div class="bc-title">Build my own</div>
      <div class="bc-sub">Choose exercises yourself, or add a custom one</div>
    </button>
    ${lastWk ? `
      <button class="bld-choice" data-bld="repeat-last">
        <div class="bc-title">Repeat last workout</div>
        <div class="bc-sub">${escapeHtml(lastWk.name || "Workout")} · ${formatPrettyDate(lastWk.iso)}</div>
      </button>` : ""}
    <button class="bld-choice" data-bld="quick-log">
      <div class="bc-title">Quick log</div>
      <div class="bc-sub">Just a name, duration and comments</div>
    </button>
  `;
}

function builderCategoryHtml() {
  const planned = plannedLiftFor(builderState.iso);
  return `
    ${planned ? `<div class="bld-planned">Preselected from today's program: <strong>${escapeHtml(planned.name)}</strong></div>` : ""}
    <div class="bld-tiles">
      ${BUILDER_CATEGORIES.map(c => `
        <button class="bld-tile ${planned && planned.category === c.key ? "suggested" : ""}" data-bld="pick-cat" data-cat="${c.key}">
          ${c.label}${planned && planned.category === c.key ? `<span class="tile-flag">programmed today</span>` : ""}
        </button>`).join("")}
    </div>
  `;
}

function builderGoalHtml() {
  const cat = BUILDER_CATEGORIES.find(c => c.key === builderState.category);
  const mine = getUserTemplates(builderState.category);
  return `
    ${mine.length ? `
      <div class="bld-section-label">My templates</div>
      ${mine.map(t => `
        <button class="bld-choice" data-bld="use-template" data-tpl="${t.id}">
          <div class="bc-title">${escapeHtml(t.name)}</div>
          <div class="bc-sub">${t.exercises.length} exercises · saved ${formatPrettyDate(isoDate(new Date(t.createdAt)))}</div>
        </button>`).join("")}
      <div class="bld-section-label">Goals</div>` : ""}
    ${cat.goals.map(g => {
      const G = BUILDER_GOALS[g];
      return `
        <button class="bld-choice" data-bld="pick-goal" data-goal="${g}">
          <div class="bc-title">${G.label}</div>
          <div class="bc-sub">${G.sets[0]}-${G.sets[1]} sets · ${G.reps[0]}-${G.reps[1]} reps · ${fmtClock(G.restSec)} rest · ${G.effort}</div>
        </button>`;
    }).join("")}
    ${builderState.category === "core" ? `
      <p class="bld-note">Strength and hypertrophy are hidden here on purpose — this category is anti-movement work
      (dead bug, Pallof, side plank), which isn't trained for 3-6 reps near failure.</p>` : ""}
  `;
}

function builderReviewHtml() {
  const rows = builderState.exercises;
  const G = BUILDER_GOALS[builderState.goal] || BUILDER_GOALS.hypertrophy;
  return `
    <div class="bld-meta">${G.label} · ${G.effort}</div>
    <div class="bld-list">
      ${rows.map((r, i) => {
        const last = lastUsedFor(r.key);
        const prog = progressionNote(r.key, r.repLow, r.repHigh);
        const unitTxt = r.unit === "seconds" ? "s" : "";
        return `
          <div class="bld-row" data-idx="${i}">
            <div class="br-main">
              <div class="br-name">${escapeHtml(exerciseName(r.key))}${getExercise(r.key).unilateral ? `<span class="br-side">each side</span>` : ""}</div>
              <div class="br-spec">${r.sets} × ${r.repLow === r.repHigh ? r.repLow : r.repLow + "-" + r.repHigh}${unitTxt} · rest ${fmtClock(r.restSec)}</div>
              <div class="br-last">${last && last.weightKg != null ? `Last: ${last.weightKg}kg × ${last.reps} (${formatPrettyDate(last.iso)})` : "No history yet"}</div>
              ${prog ? `<div class="br-prog ${prog.kind}">${prog.text}</div>` : ""}
            </div>
            <div class="br-actions">
              <button data-bld="swap" data-idx="${i}" title="Swap">⇄</button>
              <button data-bld="edit" data-idx="${i}" title="Edit">✎</button>
              <button data-bld="up"   data-idx="${i}" title="Move up">↑</button>
              <button data-bld="rm"   data-idx="${i}" title="Remove">✕</button>
            </div>
          </div>`;
      }).join("")}
    </div>
    <div class="bld-actions">
      <button class="btn" data-bld="add-ex">+ Add exercise</button>
      <button class="btn" data-bld="save-tpl">Save as my template</button>
    </div>
    <button class="btn primary bld-start" data-bld="start">Start workout</button>
  `;
}

function liveExerciseListHtml(editable) {
  const rows = builderState.exercises;
  return `
    <div class="bld-list live">
      ${rows.map((r, i) => {
        const ex = getExercise(r.key);
        const unitLbl = r.unit === "seconds" ? "Sec" : (ex.distanceBased ? "Metres" : "Reps");
        const loadLbl = (ex.equipment === "bodyweight" || r.unit === "seconds") ? "+kg" : "kg";
        const last = lastUsedFor(r.key);
        return `
          <div class="live-ex ${r.skipped ? "skipped" : ""}" data-idx="${i}">
            <div class="live-head">
              <div>
                <div class="br-name">${escapeHtml(ex.name)}${ex.unilateral ? `<span class="br-side">each side</span>` : ""}</div>
                <div class="br-spec">target ${r.repLow === r.repHigh ? r.repLow : r.repLow + "-" + r.repHigh}${r.unit === "seconds" ? "s" : ""}${editable ? "" : " · rest " + fmtClock(r.restSec)}</div>
              </div>
              ${editable
                ? `<button class="live-skip" data-bld="remove-ex" data-idx="${i}">Remove</button>`
                : `<button class="live-skip" data-bld="skip-ex" data-idx="${i}">${r.skipped ? "Unskip" : "Skip"}</button>`}
            </div>
            <div class="set-row header ${editable ? "editable" : ""}"><span>#</span><span>${unitLbl}</span><span>${loadLbl}</span><span></span>${editable ? "<span></span>" : ""}</div>
            ${(r.setsLogged || []).map((st, si) => `
              <div class="set-row ${editable ? "editable" : ""}" data-idx="${i}" data-si="${si}">
                <div class="set-num">${si + 1}</div>
                <input type="number" inputmode="numeric" step="1" min="0" max="999"
                       data-bld-field="reps" data-idx="${i}" data-si="${si}"
                       value="${st.reps != null ? st.reps : ""}" placeholder="${r.repHigh}">
                <input type="number" inputmode="decimal" step="0.5" min="0" max="500"
                       data-bld-field="weightKg" data-idx="${i}" data-si="${si}"
                       value="${st.weightKg != null ? st.weightKg : ""}" placeholder="${last && last.weightKg != null ? last.weightKg : "—"}">
                <div class="set-check ${st.completed ? "on" : ""}" data-bld="tick" data-idx="${i}" data-si="${si}">${st.completed ? "✓" : ""}</div>
                ${editable ? `<button class="set-del" data-bld="del-set" data-idx="${i}" data-si="${si}">✕</button>` : ""}
              </div>`).join("")}
            <button class="live-addset" data-bld="add-set" data-idx="${i}">+ Add set</button>
          </div>`;
      }).join("")}
    </div>`;
}

function builderLiveHtml() {
  return liveExerciseListHtml(false) +
    `<button class="btn primary bld-start" data-bld="to-finish">Finish workout</button>`;
}

function builderEditHtml() {
  const m = builderState.meta || {};
  return `
    <div class="bld-meta">Editing a saved workout — changes flow through to history, PBs and weekly volume.</div>
    ${liveExerciseListHtml(true)}
    <button class="btn" data-bld="add-ex" style="width:100%;margin-top:10px;">+ Add exercise</button>
    <div class="form-row" style="margin-top:18px;">
      <label>Session name</label>
      <input type="text" id="bld-name" value="${escapeHtml(m.name || "")}" autocomplete="off">
    </div>
    <div class="form-row"><label>Duration (min)</label>
      <input type="number" inputmode="numeric" id="bld-dur" value="${m.durationMin != null ? m.durationMin : ""}"></div>
    <div class="form-row"><label>Session effort (1-10)</label>
      <input type="number" inputmode="numeric" min="1" max="10" id="bld-effort" value="${m.effortRating != null ? m.effortRating : ""}" placeholder="optional"></div>
    <div class="form-row"><label>Comments</label>
      <input type="text" id="bld-notes" value="${escapeHtml(m.notes || "")}" autocomplete="off"></div>
    <div class="bld-actions">
      <button class="btn danger" data-bld="delete-workout">Delete workout</button>
      <button class="btn primary" data-bld="save-edit">Save changes</button>
    </div>`;
}

// Load a saved builder workout back into the builder for editing.
function openBuilderEditor(iso, extraId) {
  const es = getExtraSessions(iso).find(e => e.id === extraId);
  if (!es) return;
  builderState = {
    open: true, step: "edit", iso: iso,
    category: es.category || null, goal: es.goal || null,
    editingId: extraId,
    meta: { name: es.name, durationMin: es.durationMin,
            effortRating: es.effortRating, notes: es.notes },
    exercises: Object.keys(es.exercises || {}).map(k => {
      const logged = (es.exercises[k].setsLogged || []).map(x => Object.assign({}, x));
      return {
        key: k, sets: logged.length || 1,
        repLow: 8, repHigh: 12, restSec: 90,
        unit: getExercise(k).timeBased ? "seconds" : null,
        setsLogged: logged.length ? logged : [{}]
      };
    })
  };
  renderBuilder();
}

function saveBuilderEdit() {
  const root = document.getElementById("builder-root");
  const iso = builderState.iso, id = builderState.editingId;
  const name  = root.querySelector("#bld-name").value.trim();
  const dur   = parseInt(root.querySelector("#bld-dur").value, 10);
  const eff   = parseInt(root.querySelector("#bld-effort").value, 10);
  const notes = root.querySelector("#bld-notes").value.trim();

  const exercises = {};
  let any = false;
  for (const r of builderState.exercises) {
    const sets = (r.setsLogged || []).filter(x => x && (x.reps != null || x.weightKg != null));
    if (!sets.length) continue;
    any = true;
    exercises[r.key] = {
      setsLogged: sets.map(x => ({ reps: x.reps != null ? x.reps : null,
                                   weightKg: x.weightKg != null ? x.weightKg : null,
                                   completed: !!x.completed, note: x.note || "" })),
      completed: sets.every(x => x.completed),
      notes: ""
    };
  }
  if (!any) { showToast("Keep at least one logged set, or delete the workout"); return; }

  updateExtraSession(iso, id, {
    name: name || "Gym session",
    durationMin: Number.isFinite(dur) ? dur : null,
    effortRating: Number.isFinite(eff) ? eff : null,
    notes: notes, exercises: exercises
  });
  closeBuilder();
  showToast("Workout updated");
}

function deleteBuilderWorkout() {
  const iso = builderState.iso, id = builderState.editingId;
  const es = getExtraSessions(iso).find(e => e.id === id);
  if (!confirm("Delete this workout and all its logged sets?")) return;
  // If this workout is what marked a programmed session complete, untick it
  // again so adherence doesn't stay inflated.
  if (es && es.linkedSessionId) {
    const sl = getSessionLog(iso, es.linkedSessionId);
    sl.completed = false;
    saveData();
  }
  deleteExtraSession(iso, id);
  closeBuilder();
  showToast("Workout deleted");
}

function builderFinishHtml() {
  const d = getDraft();
  const mins = d && d.startedAt ? Math.round((Date.now() - d.startedAt) / 60000) : "";
  const done = builderState.exercises.reduce((n, r) =>
    n + (r.setsLogged || []).filter(s => s.completed).length, 0);
  return `
    <div class="bld-summary">${done} sets completed across ${builderState.exercises.filter(r => !r.skipped).length} exercises</div>
    <div class="form-row">
      <label>Session name</label>
      <input type="text" id="bld-name" value="${escapeHtml(defaultWorkoutName())}" autocomplete="off">
    </div>
    <div class="form-row">
      <label>Duration (min)</label>
      <input type="number" inputmode="numeric" id="bld-dur" value="${mins}">
    </div>
    <div class="form-row">
      <label>Session effort (1-10)</label>
      <input type="number" inputmode="numeric" min="1" max="10" id="bld-effort" placeholder="optional">
    </div>
    <div class="form-row">
      <label>Comments</label>
      <input type="text" id="bld-notes" placeholder="how did it feel?" autocomplete="off">
    </div>
    <button class="btn primary bld-start" data-bld="save-workout">Save workout</button>
  `;
}

function defaultWorkoutName() {
  const c = BUILDER_CATEGORIES.find(x => x.key === builderState.category);
  const g = BUILDER_GOALS[builderState.goal];
  if (c && g) return c.label + " — " + g.label;
  return "Gym session";
}

function lastCompletedWorkout() {
  const data = loadData();
  for (const iso of Object.keys(data.days).sort().reverse()) {
    for (const es of (data.days[iso].extraSessions || [])) {
      if (es.builder && es.exercises) return { iso, name: es.name, session: es };
    }
  }
  return null;
}

// ------------------------------------------------------------------
// WIRING
// ------------------------------------------------------------------
function wireBuilder(backStep) {
  const root = document.getElementById("builder-root");
  const on = (sel, fn) => root.querySelectorAll(sel).forEach(el => el.addEventListener("click", fn));

  root.querySelector('[data-bld="back"]').addEventListener("click", () => {
    if (!backStep) { closeBuilder(); return; }
    builderGo(backStep);
  });

  on('[data-bld="go-category"]', () => {
    const planned = plannedLiftFor(builderState.iso);
    if (planned) builderState.category = planned.category;
    builderGo("category");
  });
  on('[data-bld="quick-log"]',  () => { closeBuilder(); openExtraModal(builderState.iso, null, "gym"); });
  on('[data-bld="go-manual"]',  () => { builderState.category = "full"; builderState.goal = "hypertrophy";
                                        builderState.exercises = []; builderGo("review"); });
  on('[data-bld="repeat-last"]', () => {
    const last = lastCompletedWorkout();
    if (!last) return;
    builderState.category = last.session.category || "full";
    builderState.goal = last.session.goal || "hypertrophy";
    builderState.exercises = Object.keys(last.session.exercises).map(k => {
      const prev = last.session.exercises[k];
      const n = (prev.setsLogged || []).length || 3;
      return { key: k, sets: n, repLow: 8, repHigh: 12, restSec: 90 };
    });
    builderGo("review");
  });
  on('[data-bld="resume"]', () => {
    primeAudio();
    const d = getDraft();
    builderState.category = d.category; builderState.goal = d.goal;
    builderState.exercises = d.exercises || [];
    builderState.iso = d.iso || builderState.iso;
    builderGo("live");
  });
  on('[data-bld="discard"]', () => {
    if (confirm("Discard the workout in progress?")) { clearDraft(); renderBuilder(); }
  });

  on('[data-bld="pick-cat"]', e => {
    builderState.category = e.currentTarget.dataset.cat;
    builderGo("goal");
  });
  on('[data-bld="pick-goal"]', e => {
    builderState.goal = e.currentTarget.dataset.goal;
    builderState.exercises = templateRowsFor(builderState.category, builderState.goal);
    builderGo("review");
  });
  on('[data-bld="use-template"]', e => {
    const t = getUserTemplates().find(x => x.id === e.currentTarget.dataset.tpl);
    if (!t) return;
    builderState.goal = t.goal;
    builderState.exercises = t.exercises.map(r => Object.assign({}, r));
    builderGo("review");
  });

  on('[data-bld="swap"]', e => openSwapPicker(+e.currentTarget.dataset.idx));
  on('[data-bld="edit"]', e => openRowEditor(+e.currentTarget.dataset.idx));
  on('[data-bld="up"]',   e => {
    const i = +e.currentTarget.dataset.idx;
    if (i > 0) { const a = builderState.exercises;
      [a[i - 1], a[i]] = [a[i], a[i - 1]]; renderBuilder(); }
  });
  on('[data-bld="rm"]', e => {
    builderState.exercises.splice(+e.currentTarget.dataset.idx, 1); renderBuilder();
  });
  on('[data-bld="add-ex"]',  () => openExercisePicker());
  on('[data-bld="save-tpl"]', () => openSaveTemplate());

  on('[data-bld="start"]', () => {
    if (!builderState.exercises.length) { showToast("Add at least one exercise"); return; }
    primeAudio();   // must happen inside the tap or the rest beep stays silent on iOS
    builderState.exercises.forEach(r => {
      if (!r.setsLogged) r.setsLogged = Array.from({ length: r.sets }, () => ({}));
    });
    saveDraft({ iso: builderState.iso, startedAt: Date.now(), category: builderState.category,
                goal: builderState.goal, exercises: builderState.exercises });
    builderGo("live");
  });

  on('[data-bld="tick"]', e => {
    const i = +e.currentTarget.dataset.idx, si = +e.currentTarget.dataset.si;
    const row = builderState.exercises[i];
    const st = row.setsLogged[si];
    st.completed = !st.completed;
    persistDraft();
    renderBuilder();
    if (st.completed && !builderState.editingId) startRestTimer(row.restSec || 90);
  });
  on('[data-bld="add-set"]', e => {
    const i = +e.currentTarget.dataset.idx;
    builderState.exercises[i].setsLogged.push({});
    persistDraft(); renderBuilder();
  });
  on('[data-bld="skip-ex"]', e => {
    const i = +e.currentTarget.dataset.idx;
    builderState.exercises[i].skipped = !builderState.exercises[i].skipped;
    persistDraft(); renderBuilder();
  });
  on('[data-bld="skip-rest"]', () => stopRestTimer());
  on('[data-bld="remove-ex"]', e => {
    builderState.exercises.splice(+e.currentTarget.dataset.idx, 1);
    renderBuilder();
  });
  on('[data-bld="del-set"]', e => {
    const i = +e.currentTarget.dataset.idx, si = +e.currentTarget.dataset.si;
    builderState.exercises[i].setsLogged.splice(si, 1);
    if (!builderState.exercises[i].setsLogged.length) builderState.exercises[i].setsLogged.push({});
    persistDraft(); renderBuilder();
  });
  on('[data-bld="save-edit"]', () => saveBuilderEdit());
  on('[data-bld="delete-workout"]', () => deleteBuilderWorkout());
  on('[data-bld="to-finish"]', () => builderGo("finish"));
  on('[data-bld="save-workout"]', () => saveBuilderWorkout());

  root.querySelectorAll('[data-bld-field]').forEach(inp => {
    inp.addEventListener("change", () => {
      const i = +inp.dataset.idx, si = +inp.dataset.si, f = inp.dataset.bldField;
      const v = inp.value === "" ? null : parseFloat(inp.value);
      builderState.exercises[i].setsLogged[si][f] = Number.isFinite(v) ? v : null;
      persistDraft();
    });
  });
}

function persistDraft() {
  // Editing a saved workout is not an in-progress session - no resume draft
  if (builderState.editingId) return;
  saveDraft({ iso: builderState.iso, category: builderState.category,
              goal: builderState.goal, exercises: builderState.exercises });
}

// ------------------------------------------------------------------
// SUB-MODALS
// ------------------------------------------------------------------
function openSwapPicker(idx) {
  const row = builderState.exercises[idx];
  const opts = swapsFor(row.key);
  const html = opts.length
    ? `<div class="bld-list">${opts.map(k => `
        <button class="bld-choice" data-swap="${k}">
          <div class="bc-title">${escapeHtml(exerciseName(k))}</div>
          <div class="bc-sub">${getExercise(k).equipment} · ${(getExercise(k).muscles || []).join(", ")}</div>
        </button>`).join("")}</div>`
    : `<p class="muted">No same-pattern alternatives in the library yet.</p>`;
  openModal("Swap " + exerciseName(row.key), html, root => {
    root.querySelectorAll("[data-swap]").forEach(b => b.addEventListener("click", () => {
      row.key = b.dataset.swap;
      if (isMeasuredExercise(row.key) && !row.unit) row.unit = "seconds";
      closeModal(); renderBuilder();
    }));
  });
}

function openRowEditor(idx) {
  const r = builderState.exercises[idx];
  const html = `
    <div class="macro-input-grid">
      <div class="field"><label>Sets</label><input type="number" inputmode="numeric" id="ed-sets" value="${r.sets}"></div>
      <div class="field"><label>Rep low</label><input type="number" inputmode="numeric" id="ed-lo" value="${r.repLow}"></div>
      <div class="field"><label>Rep high</label><input type="number" inputmode="numeric" id="ed-hi" value="${r.repHigh}"></div>
    </div>
    <div class="form-row"><label>Rest (seconds)</label>
      <input type="number" inputmode="numeric" id="ed-rest" value="${r.restSec}"></div>
    <div class="modal-btn-row"><button class="btn primary" data-ed="save">Save</button></div>`;
  openModal("Edit " + exerciseName(r.key), html, root => {
    root.querySelector('[data-ed="save"]').addEventListener("click", () => {
      const n = id => parseInt(root.querySelector(id).value, 10);
      if (Number.isFinite(n("#ed-sets")))  r.sets    = Math.max(1, n("#ed-sets"));
      if (Number.isFinite(n("#ed-lo")))    r.repLow  = Math.max(1, n("#ed-lo"));
      if (Number.isFinite(n("#ed-hi")))    r.repHigh = Math.max(r.repLow, n("#ed-hi"));
      if (Number.isFinite(n("#ed-rest")))  r.restSec = Math.max(0, n("#ed-rest"));
      closeModal(); renderBuilder();
    });
  });
}

function openExercisePicker() {
  const lib = getLibrary();
  const keys = Object.keys(lib).sort((a, b) => lib[a].name.localeCompare(lib[b].name));
  const html = `
    <div class="form-row">
      <input type="text" id="ex-search" placeholder="Search, or type a new exercise name" autocomplete="off">
    </div>
    <button class="btn" data-pick="custom" style="width:100%;margin-bottom:10px;">+ Add as custom exercise</button>
    <div class="bld-list" id="ex-results">
      ${keys.map(k => `
        <button class="bld-choice" data-pick-key="${k}">
          <div class="bc-title">${escapeHtml(lib[k].name)}</div>
          <div class="bc-sub">${lib[k].equipment} · ${(lib[k].muscles || []).join(", ")}</div>
        </button>`).join("")}
    </div>`;
  openModal("Add exercise", html, root => {
    const search = root.querySelector("#ex-search");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      root.querySelectorAll("[data-pick-key]").forEach(b => {
        b.hidden = q && !b.textContent.toLowerCase().includes(q);
      });
    });
    const add = key => {
      const G = BUILDER_GOALS[builderState.goal] || BUILDER_GOALS.hypertrophy;
      const measured = isMeasuredExercise(key);
      const row = {
        key, sets: G.sets[0],
        repLow: measured ? 30 : G.reps[0], repHigh: measured ? 45 : G.reps[1],
        restSec: G.restSec, unit: getExercise(key).timeBased ? "seconds" : null
      };
      // Added mid-session or while editing, so it needs loggable set rows
      if (builderState.step === "live" || builderState.step === "edit") {
        row.setsLogged = Array.from({ length: row.sets }, () => ({}));
      }
      builderState.exercises.push(row);
      closeModal(); renderBuilder();
    };
    root.querySelectorAll("[data-pick-key]").forEach(b =>
      b.addEventListener("click", () => add(b.dataset.pickKey)));
    root.querySelector('[data-pick="custom"]').addEventListener("click", () => {
      const key = addCustomExercise(search.value);
      if (!key) { showToast("Type a name first"); return; }
      add(key);
    });
  });
}

function openSaveTemplate() {
  const html = `
    <div class="form-row"><label>Template name</label>
      <input type="text" id="tpl-name" value="${escapeHtml(defaultWorkoutName())}" autocomplete="off"></div>
    <div class="modal-btn-row"><button class="btn primary" data-tpl="save">Save template</button></div>`;
  openModal("Save as my template", html, root => {
    root.querySelector('[data-tpl="save"]').addEventListener("click", () => {
      const n = root.querySelector("#tpl-name").value.trim();
      if (!n) { showToast("Name required"); return; }
      saveUserTemplate(n, builderState.category, builderState.goal, builderState.exercises);
      closeModal();
      showToast("Template saved");
    });
  });
}

// ------------------------------------------------------------------
// SAVE
// ------------------------------------------------------------------
function saveBuilderWorkout() {
  const root = document.getElementById("builder-root");
  const name   = root.querySelector("#bld-name").value.trim() || defaultWorkoutName();
  const durRaw = parseInt(root.querySelector("#bld-dur").value, 10);
  const effRaw = parseInt(root.querySelector("#bld-effort").value, 10);
  const notes  = root.querySelector("#bld-notes").value.trim();
  const iso    = builderState.iso;

  const exercises = {};
  let anySet = false;
  for (const r of builderState.exercises) {
    if (r.skipped) continue;
    const sets = (r.setsLogged || []).filter(s => s && (s.reps != null || s.weightKg != null));
    if (!sets.length) continue;
    anySet = true;
    exercises[r.key] = {
      setsLogged: sets.map(s => ({ reps: s.reps ?? null, weightKg: s.weightKg ?? null,
                                   completed: !!s.completed, note: s.note || "" })),
      completed: sets.every(s => s.completed),
      notes: ""
    };
  }
  if (!anySet) { showToast("Log at least one set"); return; }

  const planned = plannedLiftFor(iso);
  const linkedSessionId = (planned && planned.category === builderState.category) ? planned.sessionId : null;

  addExtraSession(iso, {
    type: "gym", builder: true, name,
    category: builderState.category, goal: builderState.goal,
    durationMin: Number.isFinite(durRaw) ? durRaw : null,
    effortRating: Number.isFinite(effRaw) ? effRaw : null,
    notes, linkedSessionId, exercises
  });

  // Mark the programmed lift complete so adherence reflects the work
  if (linkedSessionId) {
    const sl = getSessionLog(iso, linkedSessionId);
    sl.completed = true;
    saveData();
  }

  clearDraft();
  closeBuilder();
  showToast(linkedSessionId ? "Saved — programmed session marked complete" : "Workout saved");
}


// ------------------------------------------------------------------
// STATS: weekly volume + per-exercise history
// ------------------------------------------------------------------
function renderVolumeCard() {
  const now = weeklyHardSets(0), prev = weeklyHardSets(-1);
  const muscles = Array.from(new Set(Object.keys(now).concat(Object.keys(prev))))
    .sort((a, b) => (now[b] || 0) - (now[a] || 0));
  if (!muscles.length) {
    return `<div class="card"><h3>Weekly hard sets</h3>
      <p class="muted" style="font-size:12px;margin-top:8px;line-height:1.5;">
      No completed sets logged this week yet. Tick sets as you go and volume per muscle group shows here.</p></div>`;
  }
  const rows = muscles.map(m => {
    const a = now[m] || 0, b = prev[m] || 0, d = a - b;
    const cls = d > 0 ? "up" : d < 0 ? "down" : "flat";
    return `<div class="vol-row">
      <span class="vol-muscle">${escapeHtml(m)}</span>
      <span class="vol-now">${a}</span>
      <span class="vol-delta ${cls}">${d > 0 ? "+" + d : d === 0 ? "\u2013" : d}</span>
    </div>`;
  }).join("");
  return `<div class="card">
    <h3>Weekly hard sets</h3>
    <p class="muted" style="font-size:11px;margin:4px 0 10px;">This week vs last, by primary muscle</p>
    ${rows}
  </div>`;
}

function exercisesWithHistory() {
  const data = loadData();
  const seen = {};
  for (const iso in data.days) {
    const day = data.days[iso];
    for (const sid in (day.sessions || {}))
      for (const k in (day.sessions[sid].exercises || {})) seen[k] = true;
    for (const es of (day.extraSessions || []))
      for (const k in (es.exercises || {})) seen[k] = true;
  }
  return Object.keys(seen).sort((a, b) => exerciseName(a).localeCompare(exerciseName(b)));
}

function renderExerciseHistoryCard() {
  const keys = exercisesWithHistory();
  if (!keys.length) return "";
  const sel = state.histExercise && keys.includes(state.histExercise) ? state.histExercise : keys[0];
  const hist = exerciseHistory(sel).filter(h => h.best);
  const best = bestE1RM(sel);
  const rows = hist.slice(0, 12).map(h => {
    const isPB = best && h.best.e1rm >= best.e1rm - 0.001 && h.iso === best.iso;
    return `<div class="hist-row">
      <span>${formatPrettyDate(h.iso)}${isPB ? `<span class="pb-badge">PB</span>` : ""}</span>
      <span class="hr-1rm">${h.best.weightKg}kg \u00d7 ${h.best.reps} \u00b7 e1RM ${h.best.e1rm.toFixed(1)}kg</span>
    </div>`;
  }).join("");
  return `<div class="chart-wrap">
    <h3>Exercise history</h3>
    <select id="hist-pick" style="margin:8px 0 12px;">
      ${keys.map(k => `<option value="${k}" ${k === sel ? "selected" : ""}>${escapeHtml(exerciseName(k))}</option>`).join("")}
    </select>
    ${renderE1rmChart(sel)}
    <div style="margin-top:12px;">${rows || `<p class="muted" style="font-size:12px;">No weighted sets logged for this exercise.</p>`}</div>
  </div>`;
}

function renderE1rmChart(key) {
  const hist = exerciseHistory(key).filter(h => h.best).slice().reverse();
  const W = 360, H = 170, pad = { top: 12, right: 12, bottom: 26, left: 38 };
  const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
  if (hist.length < 2) {
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${W/2}" y="${H/2}" font-size="12" fill="#707070" text-anchor="middle">Need two sessions to plot a trend</text></svg>`;
  }
  const vals = hist.map(h => h.best.e1rm);
  const lo = Math.min(...vals) * 0.95, hi = Math.max(...vals) * 1.05;
  const x = i => pad.left + (i / (hist.length - 1)) * iw;
  const y = v => pad.top + ih - ((v - lo) / (hi - lo || 1)) * ih;
  let grid = "", step = (hi - lo) / 3;
  for (let i = 0; i <= 3; i++) {
    const v = lo + step * i, yy = y(v);
    grid += `<line x1="${pad.left}" y1="${yy}" x2="${W - pad.right}" y2="${yy}" stroke="#2a2a2a" stroke-width="0.5"/>`;
    grid += `<text x="${pad.left - 5}" y="${yy + 4}" font-size="9" fill="#707070" text-anchor="end">${v.toFixed(0)}</text>`;
  }
  const path = hist.map((h, i) => (i ? "L" : "M") + x(i) + "," + y(h.best.e1rm)).join("");
  const dots = hist.map((h, i) => `<circle cx="${x(i)}" cy="${y(h.best.e1rm)}" r="2.5" fill="#ff6b35"/>`).join("");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const lbl = i => { const d = parseISO(hist[i].iso); return d.getDate() + months[d.getMonth()]; };
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${grid}
    <path d="${path}" stroke="#ff6b35" stroke-width="2" fill="none"/>
    ${dots}
    <text x="${pad.left}" y="${H - 8}" font-size="9" fill="#707070">${lbl(0)}</text>
    <text x="${W - pad.right}" y="${H - 8}" font-size="9" fill="#707070" text-anchor="end">${lbl(hist.length - 1)}</text>
  </svg>`;
}

function wireStatsExtras() {
  const pick = document.getElementById("hist-pick");
  if (pick) pick.addEventListener("change", () => {
    state.histExercise = pick.value;
    renderStats();
  });
}
