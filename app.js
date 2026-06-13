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
const exportPresetButton = document.querySelector("#export-preset-btn");
const importPresetButton = document.querySelector("#import-preset-btn");
const presetFileInput = document.querySelector("#preset-file-input");
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

const storageKey = "ai-prompt-lab-state";
const historyKey = "ai-prompt-lab-history";

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
  saveStatus.textContent = saveJson(storageKey, state) ? "Saved" : "Not saved";
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
exportPresetButton.addEventListener("click", exportPreset);
importPresetButton.addEventListener("click", () => presetFileInput.click());
presetFileInput.addEventListener("change", () => importPreset(presetFileInput.files[0]));
resetButton.addEventListener("click", resetForm);

writeState(loadJson(storageKey, templates.product));
renderHistory();
render();
