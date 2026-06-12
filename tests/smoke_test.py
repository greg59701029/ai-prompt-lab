from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def assert_contains(text, expected, path):
    if expected not in text:
        raise AssertionError(f"{path} is missing {expected!r}")


def main():
    html = read("index.html")
    css = read("styles.css")
    js = read("app.js")

    required_files = [
        "index.html",
        "styles.css",
        "app.js",
        "prompt-core.js",
        "tests/prompt_core.test.js",
        "README.md",
        "README.zh-TW.md",
        "CHANGELOG.md",
        "SECURITY.md",
        "CONTRIBUTING.md",
        "examples/product-preset.json",
        ".github/ISSUE_TEMPLATE/bug_report.yml",
        ".github/ISSUE_TEMPLATE/feature_request.yml",
        ".github/workflows/pages.yml",
    ]

    for path in required_files:
        if not (ROOT / path).exists():
            raise AssertionError(f"{path} does not exist")

    assert_contains(html, 'link rel="stylesheet" href="styles.css"', "index.html")
    assert_contains(html, 'script defer src="prompt-core.js"', "index.html")
    assert_contains(html, 'script defer src="app.js"', "index.html")
    assert_contains(html, 'id="prompt-output"', "index.html")
    assert_contains(html, 'data-template="product"', "index.html")
    assert_contains(html, 'data-template="code"', "index.html")
    assert_contains(html, 'data-template="research"', "index.html")
    assert_contains(html, 'data-template="marketing"', "index.html")
    assert_contains(html, 'data-template="support"', "index.html")
    assert_contains(html, 'data-template="data"', "index.html")
    assert_contains(html, 'id="word-count"', "index.html")
    assert_contains(html, 'id="char-count"', "index.html")
    assert_contains(html, 'id="import-preset-btn"', "index.html")
    assert_contains(html, 'id="export-preset-btn"', "index.html")
    assert_contains(html, 'id="preset-file-input"', "index.html")

    assert_contains(css, ".workspace", "styles.css")
    assert_contains(css, ".stats-grid", "styles.css")
    assert_contains(css, ".preset-row", "styles.css")
    assert_contains(css, "@media (max-width: 760px)", "styles.css")

    assert_contains(js, "PromptLabCore", "app.js")
    core = read("prompt-core.js")

    assert_contains(core, "function buildPrompt", "prompt-core.js")
    assert_contains(core, "function scorePrompt", "prompt-core.js")
    assert_contains(core, "function serializePreset", "prompt-core.js")
    assert_contains(core, "function parsePresetJson", "prompt-core.js")
    assert_contains(core, "Success criteria or evidence is mentioned", "prompt-core.js")
    assert_contains(core, "Uncertainty or follow-up is handled", "prompt-core.js")
    assert_contains(js, "function updateStats", "app.js")
    assert_contains(js, "function exportPreset", "app.js")
    assert_contains(js, "function importPreset", "app.js")
    assert_contains(core, "Lifecycle marketing strategist", "prompt-core.js")
    assert_contains(core, "Customer support operations specialist", "prompt-core.js")
    assert_contains(core, "Product data analyst", "prompt-core.js")
    assert_contains(js, "localStorage", "app.js")

    disallowed = ["eval(", "new Function(", "document.write("]
    for path, text in [("app.js", js), ("prompt-core.js", core)]:
        for token in disallowed:
            if token in text:
                raise AssertionError(f"{path} should not use {token}")

    print("Smoke test passed")


if __name__ == "__main__":
    main()
