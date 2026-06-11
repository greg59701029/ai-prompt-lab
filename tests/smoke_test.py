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

    for path in ["index.html", "styles.css", "app.js", "README.md"]:
        if not (ROOT / path).exists():
            raise AssertionError(f"{path} does not exist")

    assert_contains(html, 'link rel="stylesheet" href="styles.css"', "index.html")
    assert_contains(html, 'script defer src="app.js"', "index.html")
    assert_contains(html, 'id="prompt-output"', "index.html")
    assert_contains(html, 'data-template="product"', "index.html")
    assert_contains(html, 'data-template="code"', "index.html")
    assert_contains(html, 'data-template="research"', "index.html")

    assert_contains(css, ".workspace", "styles.css")
    assert_contains(css, "@media (max-width: 760px)", "styles.css")

    assert_contains(js, "const templates", "app.js")
    assert_contains(js, "function buildPrompt", "app.js")
    assert_contains(js, "function scorePrompt", "app.js")
    assert_contains(js, "localStorage", "app.js")

    disallowed = ["eval(", "new Function(", "document.write("]
    for token in disallowed:
        if token in js:
            raise AssertionError(f"app.js should not use {token}")

    print("Smoke test passed")


if __name__ == "__main__":
    main()
