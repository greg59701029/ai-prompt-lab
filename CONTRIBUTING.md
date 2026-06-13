# Contributing

AI Prompt Lab is a small static app. Changes should stay easy to inspect and easy to run locally.

## Before Changing Code

- Check the open issue or describe the problem in the commit message.
- Keep templates model-agnostic.
- Keep prompt scoring deterministic. If a scoring rule changes, update the tests.

## Local Checks

```bash
python tests/smoke_test.py
node tests/prompt_core.test.js
npm run test:e2e
```

Playwright needs a one-time browser install:

```bash
npm install
npx playwright install --with-deps chromium
```

## Good Changes

- A real prompt workflow example
- A small template improvement with before/after behavior
- A focused accessibility fix
- A test for preset parsing, scoring, download, import, export, or history behavior
