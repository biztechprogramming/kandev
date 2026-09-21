"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { AgentGeneratedTaskTitleSettings } from "@/components/settings/agent-generated-task-title-settings";
import { AnchoredPromptBarSettings } from "@/components/settings/anchored-prompt-bar-settings";
import { ArchiveConfirmationSettings } from "@/components/settings/archive-confirmation-settings";
import { CreationAutoFocusSettings } from "@/components/settings/creation-auto-focus-settings";
import { MCPTaskAgentProfileDefaultSettings } from "@/components/settings/mcp-task-agent-profile-default-settings";
import { PreventAutoStartAgentSettings } from "@/components/settings/prevent-auto-start-agent-settings";
import { SettingsGroup } from "@/components/settings/settings-group";
import { SettingsTarget } from "@/components/settings/settings-target";
import { SleepInhibitionSettings } from "@/components/settings/sleep-inhibition-settings";
import { TodoListPanelSettings } from "@/components/settings/todo-list-panel-settings";
import { UnreadDividerSettings } from "@/components/settings/unread-divider-settings";
import {
  MessageQueueSettingsContent,
  useMessageQueueSettingsDraft,
} from "@/components/settings/system/message-queue-settings";
import { SessionCapacitySettingsContent } from "@/components/settings/system/session-capacity-settings";
import { useSessionCapacitySettings } from "@/components/settings/system/use-session-capacity-settings";
import { GENERAL_SETTINGS_TARGETS } from "@/lib/settings-discovery/catalog/preferences";
import { formatEffectiveLimit, type EffectiveLimit } from "./task-behavior-settings-state";

type MessageQueueState = ReturnType<typeof useMessageQueueSettingsDraft>;
type SessionCapacityState = ReturnType<typeof useSessionCapacitySettings>;

function queueEffectiveLimit(state: MessageQueueState): EffectiveLimit {
  if (!state.snapshot) return { status: state.loadFailed ? "unavailable" : "loading" };
  return {
    status: "ready",
    value: state.snapshot.effective.max_per_session,
    unlimited: state.snapshot.effective.max_per_session === 0,
  };
}

function sessionEffectiveLimit(state: SessionCapacityState): EffectiveLimit {
  if (!state.snapshot) return { status: state.loadFailed ? "unavailable" : "loading" };
  return {
    status: "ready",
    enabled: state.snapshot.effective.enabled,
    value: state.snapshot.effective.max_sessions,
  };
}

function RuntimeSummary({
  queueState,
  sessionState,
}: {
  queueState: MessageQueueState;
  sessionState: SessionCapacityState;
}) {
  const { t } = useTranslation();
  const labels = {
    loading: t("common:loading"),
    unavailable: t("common:unavailable"),
    unlimited: t("system:messageQueueUnlimited"),
    noLimit: t("system:sessionCapacityNoLimit"),
  };
  const sessions = formatEffectiveLimit(sessionEffectiveLimit(sessionState), labels);
  const queue = formatEffectiveLimit(queueEffectiveLimit(queueState), labels);

  return (
    <span data-testid="task-behavior-runtime-summary">
      {t("settings:taskBehaviorRuntimeSummary", { sessions, queue })}
    </span>
  );
}

/** Task behavior keeps related preferences on one page and groups them by use. */
export function TaskBehaviorSettings() {
  const { t } = useTranslation();
  const queueState = useMessageQueueSettingsDraft();
  const sessionState = useSessionCapacitySettings();
  const [sleepNeedsReveal, setSleepNeedsReveal] = useState(false);
  const runtimeRevealKey = [
    queueState.loadFailed && "queue-load",
    queueState.saveFailed && "queue-save",
    queueState.isDirty && queueState.invalidReason && "queue-invalid",
    sessionState.loadFailed && "session-load",
    sessionState.saveFailed && "session-save",
    sessionState.isDirty && sessionState.invalidReason && "session-invalid",
    sleepNeedsReveal && "sleep",
  ]
    .filter(Boolean)
    .join("|");

  return (
    <div className="space-y-6" data-testid="task-behavior-settings">
      <SettingsGroup
        title={t("settings:taskBehaviorCreating")}
        description={t("settings:taskBehaviorCreatingDescription")}
        titleTestId="task-behavior-creating-title"
        data-testid="task-behavior-group"
      >
        <CreationAutoFocusSettings presentation="row" />
        <AgentGeneratedTaskTitleSettings presentation="row" />
        <MCPTaskAgentProfileDefaultSettings presentation="row" />
        <PreventAutoStartAgentSettings presentation="row" />
      </SettingsGroup>

      <SettingsGroup
        title={t("settings:taskBehaviorConversation")}
        description={t("settings:taskBehaviorConversationDescription")}
        titleTestId="task-behavior-conversation-title"
        data-testid="task-behavior-group"
      >
        <UnreadDividerSettings presentation="row" />
        <AnchoredPromptBarSettings presentation="row" />
        <TodoListPanelSettings presentation="row" />
      </SettingsGroup>

      <SettingsGroup
        title={t("settings:taskBehaviorArchiving")}
        description={t("settings:taskBehaviorArchivingDescription")}
        titleTestId="task-behavior-archiving-title"
        data-testid="task-behavior-group"
      >
        <ArchiveConfirmationSettings presentation="row" />
      </SettingsGroup>

      <SettingsGroup
        title={t("settings:taskBehaviorRuntime")}
        description={t("settings:taskBehaviorRuntimeDescription")}
        titleTestId="task-behavior-runtime-title"
        summary={
          <>
            <RuntimeSummary queueState={queueState} sessionState={sessionState} />{" "}
            {t("settings:taskBehaviorRuntimeScope")}
          </>
        }
        collapsible
        defaultOpen={false}
        isDirty={queueState.isDirty || sessionState.isDirty}
        revealOn={runtimeRevealKey}
        data-testid="task-behavior-runtime"
      >
        <SettingsTarget targetId={GENERAL_SETTINGS_TARGETS.sessionCapacity}>
          <SessionCapacitySettingsContent state={sessionState} withinGroup />
        </SettingsTarget>
        <SettingsTarget targetId={GENERAL_SETTINGS_TARGETS.messageQueue}>
          <MessageQueueSettingsContent state={queueState} withinGroup />
        </SettingsTarget>
        <SleepInhibitionSettings withinGroup onAttentionChange={setSleepNeedsReveal} />
      </SettingsGroup>
    </div>
  );
}
