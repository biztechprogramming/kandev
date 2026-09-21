---
status: draft
system: ui
requirements:
  - REQ-UI-SETTINGS-COMPOSITION-001
  - REQ-UI-SETTINGS-COMPOSITION-002
  - REQ-UI-SETTINGS-COMPOSITION-003
  - REQ-UI-SETTINGS-COMPOSITION-004
---

# Settings Composition System Design

## Purpose and boundaries

This design owns reusable settings composition, including the Task behavior arrangement.
Existing domain components retain API calls, drafts, permissions, validation, and immediate commands.
No settings route, backend contract, or plugin API changes.

Existing sources establish the starting point:

- `apps/web/components/settings/task-behavior-settings.tsx` composes Task Actions, Message Queue, and Session capacity.
- `general-settings.tsx` mixes task creation, archiving, unread markers, and sleep prevention within Task Actions.
- `settings-card.tsx` owns card dirty markers and discovery registration.
- `settings-typography.tsx`, `settings-card-header.tsx`, and `settings-control.ts` already own shared visual roles.
- `settings-page-template.tsx` uses 32px vertical gaps, while `system/system-page-shell.tsx` uses 24px gaps.
- `creation-auto-focus-settings.tsx` repeats one label in a card heading and a toggle row.

## Requirement mapping

| Requirement | Design section |
| --- | --- |
| REQ-UI-SETTINGS-COMPOSITION-001 | Shared presentation and rollout |
| REQ-UI-SETTINGS-COMPOSITION-002 | Task behavior composition |
| REQ-UI-SETTINGS-COMPOSITION-003 | Disclosure lifetime and discovery |
| REQ-UI-SETTINGS-COMPOSITION-004 | Mobile and accessibility |

## Shared presentation and rollout

Reuse `SettingsPageHeader`, `SettingsSection`, `SettingsCardHeader`, `SettingsField`, and the settings sizing helpers.
Add small presentation compositions under `components/settings/`, provisionally `settings-group.tsx` and `settings-row.tsx`.
Do not create a schema-driven settings renderer or a second settings store.

A group has one semantic heading, optional description/action, and one outer `SettingsCard`.
Simple rows have no separate card frame or repeated title.
Use `SettingsSaveDirtyScope` for aggregate group markers while preserving each field marker.
Keep one discovery registration per existing target ID, attached to its actual row or subgroup.

Use three compositions:

| Composition | Shape | Use |
| --- | --- | --- |
| Preference group | Heading, bordered group, divided rows | Toggles and short selectors |
| Form group | Heading, bordered group, vertically related fields | Profiles, credentials, workspace forms |
| Resource group | Heading and actions, existing list or table | Repositories, agents, users, plugins |

Use a settings-local spacing contract: 24px between groups, 16px group padding, and 12px row vertical padding.
Use 8px label/control spacing in form fields and 4px label/helper spacing in compact rows.
These values use existing spacing tokens and root-font scaling.
Keep the current typography roles rather than introducing another font scale.
Ordinary desktop controls remain 28px. Touch controls retain at least 44px active targets.
Content rows grow with text and do not have a fixed height.
Use theme border and surface tokens without extra shadows or custom colors.

Use a single page heading followed by ordered group headings.
Allow `SettingsCardHeader` to use a heading level appropriate to its parent rather than hardcoding nested h3 headings.
Retain existing header tabs and action placement from the header-tabs contract.
Do not change global `@kandev/ui` Card styles or use broad descendant CSS to restyle unrelated components.

The [surface inventory](../../../plans/settings-composition/surface-inventory.md) assigns every first-party route family to a work order.
Within each family, inspect route imports and child forms, including dialogs reached from those pages.
Only shared typography, spacing, descriptions, and action composition change in dialogs.
Their lifecycle and primary submission controls remain intact.

## Task behavior composition

Keep `/settings/preferences/task-behavior`, its breadcrumb, and all legacy redirects.
Extract the Task Actions composition from `general-settings.tsx` or retire that wrapper after checking callers.
The individual stateful controls remain single-mounted domain owners.

| Group | Existing components in display order |
| --- | --- |
| Creating and opening tasks | `CreationAutoFocusSettings`, `AgentGeneratedTaskTitleSettings`, `MCPTaskAgentProfileDefaultSettings`, `PreventAutoStartAgentSettings` |
| Conversation and panels | `UnreadDividerSettings`, `AnchoredPromptBarSettings`, `TodoListPanelSettings` |
| Archiving | `ArchiveConfirmationSettings` |
| Runtime and limits | `SessionCapacitySettings`, `MessageQueueSettings`, `SleepInhibitionSettings` |

Replace each simple preference's card wrapper with a shared row in its owning group.
Keep compound options, previews, and permission notices as row details or form subgroups.
Queue controls retain distinct limits and merging subgroups without nested outer cards.

Use the short label “Open new tasks automatically” for the automatic-opening setting.
Keep the existing auto-start switch polarity to avoid an unrelated behavioral migration.
Use “Applies to everyone” for instance controls and identify the host for sleep prevention.
Keep manual-start exclusions, WIP independence, and environment/configuration locks beside their controls.
Only secondary technical details move into Details.

## Disclosure lifetime and discovery

Use native `details`/`summary` for the runtime group and secondary explanations.
The closed content remains mounted, so domain hooks and save contributors retain identity.
Closed descendants cannot receive keyboard focus.
Opening and closing are local presentation state with no storage or URL writes.

Lift the existing runtime draft-hook invocations into a single runtime-group owner where needed.
`system/use-session-capacity-settings.ts` already exports `useSessionCapacitySettings`.
Extract `useMessageQueueSettingsDraft` from `system/message-queue-settings.tsx` only when required for composition.
Pass each existing view its state instead of invoking its hook twice.
Retain the same contributor IDs, revisions, load behavior, and payload construction.
Do not introduce additional polling or fetches for the summary.

Derive the closed summary from loaded effective snapshots, not draft numeric strings.
Show automatic-session capacity, message-queue limit, and an unsaved marker when a descendant differs.
Loading or failed reads show translated Loading or Unavailable status for the affected value.
Zero means unlimited only under the existing queue contract.
Disabled automatic-session limits show no automatic-session limit.
Errors reveal the group once per new error transition, allowing users to close it afterward.
Invalid drafts reveal their group and retain existing Save-disabled feedback.

Extend `revealSettingsTarget` in `lib/settings-discovery/target.ts` to open enclosing native details before scrolling and focusing.
Reveal outer ancestors first. Preserve existing reduced-motion, settle, and highlight behavior.
Keep initial fragments, history navigation, and repeated `SETTINGS_TARGET_REQUEST_EVENT` requests on the existing registry path.
Do not add a separate target registry or navigation bypass.
Disabled controls retain focusable group fallback and a visible permission or lock explanation.

Collapsing a dirty group does not unregister its save contributors.
The existing save provider owns Reset, partial failure, in-flight edits, and navigation protection.
New save errors open the affected group. Other groups remain independent.

## Mobile and accessibility

The shipped `SettingsIndex` and `SettingsLayoutClient` provide the mobile entry point and page shell.
Reuse their direct navigation and one scroll owner. Do not add a tab strip or phone-only settings menu.
The Task behavior hierarchy is identical on both viewports.
Desktop short selectors align right. Below 768px, selectors and form fields occupy a row below their description.
Toggle controls stay beside wrapping labels where they fit with their touch target.
Group actions stack under headings on phones.
Disclosures open inline because they reveal related form content rather than temporary choices.

Use the existing safe-area-aware floating Save action and page bottom clearance.
Do not create a sticky group header or another internal vertical scroller.
Avoid duplicate responsive mounts. Values, validation, and draft lifetimes are shared.
Associate helpers and errors through accessible IDs. Preserve keyboard focus when closing a group containing focus.

## Localization and compatibility

Render translations through `t()` or `Trans`, including summaries, badges, and disclosure labels.
Update English, Portuguese, and Simplified Chinese. Generate Traditional Chinese through `pnpm run i18n:zh-hant`.
Use plural keys with counts. Descriptions may span multiple lines and never use ellipsis.
Preserve existing translation keys when their meaning remains unchanged.
Preserve technical values, existing test IDs where practical, and search aliases for old labels.

The [typography package](../../../plans/settings-typography/plan.md) remains a related implementation record.
Its existing unfinished statuses are not evidence of completion or a reason to rebuild shipped primitives.
Record this package as the owner of grouping and spacing. Reconcile overlapping verification evidence without replacing historical results.
The requirement and design pair preserves the local composition rationale, so this change does not require a separate ADR.

## Verification and documentation

Use component tests for mounted disclosure drafts, summary states, and target revelation.
Use desktop and mobile E2E for grouping, actual geometry, keyboard/touch behavior, saving, and repeated search targets.
Extend the existing settings typography route matrix for each migrated family.
Keep public documentation unchanged during design. During implementation, update affected Task behavior descriptions and section names.
Add the shared composition rule to `apps/web/AGENTS.md` when its implementation ships.

## Related contracts

- [Settings typography](../requirements/settings-typography.md)
- [Settings discovery](../requirements/settings-discovery.md)
- [Settings header tabs](settings-header-tabs.md)
- [Control sizing](control-sizing.md)
- [Route save coordinator](../../../decisions/0046-settings-route-save-coordinator.md)
- [Implementation plan](../../../plans/settings-composition/plan.md)
