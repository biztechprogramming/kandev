import type { Page } from "@playwright/test";

export async function openTaskBehaviorRuntime(page: Page): Promise<void> {
  const disclosure = page.getByTestId("task-behavior-runtime").locator("details");
  if ((await disclosure.getAttribute("open")) === null) {
    await disclosure.locator("summary").click();
  }
}
