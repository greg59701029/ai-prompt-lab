# Roadmap Issue Drafts

These are ready-to-open GitHub issue drafts for the next maintenance cycle.

## Add GitHub Pages Demo

Verify and document the GitHub Pages deployment so users can try AI Prompt Lab without cloning the repository.

Acceptance criteria:

- The `Deploy GitHub Pages` workflow succeeds
- README includes the live demo URL
- The deployed page loads `index.html`, `styles.css`, and `app.js`
- Smoke test still passes locally

Suggested labels: `enhancement`, `documentation`

## Establish a Real Maintenance Cadence

Avoid artificial commit history. Build credibility through small, useful updates over time.

Acceptance criteria:

- Ship one small template, test, documentation, or accessibility improvement per maintenance session
- Keep `CHANGELOG.md` updated for user-facing changes
- Prefer meaningful commits over commit-count padding
- Review open roadmap drafts before adding new features

Suggested labels: `maintenance`

## Add Prompt Preset Import and Export

Allow users to save reusable prompt presets as JSON and import them later.

Acceptance criteria:

- Export includes role, goal, audience, context, constraints, tone, and output format
- Import validates the JSON shape before updating the form
- Invalid JSON shows a clear status message
- Smoke test covers import/export UI targets

Suggested labels: `enhancement`

## Add Learning Template

Add a template for study plans, tutoring, and self-directed learning workflows.

Acceptance criteria:

- Template appears in the builder
- Example is added to `examples/prompts.md`
- README feature list remains accurate
- Smoke test checks the new template target

Suggested labels: `good first issue`, `templates`

## Improve Quality Scoring

Expand the quality checklist so it identifies missing assumptions, success criteria, and uncertainty handling.

Acceptance criteria:

- Checklist includes at least two new checks
- Score behavior remains understandable
- `docs/maintainer-notes.md` documents the scoring principle
- Smoke test covers the new scoring code path

Suggested labels: `enhancement`, `quality`
