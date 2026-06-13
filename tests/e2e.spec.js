const fs = require("fs");
const os = require("os");
const path = require("path");
const { expect, test } = require("@playwright/test");

async function tabTo(page, locator, maxTabs = 30) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press("Tab");
    const isFocused = await locator.evaluate((element) => element === document.activeElement);

    if (isFocused) {
      return;
    }
  }

  throw new Error(`Could not tab to ${locator}`);
}

test("builds prompts from templates and updates quality stats", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Data" }).click();

  await expect(page.getByLabel("Generated prompt")).toHaveValue(/Product data analyst/);
  await expect(page.getByText("Strong")).toBeVisible();
  await expect(page.getByRole("meter", { name: "Prompt quality" })).toHaveAttribute(
    "aria-valuenow",
    "100"
  );
  await expect(page.locator("#word-count")).not.toHaveText("0");
});

test("supports keyboard workflow for template, copy, import, and export", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");

  const copyButton = page.getByRole("button", { name: "Copy" });
  await tabTo(page, copyButton);
  await copyButton.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Copied");

  const learningButton = page.getByRole("button", { name: "Learning" });
  await tabTo(page, learningButton);
  await learningButton.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Learning template");
  await expect(page.getByLabel("Generated prompt")).toHaveValue(/Learning coach/);

  const presetPath = path.join(os.tmpdir(), `ai-prompt-lab-keyboard-${Date.now()}.json`);
  fs.writeFileSync(
    presetPath,
    JSON.stringify({
      role: "Keyboard tester",
      goal: "Check keyboard-only preset import with a measurable result.",
      audience: "Maintainer testing accessibility workflows",
      context: "The test should prove that the visible import button can open the file picker.",
      constraints: "Include follow-up questions and call out missing evidence.",
      tone: "technical and precise",
      format: "short report with recommendation",
    })
  );

  const importPresetButton = page.getByRole("button", { name: "Import preset" });
  await tabTo(page, importPresetButton);
  const fileChooserPromise = page.waitForEvent("filechooser");
  await importPresetButton.press("Enter");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(presetPath);
  await expect(page.getByRole("status")).toHaveText("Preset imported");
  await expect(page.locator("#role-input")).toHaveValue("Keyboard tester");

  const exportPresetButton = page.getByRole("button", { name: "Export preset" });
  await tabTo(page, exportPresetButton);
  const downloadPromise = page.waitForEvent("download");
  await exportPresetButton.press("Enter");
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("ai-prompt-lab-preset.json");
});

test("quality checklist exposes text state instead of color alone", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await expect(page.getByLabel("Prompt quality checklist")).toBeVisible();
  await expect(page.locator("#checklist li[data-status='missing']")).toHaveCount(7);
  await expect(page.locator("#checklist li[data-status='pass']")).toHaveCount(1);
  await expect(page.locator("#checklist .check-state").first()).toHaveText("Missing");
  await expect(page.locator("#checklist .check-state").first()).toHaveAttribute(
    "aria-label",
    "Missing"
  );
});

test("downloads prompt text and records local history", async ({ page }) => {
  await page.goto("/");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download" }).click();
  const download = await downloadPromise;
  const promptText = fs.readFileSync(await download.path(), "utf-8");

  expect(download.suggestedFilename()).toBe("ai-prompt.txt");
  expect(promptText).toContain("Senior product strategist");
  await expect(page.getByRole("status")).toHaveText("Downloaded");
  await expect(page.locator("#history-list button")).toHaveCount(1);
  await expect(page.locator("#history-list button").first()).toHaveText("Role");
});

test("rejects invalid preset JSON without replacing current fields", async ({ page }) => {
  await page.goto("/");

  const presetPath = path.join(os.tmpdir(), `ai-prompt-lab-invalid-${Date.now()}.json`);
  fs.writeFileSync(presetPath, "{");

  await page.setInputFiles("#preset-file-input", presetPath);

  await expect(page.getByRole("status")).toHaveText("Import failed");
  await expect(page.locator("#role-input")).toHaveValue("Senior product strategist");
  await expect(page.getByLabel("Generated prompt")).toHaveValue(/Senior product strategist/);
});

test("reports when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("storage disabled for test");
    };
  });

  await page.goto("/");

  await expect(page.getByRole("status")).toHaveText("Not saved");
  await page.locator("#goal-input").fill("Draft a short test prompt with a measurable result.");
  await expect(page.getByRole("status")).toHaveText("Not saved");
});

test("imports and exports editable preset JSON", async ({ page }) => {
  await page.goto("/");

  const presetPath = path.join(os.tmpdir(), `ai-prompt-lab-${Date.now()}.json`);
  fs.writeFileSync(
    presetPath,
    JSON.stringify({
      role: "Learning coach",
      goal: "Create a study plan with milestones and weekly review checkpoints.",
      audience: "Student preparing for a technical interview",
      context: "The learner has four weeks and can study one hour per day.",
      constraints: "Include measurable outcomes, practice tasks, and follow-up questions.",
      tone: "friendly and concise",
      format: "step-by-step plan",
    })
  );

  await page.setInputFiles("#preset-file-input", presetPath);
  await expect(page.getByRole("status")).toHaveText("Preset imported");
  await expect(page.locator("#role-input")).toHaveValue("Learning coach");
  await expect(page.getByLabel("Generated prompt")).toHaveValue(/Learning coach/);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export preset" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(fs.readFileSync(await download.path(), "utf-8"));

  expect(download.suggestedFilename()).toBe("ai-prompt-lab-preset.json");
  expect(exported.type).toBe("ai-prompt-lab/preset");
  expect(exported.preset.role).toBe("Learning coach");
});
