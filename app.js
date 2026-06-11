const fields = {
  role: document.querySelector("#role-input"),
  goal: document.querySelector("#goal-input"),
  audience: document.querySelector("#audience-input"),
  context: document.querySelector("#context-input"),
  constraints: document.querySelector("#constraints-input"),
  tone: document.querySelector("#tone-input"),
  format: document.querySelector("#format-input"),
};

const output = document.querySelector("#prompt-output");
const copyButton = document.querySelector("#copy-btn");
const downloadButton = document.querySelector("#download-btn");
const resetButton = document.querySelector("#reset-btn");
const saveStatus = document.querySelector("#save-status");
const scoreBadge = document.querySelector("#score-badge");
const qualityLabel = document.querySelector("#quality-label");
const qualityMeter = document.querySelector("#quality-meter");
const checklist = document.querySelector("#checklist");
const historyList = document.querySelector("#history-list");

const storageKey = "ai-prompt-lab-state";
const historyKey = "ai-prompt-lab-history";

const templates = {
  product: {
    role: "Senior product strategist",
    goal: "Turn a rough product idea into a clear MVP plan with priorities.",
    audience: "Solo founder or small product team",
    context:
      "The idea is early. Time is limited. The answer should help decide what to build first.",
    constraints:
      "Avoid vague advice. Include risks, assumptions, and a simple validation step.",
    tone: "direct and practical",
    format: "step-by-step plan",
  },
  code: {
    role: "Senior software engineer",
    goal: "Review the implementation plan and produce a practical coding task breakdown.",
    audience: "Developer preparing a GitHub project",
    context:
      "The project should be small, maintainable, and easy to explain in a README.",
    constraints:
      "Prefer simple dependencies, include tests, and call out any risky assumptions.",
    tone: "technical and precise",
    format: "working code with explanation",
  },
  research: {
    role: "Careful research assistant",
    goal: "Summarize a topic and identify the most useful next questions.",
    audience: "Busy reader who needs accurate context",
    context:
      "The reader wants a balanced summary, not a promotional answer.",
    constraints:
      "Separate facts from assumptions. Flag uncertainty. Keep the final recommendation short.",
    tone: "executive and clear",
    format: "short report with recommendation",
  },
};

function readState() {
  return Object.fromEntries(
    Object.entries(fields).map(([key, element]) => [key, element.value.trim()])
  );
}

function writeState(state) {
  Object.entries(fields).forEach(([key, element]) => {
    element.value = state[key] || "";
  });
}

function section(title, value) {
  return value ? `${title}\n${value}` : "";
}

function buildPrompt(state) {
  const blocks = [
    section("Role", state.role || "Helpful AI assistant"),
    section("Goal", state.goal),
    section("Audience", state.audience),
    section("Context", state.context),
    section("Constraints", state.constraints),
    section("Tone", state.tone),
    section("Output format", state.format),
    section(
      "Quality bar",
      "Ask clarifying questions when required. Be specific, actionable, and honest about uncertainty."
    ),
  ].filter(Boolean);

  return blocks.join("\n\n");
}

function scorePrompt(state) {
  const checks = [
    {
      label: "Role is defined",
      pass: state.role.length >= 6,
    },
    {
      label: "Goal is specific",
      pass: state.goal.length >= 24,
    },
    {
      label: "Audience is named",
      pass: state.audience.length >= 4,
    },
    {
      label: "Context gives background",
      pass: state.context.length >= 36,
    },
    {
      label: "Constraints reduce ambiguity",
      pass: state.constraints.length >= 24,
    },
    {
      label: "Output format is selected",
      pass: Boolean(state.format),
    },
  ];

  const passed = checks.filter((check) => check.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return { checks, score };
}

function renderChecklist(checks) {
  checklist.replaceChildren();

  checks.forEach((check) => {
    const item = document.createElement("li");
    const label = document.createElement("strong");
    const status = document.createElement("span");

    label.textContent = check.label;
    status.textContent = check.pass ? "OK" : "Missing";
    status.style.color = check.pass ? "var(--green-dark)" : "var(--rose)";

    item.append(label, status);
    checklist.append(item);
  });
}

function updateQuality(score) {
  scoreBadge.textContent = `${score}`;
  qualityMeter.style.width = `${score}%`;

  if (score >= 84) {
    qualityLabel.textContent = "Strong";
  } else if (score >= 50) {
    qualityLabel.textContent = "Usable";
  } else {
    qualityLabel.textContent = "Needs detail";
  }
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
  } catch {
    saveStatus.textContent = "Not saved";
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
  saveJson(storageKey, state);
  saveStatus.textContent = "Saved";
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

  const file = new Blob([promptText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "ai-prompt.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  saveStatus.textContent = "Downloaded";
  saveHistory(promptText);
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
resetButton.addEventListener("click", resetForm);

writeState(loadJson(storageKey, templates.product));
renderHistory();
render();
