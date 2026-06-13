const assert = require("assert");
const {
  templates,
  buildPrompt,
  scorePrompt,
  countPrompt,
  parsePresetJson,
  serializePreset,
} = require("../prompt-core.js");

function testBuildPrompt() {
  const prompt = buildPrompt(templates.product);

  assert.match(prompt, /^Role\nSenior product strategist/m);
  assert.match(prompt, /Goal\nTurn a rough product idea/m);
  assert.match(prompt, /Output format\nstep-by-step plan/m);
  assert.match(prompt, /Quality bar\nAsk clarifying questions/m);
}

function testScoreSeparatesWeakAndStrongPrompts() {
  const weak = scorePrompt({
    role: "AI",
    goal: "Help me",
    audience: "",
    context: "",
    constraints: "",
    tone: "direct and practical",
    format: "",
  });

  const strong = scorePrompt(templates.data);

  assert.ok(weak.score < 40, `Expected weak score below 40, got ${weak.score}`);
  assert.ok(strong.score >= 85, `Expected strong score at least 85, got ${strong.score}`);
  assert.ok(strong.score > weak.score);
  assert.ok(
    strong.checks.some(
      (check) => check.label === "Success criteria or evidence is mentioned" && check.pass
    )
  );
  assert.ok(
    strong.checks.some(
      (check) => check.label === "Uncertainty or follow-up is handled" && check.pass
    )
  );
}

function testEmptyPromptStaysLowScoring() {
  const prompt = buildPrompt({});
  const score = scorePrompt({});

  assert.match(prompt, /^Role\nHelpful AI assistant/m);
  assert.match(prompt, /Quality bar\nAsk clarifying questions/m);
  assert.strictEqual(score.score, 0);
  assert.ok(score.checks.every((check) => !check.pass));
}

function testVerbosePromptDoesNotAutomaticallyPass() {
  const verbose = scorePrompt({
    role: "Helpful planning assistant",
    goal:
      "Create a detailed plan for improving a small browser tool with several sections and many implementation notes.",
    audience: "Solo maintainer",
    context:
      "The project is already deployed and the maintainer wants a careful next step without changing the whole architecture.",
    constraints:
      "Include implementation details, avoid unrelated rewrites, and keep the output focused on the current repository.",
    tone: "direct and practical",
    format: "bullet list with clear next steps",
  });

  assert.ok(verbose.score < 100, `Expected verbose score below 100, got ${verbose.score}`);
  assert.ok(
    verbose.checks.some(
      (check) => check.label === "Success criteria or evidence is mentioned" && !check.pass
    )
  );
  assert.ok(
    verbose.checks.some(
      (check) => check.label === "Uncertainty or follow-up is handled" && !check.pass
    )
  );
}

function testTemplatesStayUseful() {
  const expectedTemplates = [
    "product",
    "code",
    "research",
    "marketing",
    "support",
    "data",
  ];

  assert.deepStrictEqual(Object.keys(templates), expectedTemplates);

  for (const [name, template] of Object.entries(templates)) {
    const prompt = buildPrompt(template);
    const score = scorePrompt(template);

    assert.ok(prompt.includes("Role\n"), `${name} prompt is missing role`);
    assert.ok(prompt.includes("Goal\n"), `${name} prompt is missing goal`);
    assert.ok(score.score >= 85, `${name} template score is too low: ${score.score}`);
  }
}

function testPromptStats() {
  const prompt = buildPrompt(templates.support);
  const stats = countPrompt(prompt);

  assert.ok(stats.words > 40, `Expected support prompt above 40 words, got ${stats.words}`);
  assert.strictEqual(stats.characters, prompt.length);
}

function testPresetSerializationRoundTrip() {
  const exported = serializePreset(templates.marketing);
  const parsed = JSON.parse(exported);
  const preset = parsePresetJson(exported);

  assert.strictEqual(parsed.type, "ai-prompt-lab/preset");
  assert.strictEqual(parsed.version, 1);
  assert.strictEqual(preset.role, templates.marketing.role);
  assert.strictEqual(preset.goal, templates.marketing.goal);
  assert.strictEqual(preset.format, templates.marketing.format);
}

function testPresetParserAcceptsPlainObjects() {
  const preset = parsePresetJson(
    JSON.stringify({
      role: "Learning coach",
      goal: "Create a useful study plan with milestones.",
      extraField: "ignored",
    })
  );

  assert.strictEqual(preset.role, "Learning coach");
  assert.strictEqual(preset.goal, "Create a useful study plan with milestones.");
  assert.strictEqual(preset.extraField, undefined);
}

function testPresetParserRejectsInvalidInput() {
  assert.throws(() => parsePresetJson("{"), /not valid JSON/);
  assert.throws(() => parsePresetJson(JSON.stringify({ extraField: "nope" })), /supported/);
  assert.throws(() => parsePresetJson(JSON.stringify({ role: "   " })), /supported/);
  assert.throws(() => parsePresetJson(JSON.stringify([])), /preset object/);
}

testBuildPrompt();
testScoreSeparatesWeakAndStrongPrompts();
testEmptyPromptStaysLowScoring();
testVerbosePromptDoesNotAutomaticallyPass();
testTemplatesStayUseful();
testPromptStats();
testPresetSerializationRoundTrip();
testPresetParserAcceptsPlainObjects();
testPresetParserRejectsInvalidInput();

console.log("Prompt core tests passed");
