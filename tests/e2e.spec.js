const fs = require("fs");
const os = require("os");
const path = require("path");
const { expect, test } = require("@playwright/test");

test("builds prompts from templates and updates quality stats", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Data" }).click();

  await expect(page.getByLabel("Generated prompt")).toHaveValue(/Product data analyst/);
  await expect(page.getByText("Strong")).toBeVisible();
  await expect(page.getByRole("meter", { name: "Prompt quality" })).toHaveAttribute("aria-valuenow", "100");
  await expect(page.locator("#word-count")).not.toHaveText("0");
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
