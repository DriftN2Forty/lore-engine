import { test, expect } from "@playwright/test";
import fixture from "../../fixtures/synthetic.chapter-01.json";
test("synthetic import, all options, checkpoint resume, reset, inert rendering and recoverable model failure", async ({ page }) => {
  // Real Next API/importer; fault-inject chat to avoid dispatching to the author's model.
  await page.route("**/api/local", async route => {
    const body = route.request().postDataJSON();
    if (body.action === "chat") await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Local model unavailable (browser fault fixture)" }) });
    else await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Load synthetic chapter" }).click();
  await expect(page.getByRole("heading", { name: fixture.story.title })).toBeVisible();
  await page.getByLabel("Your dialogue or action").fill("I ask about the bell.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Local model unavailable" })).toBeVisible();
  await expect(page.getByLabel("Your dialogue or action")).toHaveValue("I ask about the bell.");
  await expect(page.locator("article")).toHaveCount(0);
  await expect(page.getByText("A brass replacement pin is in the blue tool drawer.", { exact: false })).not.toBeVisible();
  for (const mode of ["talk_to_character", "play_as_character"]) {
    await page.getByLabel("Mode", { exact: true }).selectOption(mode);
    await expect(page.getByLabel("Mode", { exact: true })).toBeEnabled();
    for (const character of ["mara", "ivo"]) {
      await page.getByLabel("Character", { exact: true }).selectOption(character);
      await expect(page.getByLabel("Character", { exact: true })).toBeEnabled();
      await expect(page.getByLabel("Character", { exact: true })).toHaveValue(character);
    }
  }
  const saved = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save checkpoint" }).click();
  const download = await saved;
  const file = await download.path();
  if (!file) throw new Error("No checkpoint download");
  await page.getByLabel("Resume checkpoint").setInputFiles(file);
  await expect(page.getByRole("button", { name: "Reset to snapshot" })).toBeEnabled();
  await page.getByRole("button", { name: "Reset to snapshot" }).click();
  await expect(page.getByLabel("Your dialogue or action")).toHaveValue("");
  // Import an artifact containing markup; it must remain inert, with no remote load.
  const hostile = structuredClone(fixture);
  hostile.display.summary = '<img src="https://example.invalid/leak" onerror="alert(1)">';
  let remote = 0;
  page.on("request", r => { if (r.url().includes("example.invalid")) remote++; });
  await page.getByLabel("Import chapter JSON").setInputFiles({ name: "inert.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(hostile)) });
  await expect(page.getByText(hostile.display.summary, { exact: true })).toBeVisible();
  await expect(page.locator("img")).toHaveCount(0); expect(remote).toBe(0);
  const broken = { ...fixture, content_version: "<VERSION>" };
  await page.getByLabel("Import chapter JSON").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(broken)) });
  await expect(page.getByRole("alert").filter({ hasText: "Invalid" })).toBeVisible();
  await expect(page.getByText(hostile.display.summary, { exact: true })).toBeVisible();
});
