const assert = require("assert");
const {
  templates,
  buildPrompt,
  scorePrompt,
  countPrompt,
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

testBuildPrompt();
testScoreSeparatesWeakAndStrongPrompts();
testTemplatesStayUseful();
testPromptStats();

console.log("Prompt core tests passed");
