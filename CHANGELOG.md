# Changelog

All notable changes to AI Prompt Lab are documented here.

## Unreleased

- Reworked README language to describe current status, known limitations, and real example workflows
- Removed publishing, profile, and issue-draft documents that were no longer useful after the repository went live
- Repaired the Traditional Chinese README
- Fixed the save status shown when browser storage is unavailable
- Added behavior-focused tests for verbose prompt scoring, empty prompt scoring, invalid preset import, prompt download, and local storage failure

## 0.4.0 - 2026-06-13

- Added JSON preset export for saving editable builder state
- Added JSON preset import with validation and unsupported-field filtering
- Added a sample preset file under `examples/product-preset.json`
- Added unit tests for preset serialization, plain-object imports, and invalid input handling
- Documented the difference between prompt text downloads and preset exports
- Added README screenshot and status badges
- Added Playwright E2E coverage for template selection and preset workflows
- Added accessibility improvements for status announcements, generated prompt labeling, and quality meter semantics
- Added release notes for v0.4.0

## 0.3.0 - 2026-06-12

- Added GitHub Pages deployment workflow
- Added a shared `prompt-core.js` module for prompt generation and scoring
- Added Node-based prompt core unit tests for prompt output, scoring behavior, template quality, and stats
- Clarified that the quality score is a deterministic heuristic, not AI evaluation
- Added live demo link to English and Traditional Chinese READMEs

## 0.2.0 - 2026-06-12

- Added marketing, support, and data analysis prompt templates
- Added word and character counts for generated prompts
- Added Traditional Chinese project README
- Added GitHub issue templates, pull request template, and security policy
- Expanded smoke tests for templates and prompt statistics

## 0.1.0 - 2026-06-12

- Added the static prompt builder app
- Added quality scoring, copy, download, and local history
- Added project documentation, examples, MIT license, and CI smoke test
