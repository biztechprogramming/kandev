import { expect, test } from "../../fixtures/test-base";

test.describe("Settings composition", () => {
  test("task behavior keeps its four groups ordered and runtime collapsed", async ({
    testPage,
  }) => {
    await testPage.goto("/settings/preferences/task-behavior");

    const groups = testPage.getByTestId("task-behavior-group");
    await expect(groups).toHaveCount(3);
    await expect(groups.nth(0)).toContainText("Creating and opening tasks");
    await expect(groups.nth(1)).toContainText("Conversation and panels");
    await expect(groups.nth(2)).toContainText("Archiving");

    const runtime = testPage.getByTestId("task-behavior-runtime");
    const disclosure = runtime.locator("details");
    await expect(disclosure).not.toHaveAttribute("open", "");
    await expect(runtime).toContainText("Applies to everyone");
    await expect(runtime).toContainText("Automatic sessions:");
    await expect(runtime).toContainText("Queued messages:");

    await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(testPage.getByTestId("message-queue-settings")).toBeVisible();
    await expect(testPage.getByTestId("session-capacity-settings")).toBeVisible();

    await disclosure.locator("summary").click();
    await expect(disclosure).not.toHaveAttribute("open", "");
  });

  test("task behavior search reopens the runtime after it is manually collapsed", async ({
    testPage,
  }) => {
    await testPage.goto("/settings/preferences/task-behavior#setting-message-queue");

    const runtime = testPage.getByTestId("task-behavior-runtime");
    const disclosure = runtime.locator("details");
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(testPage.getByTestId("message-queue-max-per-session")).toBeVisible();

    await disclosure.locator("summary").click();
    await expect(disclosure).not.toHaveAttribute("open", "");

    const search = testPage
      .getByTestId("app-sidebar-settings-mode")
      .getByRole("searchbox", { name: "Search settings" });
    await search.fill("message queue");
    await testPage
      .getByTestId("app-sidebar-settings-mode")
      .getByRole("link")
      .filter({ hasText: /^Message Queue/ })
      .click();

    await expect(testPage.getByTestId("message-queue-max-per-session")).toBeVisible();
    await expect(disclosure).toHaveAttribute("open", "");
  });

  test("preferences keep notification surfaces inside shared groups", async ({ testPage }) => {
    await testPage.goto("/settings/preferences/notifications");

    await expect(testPage.getByRole("heading", { level: 2, name: "Notifications" })).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').first()).toBeVisible();
    expect(await testPage.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await testPage.evaluate(() => document.documentElement.clientWidth),
    );
  });

  test("appearance, notifications, and editors keep one frame per group", async ({ testPage }) => {
    await testPage.goto("/settings/preferences/appearance");
    const themeRow = testPage.getByTestId("theme-settings-card");
    await expect(themeRow).toHaveAttribute("data-settings-row", "true");
    await expect(themeRow.locator('[data-slot="card"]')).toHaveCount(0);
    await expect(
      themeRow.locator('xpath=ancestor::*[@data-settings-group-card="true"]'),
    ).toHaveCount(1);

    const changesRow = testPage.getByTestId("changes-panel-layout-card");
    const changesTrigger = changesRow.getByTestId("changes-panel-layout-select");
    const changesDescriptionId = await changesTrigger.getAttribute("aria-describedby");
    expect(changesDescriptionId).toBeTruthy();
    await expect(changesRow.locator(`[id="${changesDescriptionId}"]`)).toBeVisible();

    await testPage.goto("/settings/preferences/notifications");
    const notificationsContent = testPage.locator('[data-settings-page-content="true"]');
    await expect(notificationsContent).toBeVisible();
    await expect(notificationsContent.locator(':scope > [data-slot="card"]')).toHaveCount(0);
    await expect(notificationsContent.locator('[data-settings-group="true"]')).toHaveCount(4);

    await testPage.goto("/settings/preferences/terminal-editors");
    const editorContent = testPage.locator('[data-settings-page-content="true"]').last();
    await expect(editorContent).toBeVisible();
    await expect(editorContent.locator(':scope > [data-slot="card"]')).toHaveCount(0);
    await expect(editorContent.locator('[data-settings-group="true"]')).toHaveCount(2);
  });

  test("agent executor surfaces keep resource and create groups visible", async ({ testPage }) => {
    await testPage.goto("/settings/agents");
    await expect(testPage.getByTestId("installed-agents-actions")).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').first()).toBeVisible();

    await testPage.goto("/settings/executors");
    await expect(testPage.getByRole("heading", { level: 2, name: "Executors" })).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').last()).toBeVisible();
  });

  test("workspace integration surfaces keep tabs and group chrome intact", async ({
    testPage,
    seedData,
  }) => {
    await testPage.goto(`/settings/workspaces/${seedData.workspaceId}/repositories`);
    await expect(testPage.getByTestId("workspace-settings-shell")).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').first()).toBeVisible();

    await testPage.goto(`/settings/workspaces/${seedData.workspaceId}/integrations/github`);
    await expect(testPage.getByTestId("workspace-settings-shell")).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').first()).toBeVisible();
  });

  test("system account surfaces keep table and token groups discoverable", async ({ testPage }) => {
    await testPage.goto("/settings/system/users");
    await expect(testPage.getByTestId("users-table-card")).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').first()).toBeVisible();

    await testPage.goto("/settings/account/tokens");
    await expect(testPage.getByTestId("api-tokens-card")).toBeVisible();
    await expect(testPage.locator('[data-settings-group="true"]').first()).toBeVisible();
  });
});
