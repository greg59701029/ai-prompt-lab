# AI Prompt Lab

Static browser prompt builder for drafting AI prompts with editable fields, local JSON presets, and deterministic checklist scoring.

[![CI](https://github.com/greg59701029/ai-prompt-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/greg59701029/ai-prompt-lab/actions/workflows/ci.yml)
[![Pages](https://github.com/greg59701029/ai-prompt-lab/actions/workflows/pages.yml/badge.svg)](https://github.com/greg59701029/ai-prompt-lab/actions/workflows/pages.yml)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.5.0-blue)

## Status

This is an early personal project. It currently works as a static prompt builder, but the scoring rules are simple heuristics and should not be treated as a real AI evaluation system.

The app has no backend. Prompt content, presets, and recent history stay in the browser unless you copy, download, or export them yourself.

## Current Version

v0.5.0 is the current usable static version. It adds browser-local named presets, a learning template, prompt diffing, and accessibility-focused workflow coverage.

## Live Demo

[Open the live demo](https://greg59701029.github.io/ai-prompt-lab/)

![AI Prompt Lab screenshot](assets/screenshot.png)

## What It Does

- Runs entirely in the browser with no API key
- Builds prompts from role, goal, audience, context, constraints, tone, and output format fields
- Includes templates for product planning, coding tasks, research summaries, marketing briefs, support responses, data analysis, and learning plans
- Scores prompts with 8 deterministic checks for role, goal, audience, context, constraints, format, evidence, and uncertainty
- Saves named prompt setups locally in the browser
- Exports editable presets as JSON
- Downloads generated prompts as plain text
- Stores the last 5 copied or downloaded prompts in `localStorage`

## Known Limitations

- The prompt score is rule-based and can miss good prompts or reward verbose prompts.
- Recent history is stored only in `localStorage`.
- There is no sync, account system, or backend.
- Preset import only validates supported fields, not semantic quality.
- The templates are starting points, not model-specific best practices.

## Example Workflows

### Product Planning

Input:

```text
Help me plan a landing page for a small SaaS product.
```

Generated prompt excerpt:

```text
Role
Senior product strategist

Goal
Turn a rough product idea into a clear MVP plan with priorities.

Constraints
Avoid vague advice. Include risks, assumptions, and a simple validation step.
```

### Coding Task

Input:

```text
Break a small browser app into implementation steps and tests.
```

Generated prompt excerpt:

```text
Role
Senior software engineer

Goal
Review the implementation plan and produce a practical coding task breakdown.

Output format
working code with explanation
```

### Support Response

Input:

```text
Turn a messy customer complaint into a clear reply and escalation plan.
```

Generated prompt excerpt:

```text
Role
Customer support operations specialist

Constraints
Be empathetic, state what is known, avoid unsupported promises, and list follow-up questions.
```

## Presets

Use **Export preset** to save the current builder fields as JSON. Use **Import preset** to load that JSON back into the builder later.

Preset export is different from prompt download:

- `Download` saves the generated prompt as plain text.
- `Export preset` saves the editable builder state as JSON.

See `examples/product-preset.json` for the current preset format.

## Development

Run the smoke test:

```bash
python tests/smoke_test.py
```

Run prompt core unit tests:

```bash
node tests/prompt_core.test.js
```

Run browser tests:

```bash
npm install
npx playwright install --with-deps chromium
npm run test:e2e
```

The browser tests cover template selection, prompt download, invalid preset import, local storage failure, and preset export.

## Project Structure

```text
.
|-- index.html
|-- styles.css
|-- app.js
|-- prompt-core.js
|-- package.json
|-- playwright.config.js
|-- assets/
|   `-- screenshot.png
|-- examples/
|   |-- prompts.md
|   `-- product-preset.json
|-- docs/
|   `-- releases/
|-- tests/
|   |-- smoke_test.py
|   |-- e2e.spec.js
|   `-- prompt_core.test.js
`-- .github/
    |-- ISSUE_TEMPLATE/
    |-- PULL_REQUEST_TEMPLATE.md
    `-- workflows/
        |-- ci.yml
        `-- pages.yml
```

## Roadmap

The current work is tracked in GitHub issues:

- [#1 Add preset management for saved prompt setups](https://github.com/greg59701029/ai-prompt-lab/issues/1)
- [#2 Add before and after prompt diff view](https://github.com/greg59701029/ai-prompt-lab/issues/2)
- [#3 Add learning prompt template](https://github.com/greg59701029/ai-prompt-lab/issues/3)
- [#4 Improve accessibility coverage](https://github.com/greg59701029/ai-prompt-lab/issues/4)

## License

MIT
