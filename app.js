const fields = {
  role: document.querySelector("#role-input"),
  goal: document.querySelector("#goal-input"),
  audience: document.querySelector("#audience-input"),
  context: document.querySelector("#context-input"),
  constraints: document.querySelector("#constraints-input"),
  tone: document.querySelector("#tone-input"),
  format: document.querySelector("#format-input"),
};

const promptCore = window.PromptLabCore;
const {
  templates,
  buildPrompt,
  scorePrompt,
  countPrompt,
  parsePresetJson,
  serializePreset,
} = promptCore;

const output = document.querySelector("#prompt-output");
const copyButton = document.querySelector("#copy-btn");
const downloadButton = document.querySelector("#download-btn");
const captureBaselineButton = document.querySelector("#capture-baseline-btn");
const exportPresetButton = document.querySelector("#export-preset-btn");
const importPresetButton = document.querySelector("#import-preset-btn");
const presetFileInput = document.querySelector("#preset-file-input");
const presetNameInput = document.querySelector("#preset-name-input");
const savePresetButton = document.querySelector("#save-preset-btn");
const savedPresetList = document.querySelector("#saved-preset-list");
const resetButton = document.querySelector("#reset-btn");
const saveStatus = document.querySelector("#save-status");
const scoreBadge = document.querySelector("#score-badge");
const qualityLabel = document.querySelector("#quality-label");
const qualityMeter = document.querySelector("#quality-meter");
const qualityMeterShell = document.querySelector("#quality-meter-shell");
const checklist = document.querySelector("#checklist");
const historyList = document.querySelector("#history-list");
const wordCount = document.querySelector("#word-count");
const charCount = document.querySelector("#char-count");
const diffSummary = document.querySelector("#diff-summary");
const diffList = document.querySelector("#prompt-diff");

const storageKey = "ai-prompt-lab-state";
const historyKey = "ai-prompt-lab-history";
const savedPresetsKey = "ai-prompt-lab-saved-presets";
let promptBaseline = "";

function readState() {
  return Object.fromEntries(
    Object.entries(fields).map(([key, element]) => [key, element.value.trim()])
  );
}

function writeState(state) {
  Object.entries(fields).forEach(([key, element]) => {
    const nextValue = state[key] || "";
    element.value = nextValue;

    if (element.tagName === "SELECT" && element.value !== nextValue) {
      element.selectedIndex = 0;
    }
  });
}

function renderChecklist(checks) {
  checklist.replaceChildren();

  checks.forEach((check) => {
    const item = document.createElement("li");
    const label = document.createElement("strong");
    const status = document.createElement("span");
    const statusText = check.pass ? "OK" : "Missing";

    label.textContent = check.label;
    status.textContent = statusText;
    status.className = `check-state ${check.pass ? "pass" : "missing"}`;
    status.setAttribute("aria-label", statusText);
    item.setAttribute("data-status", check.pass ? "pass" : "missing");

    item.append(label, status);
    checklist.append(item);
  });
}

function updateQuality(score) {
  scoreBadge.textContent = `${score}`;
  qualityMeter.style.width = `${score}%`;
  qualityMeterShell.setAttribute("aria-valuenow", `${score}`);

  if (score >= 84) {
    qualityLabel.textContent = "Strong";
  } else if (score >= 50) {
    qualityLabel.textContent = "Usable";
  } else {
    qualityLabel.textContent = "Needs detail";
  }
}

function updateStats(promptText) {
  const stats = countPrompt(promptText);
  wordCount.textContent = `${stats.words}`;
  charCount.textContent = `${stats.characters}`;
}

function splitPromptLines(promptText) {
  return String(promptText || "").split(/\r?\n/);
}

function changeLabel(changeType) {
  return changeType.charAt(0).toUpperCase() + changeType.slice(1);
}

function renderEmptyDiff(message) {
  const item = document.createElement("li");
  item.className = "diff-empty";
  item.textContent = message;
  diffList.append(item);
}

function renderDiff(promptText = output.value) {
  diffList.replaceChildren();

  if (!promptBaseline) {
    diffSummary.textContent = "No baseline captured";
    renderEmptyDiff("Capture a baseline to compare prompt changes.");
    return;
  }

  const beforeLines = splitPromptLines(promptBaseline);
  const afterLines = splitPromptLines(promptText);
  const changes = [];
  const lineCount = Math.max(beforeLines.length, afterLines.length);

  for (let index = 0; index < lineCount; index += 1) {
    const before = beforeLines[index];
    const after = afterLines[index];

    if (before === after) {
      continue;
    }

    const changeType =
      before === undefined ? "added" : after === undefined ? "removed" : "changed";

    changes.push({
      after,
      before,
      lineNumber: index + 1,
      type: changeType,
    });
  }

  if (!changes.length) {
    diffSummary.textContent = "No line changes";
    renderEmptyDiff("No line changes since the captured baseline.");
    return;
  }

  diffSummary.textContent =
    changes.length === 1 ? "1 changed line" : `${changes.length} changed lines`;

  changes.forEach((change) => {
    const item = document.createElement("li");
    const tag = document.createElement("span");
    const body = document.createElement("div");
    const lineNumber = document.createElement("p");

    item.setAttribute("data-change", change.type);
    tag.className = "diff-tag";
    tag.textContent = changeLabel(change.type);
    lineNumber.className = "diff-line-number";
    lineNumber.textContent = `Line ${change.lineNumber}`;
    body.append(lineNumber);

    if (change.before !== undefined) {
      const before = document.createElement("del");
      before.textContent = change.before || "(blank line)";
      body.append(before);
    }

    if (change.after !== undefined) {
      const after = document.createElement("ins");
      after.textContent = change.after || "(blank line)";
      body.append(after);
    }

    item.append(tag, body);
    diffList.append(item);
  });
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function normalizePresetName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function createPresetId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `preset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readSavedPresets() {
  const savedPresets = loadJson(savedPresetsKey, []);

  if (!Array.isArray(savedPresets)) {
    return [];
  }

  return savedPresets.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      item.preset &&
      typeof item.preset === "object" &&
      !Array.isArray(item.preset)
  );
}

function renderSavedPresets(presets = readSavedPresets()) {
  savedPresetList.replaceChildren();

  if (!presets.length) {
    const empty = document.createElement("li");
    empty.className = "saved-preset-empty";
    empty.textContent = "No saved presets yet. Name the current setup to reuse it later.";
    savedPresetList.append(empty);
    return;
  }

  presets.forEach((preset) => {
    const item = document.createElement("li");
    const loadButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    item.className = "saved-preset-item";
    loadButton.type = "button";
    loadButton.textContent = preset.name;
    loadButton.setAttribute("aria-label", `Load ${preset.name}`);
    loadButton.addEventListener("click", () => loadNamedPreset(preset.id));

    deleteButton.type = "button";
    deleteButton.className = "secondary saved-preset-delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${preset.name}`);
    deleteButton.addEventListener("click", () => deleteNamedPreset(preset.id));

    item.append(loadButton, deleteButton);
    savedPresetList.append(item);
  });
}

function saveNamedPreset() {
  const name = normalizePresetName(presetNameInput.value);

  if (!name) {
    saveStatus.textContent = "Preset name required";
    presetNameInput.focus();
    return;
  }

  const savedPresets = readSavedPresets();
  const existing = savedPresets.find(
    (preset) => preset.name.toLowerCase() === name.toLowerCase()
  );
  const nextPreset = {
    id: existing ? existing.id : createPresetId(),
    name,
    preset: readState(),
    updatedAt: new Date().toISOString(),
  };
  const nextPresets = [
    nextPreset,
    ...savedPresets.filter((preset) => preset.id !== nextPreset.id),
  ].slice(0, 12);

  if (!saveJson(savedPresetsKey, nextPresets)) {
    saveStatus.textContent = "Preset not saved";
    return;
  }

  presetNameInput.value = "";
  renderSavedPresets(nextPresets);
  saveStatus.textContent = "Preset saved";
}

function loadNamedPreset(id) {
  const savedPresets = readSavedPresets();
  const savedPreset = savedPresets.find((preset) => preset.id === id);

  if (!savedPreset) {
    renderSavedPresets(savedPresets);
    saveStatus.textContent = "Preset missing";
    return;
  }

  writeState(savedPreset.preset);
  render();
  saveStatus.textContent = "Preset loaded";
}

function deleteNamedPreset(id) {
  const savedPresets = readSavedPresets();
  const nextPresets = savedPresets.filter((preset) => preset.id !== id);

  if (!saveJson(savedPresetsKey, nextPresets)) {
    saveStatus.textContent = "Preset not deleted";
    return;
  }

  renderSavedPresets(nextPresets);
  saveStatus.textContent = "Preset deleted";
}

function saveHistory(promptText) {
  if (!promptText.trim()) {
    return;
  }

  const history = loadJson(historyKey, []);
  const nextHistory = [
    {
      title: promptText.split("\n").find(Boolean)?.slice(0, 70) || "Untitled prompt",
      prompt: promptText,
      createdAt: new Date().toISOString(),
    },
    ...history.filter((item) => item.prompt !== promptText),
  ].slice(0, 5);

  saveJson(historyKey, nextHistory);
  renderHistory(nextHistory);
}

function renderHistory(history = loadJson(historyKey, [])) {
  historyList.replaceChildren();

  if (!history.length) {
    const empty = document.createElement("li");
    empty.textContent = "No saved prompts yet";
    historyList.append(empty);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = entry.title;
    button.addEventListener("click", () => {
      output.value = entry.prompt;
      saveStatus.textContent = "History loaded";
    });
    item.append(button);
    historyList.append(item);
  });
}

function render() {
  const state = readState();
  const promptText = buildPrompt(state);
  const { checks, score } = scorePrompt(state);

  output.value = promptText;
  renderChecklist(checks);
  updateQuality(score);
  updateStats(promptText);
  renderDiff(promptText);
  saveStatus.textContent = saveJson(storageKey, state) ? "Saved" : "Not saved";
}

function captureBaseline() {
  promptBaseline = output.value;
  renderDiff(output.value);
  saveStatus.textContent = "Baseline captured";
}

async function copyPrompt() {
  const promptText = output.value;

  if (!promptText.trim()) {
    saveStatus.textContent = "Nothing to copy";
    return;
  }

  try {
    await navigator.clipboard.writeText(promptText);
    saveStatus.textContent = "Copied";
    saveHistory(promptText);
  } catch {
    output.select();
    document.execCommand("copy");
    saveStatus.textContent = "Copied";
    saveHistory(promptText);
  }
}

function downloadPrompt() {
  const promptText = output.value;

  if (!promptText.trim()) {
    saveStatus.textContent = "Nothing to download";
    return;
  }

  downloadText("ai-prompt.txt", promptText, "text/plain");
  saveStatus.textContent = "Downloaded";
  saveHistory(promptText);
}

function downloadText(filename, text, type) {
  const file = new Blob([text], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportPreset() {
  const presetJson = serializePreset(readState());
  downloadText("ai-prompt-lab-preset.json", presetJson, "application/json");
  saveStatus.textContent = "Preset exported";
}

async function importPreset(file) {
  if (!file) {
    return;
  }

  try {
    const presetJson = await file.text();
    const preset = parsePresetJson(presetJson);
    writeState(preset);
    render();
    saveStatus.textContent = "Preset imported";
  } catch (error) {
    saveStatus.textContent = "Import failed";
    console.error(error);
  } finally {
    presetFileInput.value = "";
  }
}

function resetForm() {
  writeState({
    role: "",
    goal: "",
    audience: "",
    context: "",
    constraints: "",
    tone: "direct and practical",
    format: "bullet list with clear next steps",
  });
  render();
  saveStatus.textContent = "Reset";
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", render);
  field.addEventListener("change", render);
});

document.querySelectorAll("[data-template]").forEach((button) => {
  button.addEventListener("click", () => {
    const template = templates[button.dataset.template];
    writeState(template);
    render();
    saveStatus.textContent = `${button.textContent} template`;
  });
});

copyButton.addEventListener("click", copyPrompt);
downloadButton.addEventListener("click", downloadPrompt);
captureBaselineButton.addEventListener("click", captureBaseline);
exportPresetButton.addEventListener("click", exportPreset);
importPresetButton.addEventListener("click", () => presetFileInput.click());
presetFileInput.addEventListener("change", () => importPreset(presetFileInput.files[0]));
savePresetButton.addEventListener("click", saveNamedPreset);
presetNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveNamedPreset();
  }
});
resetButton.addEventListener("click", resetForm);

writeState(loadJson(storageKey, templates.product));
renderHistory();
renderSavedPresets();
render();
