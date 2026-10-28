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
  await page.getByLabel("Your dialogue or action").press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "Local model unavailable" })).toBeVisible();
  await expect(page.getByLabel("Your dialogue or action")).toHaveValue("I ask about the bell.");
  await expect(page.getByLabel("Your dialogue or action")).toBeFocused();
  await expect(page.locator("article")).toHaveCount(0);
  await expect(page.locator(".transcript").getByRole("status")).toHaveCount(0);
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

test("chat shortcuts preserve newlines and composition, send once, and scroll completed replies", async ({ page }) => {
  let current: any, chats = 0;
  const sent: string[] = [];
  let releaseReply!: () => void;
  const pendingReply = new Promise<void>(resolve => { releaseReply = resolve; });
  let releaseFailure!: () => void;
  const pendingFailure = new Promise<void>(resolve => { releaseFailure = resolve; });
  await page.route("**/api/local", async route => {
    const body = route.request().postDataJSON();
    if (body.action === "project") {
      await route.fulfill({ json: { projection: null, runtime: null } });
    } else if (body.action === "chat") {
      chats++;
      const turn = chats;
      sent.push(body.text);
      if (turn === 1) await pendingReply;
      if (turn === 3) {
        await pendingFailure;
        await route.fulfill({ status: 400, json: { error: "Synthetic send failure" } });
        return;
      }
      current.checkpoint.transcript.push(
        { id: `u-${turn}`, role: "user", content: body.text },
        { id: `a-${turn}`, role: "assistant", content: Array.from({ length: 50 }, (_, i) => `Synthetic reply ${turn}, line ${i + 1}.`).join("\n") }
      );
      await route.fulfill({ json: current });
    } else {
      const response = await route.fetch();
      if (body.action === "import" || body.action === "select") current = await response.json();
      await route.fulfill({ response });
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Load synthetic chapter" }).click();
  const composer = page.getByLabel("Your dialogue or action"), transcript = page.locator(".transcript");
  await expect(composer).toBeEnabled();
  await page.getByLabel("Mode", { exact: true }).selectOption("talk_to_character");
  await expect(composer).toBeEnabled();
  await composer.press("Enter");
  await composer.fill("   ");
  await composer.press("Enter");
  await composer.fill("First line");
  await composer.press("Shift+Enter");
  await composer.pressSequentially("Second line");
  await expect(composer).toHaveValue("First line\nSecond line");
  await composer.dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  await composer.dispatchEvent("keydown", { key: "Enter", code: "Enter", keyCode: 229 });
  await composer.dispatchEvent("keydown", { key: "Enter", code: "Enter", repeat: true });
  expect(chats).toBe(0);
  await composer.press("Enter");
  await expect(composer).toBeDisabled();
  await expect(composer).toHaveValue("");
  await expect(transcript.locator("article")).toHaveCount(1);
  await expect(transcript.locator("article.user p")).toHaveText("First line\nSecond line");
  await expect(transcript.getByRole("status")).toHaveText("Mara Venn is typing");
  await expect(page.getByLabel("Conversation progress")).toContainText("Completed exchanges: 0");
  expect(sent).toEqual(["First line\nSecond line"]);
  await composer.evaluate(el => el.closest("form")!.requestSubmit());
  expect(chats).toBe(1);
  releaseReply();
  await expect(composer).toBeEnabled();
  await expect(composer).toHaveValue("");
  await expect(composer).toBeFocused();
  await expect(transcript.locator("article")).toHaveCount(2);
  await expect(transcript.getByRole("status")).toHaveCount(0);
  await expect(transcript.locator("article.user")).toHaveCount(1);
  await expect.poll(() => transcript.evaluate(el => el.scrollHeight > el.clientHeight && el.scrollHeight - el.clientHeight - el.scrollTop <= 1)).toBe(true);

  await transcript.evaluate(el => { el.scrollTop = 0; });
  await composer.fill("Another message");
  const refreshed = page.waitForResponse(r => r.url().endsWith("/api/local") && r.request().postDataJSON().action === "project");
  await page.getByRole("button", { name: "Refresh runtime metrics" }).click();
  await refreshed;
  await expect.poll(() => transcript.evaluate(el => el.scrollTop)).toBe(0);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(transcript.locator("article")).toHaveCount(4);
  await expect(transcript.getByRole("status")).toHaveCount(0);
  await expect(composer).toBeFocused();
  await expect.poll(() => transcript.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThanOrEqual(1);
  expect(sent).toEqual(["First line\nSecond line", "Another message"]);

  await composer.fill("Keep this if sending fails.");
  await composer.press("Enter");
  await expect(composer).toHaveValue("");
  await expect(transcript.locator("article")).toHaveCount(5);
  await expect(transcript.getByRole("status")).toBeVisible();
  await expect.poll(() => transcript.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThanOrEqual(1);
  releaseFailure();
  await expect(page.getByRole("alert").filter({ hasText: "Synthetic send failure" })).toBeVisible();
  await expect(composer).toHaveValue("Keep this if sending fails.");
  await expect(composer).toBeFocused();
  await expect(transcript.locator("article")).toHaveCount(4);
  await expect(transcript.getByRole("status")).toHaveCount(0);
  await composer.press("Enter");
  await expect(transcript.locator("article")).toHaveCount(6);
  await expect(composer).toHaveValue("");
  await expect(composer).toBeFocused();
  await expect(page.getByLabel("Conversation progress")).toContainText("Completed exchanges: 3");
});
