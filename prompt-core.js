(function (global) {
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
    marketing: {
      role: "Lifecycle marketing strategist",
      goal: "Create a focused campaign brief for a product launch.",
      audience: "Marketing lead preparing copy, channels, and success metrics",
      context:
        "The campaign should explain the customer problem, offer, proof points, and launch sequence.",
      constraints:
        "Avoid hype. Include target segment, positioning angle, key messages, channels, and measurable outcomes.",
      tone: "executive and clear",
      format: "bullet list with clear next steps",
    },
    support: {
      role: "Customer support operations specialist",
      goal: "Turn a messy customer issue into a clear support response and escalation plan.",
      audience: "Support agent handling a time-sensitive ticket",
      context:
        "The customer needs a practical answer, clear ownership, and a path to resolution.",
      constraints:
        "Be empathetic, state what is known, avoid unsupported promises, and list follow-up questions.",
      tone: "friendly and concise",
      format: "step-by-step plan",
    },
    data: {
      role: "Product data analyst",
      goal: "Diagnose a metric movement and identify the most likely drivers.",
      audience: "Product manager deciding what to investigate next",
      context:
        "The answer should separate confirmed evidence from hypotheses and recommend useful follow-up cuts.",
      constraints:
        "Call out missing data, define the comparison window, and avoid claiming causality without evidence.",
      tone: "technical and precise",
      format: "short report with recommendation",
    },
    learning: {
      role: "Learning coach",
      goal:
        "Create a four-week study plan with milestones, practice tasks, and review checkpoints.",
      audience: "Student preparing for a technical interview",
      context:
        "The learner has limited daily study time and needs a plan that separates concepts, practice, and review.",
      constraints:
        "Include measurable outcomes, weekly checkpoints, follow-up questions, risks, and adjustments for missing background knowledge.",
      tone: "friendly and concise",
      format: "step-by-step plan",
    },
  };

  const actionWords = [
    "analyze",
    "build",
    "compare",
    "create",
    "design",
    "diagnose",
    "draft",
    "explain",
    "identify",
    "improve",
    "plan",
    "review",
    "summarize",
    "turn",
    "write",
  ];

  const boundaryWords = [
    "avoid",
    "call out",
    "define",
    "include",
    "limit",
    "must",
    "prefer",
    "separate",
    "should",
  ];

  const evidenceWords = [
    "acceptance",
    "criteria",
    "evidence",
    "measure",
    "measurable",
    "metric",
    "outcome",
    "proof",
    "recommendation",
    "success",
    "test",
    "validation",
  ];

  const uncertaintyWords = [
    "assumption",
    "clarifying",
    "evidence",
    "follow-up",
    "hypotheses",
    "missing",
    "question",
    "risk",
    "uncertain",
    "uncertainty",
  ];

  const presetType = "ai-prompt-lab/preset";
  const presetVersion = 1;
  const presetFields = [
    "role",
    "goal",
    "audience",
    "context",
    "constraints",
    "tone",
    "format",
  ];

  function normalize(value) {
    return String(value || "").trim();
  }

  function includesAny(text, words) {
    const normalizedText = normalize(text).toLowerCase();
    return words.some((word) => normalizedText.includes(word));
  }

  function section(title, value) {
    const normalizedValue = normalize(value);
    return normalizedValue ? `${title}\n${normalizedValue}` : "";
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
    const role = normalize(state.role);
    const goal = normalize(state.goal);
    const audience = normalize(state.audience);
    const context = normalize(state.context);
    const constraints = normalize(state.constraints);
    const format = normalize(state.format);
    const combined = `${goal} ${context} ${constraints} ${format}`;

    const checks = [
      {
        label: "Role is defined",
        pass: role.length >= 6 && role.split(/\s+/).length >= 2,
      },
      {
        label: "Goal has action and outcome",
        pass: goal.length >= 24 && includesAny(goal, actionWords),
      },
      {
        label: "Audience is named",
        pass: audience.length >= 4,
      },
      {
        label: "Context gives background",
        pass: context.length >= 36,
      },
      {
        label: "Constraints reduce ambiguity",
        pass: constraints.length >= 24 && includesAny(constraints, boundaryWords),
      },
      {
        label: "Output format is selected",
        pass: Boolean(format),
      },
      {
        label: "Success criteria or evidence is mentioned",
        pass: includesAny(combined, evidenceWords),
      },
      {
        label: "Uncertainty or follow-up is handled",
        pass: includesAny(combined, uncertaintyWords),
      },
    ];

    const passed = checks.filter((check) => check.pass).length;
    const score = Math.round((passed / checks.length) * 100);

    return { checks, score };
  }

  function countPrompt(promptText) {
    const text = String(promptText || "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return {
      words,
      characters: text.length,
    };
  }

  function sanitizePreset(state) {
    const preset = {};

    presetFields.forEach((field) => {
      preset[field] = normalize(state && state[field]);
    });

    return preset;
  }

  function serializePreset(state) {
    return JSON.stringify(
      {
        type: presetType,
        version: presetVersion,
        exportedAt: new Date().toISOString(),
        preset: sanitizePreset(state),
      },
      null,
      2
    );
  }

  function parsePresetJson(jsonText) {
    let parsed;

    try {
      parsed = JSON.parse(String(jsonText || ""));
    } catch {
      throw new Error("Preset file is not valid JSON.");
    }

    const candidate = parsed && parsed.preset ? parsed.preset : parsed;

    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error("Preset file does not contain a prompt preset object.");
    }

    const preset = sanitizePreset(candidate);
    const hasSupportedField = presetFields.some((field) => preset[field]);

    if (!hasSupportedField) {
      throw new Error("Preset file does not include any supported prompt fields.");
    }

    return preset;
  }

  const api = {
    templates,
    buildPrompt,
    scorePrompt,
    countPrompt,
    parsePresetJson,
    serializePreset,
  };

  global.PromptLabCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
