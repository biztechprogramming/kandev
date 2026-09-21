import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runtimeMocks = vi.hoisted(() => ({
  queue: {
    snapshot: null,
    loading: true,
    loadFailed: false,
    saveFailed: false,
    invalidReason: undefined as string | undefined,
    isDirty: false,
  },
  session: {
    snapshot: null,
    loading: true,
    loadFailed: false,
    saveFailed: false,
    invalidReason: undefined as string | undefined,
    isDirty: false,
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./agent-generated-task-title-settings", () => ({
  AgentGeneratedTaskTitleSettings: () => null,
}));
vi.mock("./anchored-prompt-bar-settings", () => ({ AnchoredPromptBarSettings: () => null }));
vi.mock("./archive-confirmation-settings", () => ({ ArchiveConfirmationSettings: () => null }));
vi.mock("./creation-auto-focus-settings", () => ({ CreationAutoFocusSettings: () => null }));
vi.mock("./mcp-task-agent-profile-default-settings", () => ({
  MCPTaskAgentProfileDefaultSettings: () => null,
}));
vi.mock("./prevent-auto-start-agent-settings", () => ({
  PreventAutoStartAgentSettings: () => null,
}));
vi.mock("./sleep-inhibition-settings", () => ({
  SleepInhibitionSettings: ({
    onAttentionChange,
  }: {
    onAttentionChange?: (needsAttention: boolean) => void;
  }) => (
    <button type="button" data-testid="sleep-attention" onClick={() => onAttentionChange?.(true)} />
  ),
}));
vi.mock("./todo-list-panel-settings", () => ({ TodoListPanelSettings: () => null }));
vi.mock("./unread-divider-settings", () => ({ UnreadDividerSettings: () => null }));
vi.mock("./system/message-queue-settings", () => ({
  MessageQueueSettingsContent: () => <div data-testid="message-queue" />,
  useMessageQueueSettingsDraft: () => runtimeMocks.queue,
}));
vi.mock("./system/session-capacity-settings", () => ({
  SessionCapacitySettingsContent: () => <div data-testid="session-capacity" />,
}));
vi.mock("./system/use-session-capacity-settings", () => ({
  useSessionCapacitySettings: () => runtimeMocks.session,
}));

import { TaskBehaviorSettings } from "./task-behavior-settings";

beforeEach(() => {
  runtimeMocks.queue.loadFailed = false;
  runtimeMocks.queue.saveFailed = false;
  runtimeMocks.queue.invalidReason = undefined;
  runtimeMocks.queue.isDirty = false;
  runtimeMocks.session.loadFailed = false;
  runtimeMocks.session.saveFailed = false;
  runtimeMocks.session.invalidReason = undefined;
  runtimeMocks.session.isDirty = false;
});

afterEach(cleanup);

const RUNTIME_GROUP_TEST_ID = "task-behavior-runtime";

describe("TaskBehaviorSettings composition", () => {
  it("renders the four activity groups in order with runtime closed", () => {
    render(<TaskBehaviorSettings />);

    expect(
      [
        ...screen.getAllByTestId("task-behavior-group"),
        screen.getByTestId(RUNTIME_GROUP_TEST_ID),
      ].map((group) => group.textContent),
    ).toEqual([
      expect.stringContaining("settings:taskBehaviorCreating"),
      expect.stringContaining("settings:taskBehaviorConversation"),
      expect.stringContaining("settings:taskBehaviorArchiving"),
      expect.stringContaining("settings:taskBehaviorRuntime"),
    ]);
    expect(screen.getByTestId(RUNTIME_GROUP_TEST_ID).querySelector("details")?.open).toBe(false);
  });

  it.each([
    ["initial load failure", "queue", "loadFailed"],
    ["invalid queue draft", "queue", "invalidReason"],
    ["asynchronous session save rejection", "session", "saveFailed"],
  ])("reveals runtime for %s", (_name, owner, stateKey) => {
    const state = runtimeMocks[owner as "queue" | "session"] as Record<string, unknown>;
    state[stateKey] = stateKey === "invalidReason" ? "invalid" : true;
    if (stateKey !== "loadFailed") state.isDirty = true;

    render(<TaskBehaviorSettings />);

    expect(screen.getByTestId(RUNTIME_GROUP_TEST_ID).querySelector("details")?.open).toBe(true);
  });

  it("reveals runtime when a save failure arrives after a manual collapse", () => {
    const view = render(<TaskBehaviorSettings />);
    const runtime = screen.getByTestId(RUNTIME_GROUP_TEST_ID);
    const details = runtime.querySelector("details")!;
    fireEvent.click(details.querySelector("summary")!);
    fireEvent.click(details.querySelector("summary")!);
    expect(details.open).toBe(false);

    runtimeMocks.queue.saveFailed = true;
    view.rerender(<TaskBehaviorSettings />);

    expect(details.open).toBe(true);
  });

  it.each(["queue", "session"] as const)("passes %s dirty state to the runtime group", (owner) => {
    runtimeMocks[owner].isDirty = true;
    render(<TaskBehaviorSettings />);
    const runtime = screen.getByTestId(RUNTIME_GROUP_TEST_ID);
    expect(runtime.getAttribute("data-settings-dirty")).toBe("true");
    expect(screen.getByRole("status").textContent).toBe("common:unsavedChanges");
  });

  it("reveals runtime when sleep reports attention after a manual collapse", () => {
    const view = render(<TaskBehaviorSettings />);
    const runtime = screen.getByTestId(RUNTIME_GROUP_TEST_ID);
    const details = runtime.querySelector("details")!;
    fireEvent.click(details.querySelector("summary")!);
    fireEvent.click(screen.getByTestId("sleep-attention"));
    view.rerender(<TaskBehaviorSettings />);
    expect(details.open).toBe(true);
  });
});
