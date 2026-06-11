# Maintainer Notes

AI Prompt Lab is intentionally small. The project should remain useful without requiring a framework, build step, account, API key, or paid service.

## Project Principles

- Keep the app static and easy to inspect.
- Prefer clear prompt structure over model-specific tricks.
- Treat templates as practical workflows, not marketing copy.
- Keep user content local unless a future feature clearly asks for external integration.
- Make every user-facing feature easy to test with the smoke test.
- Keep the live demo deployable from `main` with GitHub Pages.
- Describe quality scoring as a heuristic checklist, not as AI evaluation.

## Non-Goals

- This is not a hosted prompt marketplace.
- This is not a replacement for model evaluation.
- This should not collect analytics or prompt content by default.
- This should not require an AI provider account to be useful.

## Review Checklist

- Does the change work by opening `index.html` directly?
- Does the smoke test pass?
- Do the prompt core unit tests pass in CI?
- Is the new template editable and model-agnostic?
- Does the README still describe the current behavior?
- Does the change avoid storing secrets or sending prompt content externally?
