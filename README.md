# AI Prompt Lab

A lightweight browser tool for turning rough AI tasks into structured prompts.

The app runs as a static site with no build step, no API key, and no backend. It is designed for quick prompt drafting, quality checks, and exporting prompts for ChatGPT, Claude, Gemini, Copilot, or any other AI assistant.

![CI](https://github.com/greg59701029/ai-prompt-lab/actions/workflows/ci.yml/badge.svg)

## Features

- Structured prompt builder for role, goal, audience, context, constraints, tone, and output format
- Ready-made templates for product planning, coding tasks, and research summaries
- Prompt quality score with simple checks for specificity and ambiguity
- One-click copy and text download
- Local recent prompt history with browser storage
- Static deployment friendly for GitHub Pages, Vercel, Netlify, or any web host

## Demo

Open `index.html` in a browser, or run a local server:

```bash
python -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
├── examples/
│   └── prompts.md
├── tests/
│   └── smoke_test.py
└── .github/
    └── workflows/
        └── ci.yml
```

## Why This Exists

Most prompt examples are either too vague or too tied to a single model. This project focuses on a reusable structure that helps users define the task, context, constraints, and output format before sending a prompt to an AI system.

## Development

Run the smoke test:

```bash
python tests/smoke_test.py
```

The test verifies that the static app includes its core assets, expected UI targets, templates, and basic safety checks.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Open the repository settings.
3. Go to **Pages**.
4. Select the `main` branch and `/root`.
5. Save and wait for the Pages URL.

## Roadmap

- Add import and export for reusable prompt presets
- Add a small prompt diff view
- Add optional OpenAI-compatible API preview mode
- Add keyboard shortcuts for power users

## License

MIT
