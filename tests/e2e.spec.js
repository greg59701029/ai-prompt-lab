const fs = require("fs");
const os = require("os");
const path = require("path");
const { expect, test } = require("@playwright/test");

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
