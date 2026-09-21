---
status: draft
system: ui
created: 2026-09-21
owners:
  - Kandev frontend
---

# Settings Composition Requirements

## Overview

Users need consistent settings groups, descriptions, and actions without more settings pages.
UI owns this reusable presentation contract. Domain systems retain behavior, permissions, and persistence.
The accepted direction keeps Task behavior on one page and extends consistent composition across existing first-party settings.

This contract extends [settings typography](settings-typography.md).
It preserves [manual saving](settings-manual-save.md), [discovery](settings-discovery.md), and [header tabs](settings-header-tabs.md).

## Terminology

- **Group:** Related settings with one heading and one outer container.
- **Row:** One setting with its label, explanation, control, and optional status.
- **Details:** Secondary technical explanation that users can expand.

## Requirements

### REQ-UI-SETTINGS-COMPOSITION-001: Consistent settings groups

**Intent:** Equivalent content has the same hierarchy across settings pages.

#### Acceptance criteria

- **AC-UI-SETTINGS-COMPOSITION-001.1:** First-party settings pages shall use consistent page headings, group headings, card padding, row spacing, descriptions, and action placement.
- **AC-UI-SETTINGS-COMPOSITION-001.2:** Related simple preferences shall share one group container. A row shall not repeat its label as a separate card title.
- **AC-UI-SETTINGS-COMPOSITION-001.3:** Forms shall group related fields. Resource lists shall use consistent headings and actions while retaining their list, table, or editor interaction.
- **AC-UI-SETTINGS-COMPOSITION-001.4:** The change shall preserve existing page destinations, sidebar entries, tabs, and settings-search targets. It shall not add settings pages.
- **AC-UI-SETTINGS-COMPOSITION-001.5:** Equivalent content shall use the existing typography and control-size roles. Technical editors, diagnostics, and tables shall retain documented specialized layouts.

### REQ-UI-SETTINGS-COMPOSITION-002: Task behavior organization

**Intent:** Users can find task preferences by the activity they affect.

#### Acceptance criteria

- **AC-UI-SETTINGS-COMPOSITION-002.1:** Task behavior shall show four ordered groups: Creating and opening tasks, Conversation and panels, Archiving, and Runtime and limits.
- **AC-UI-SETTINGS-COMPOSITION-002.2:** Creating and opening tasks shall contain automatic opening, generated titles, the profile for agent-created tasks, and automatic agent start on opening.
- **AC-UI-SETTINGS-COMPOSITION-002.3:** Conversation and panels shall contain the unread divider, transcript navigation, and todo checklist. Archiving shall contain archive confirmation.
- **AC-UI-SETTINGS-COMPOSITION-002.4:** Runtime and limits shall contain session capacity, message queue limits and merging, and sleep prevention. It shall initially collapse on ordinary entry.
- **AC-UI-SETTINGS-COMPOSITION-002.5:** The runtime summary shall show effective automatic-session and message-queue limits. Loading and unavailable values shall not appear as zero or unlimited.
- **AC-UI-SETTINGS-COMPOSITION-002.6:** Runtime settings shall identify their instance scope. Sleep prevention shall identify the host computer, including when the user connects remotely.

### REQ-UI-SETTINGS-COMPOSITION-003: Descriptions and disclosures

**Intent:** Short explanations preserve information needed to choose safely.

#### Acceptance criteria

- **AC-UI-SETTINGS-COMPOSITION-003.1:** Each setting shall show a plain-language explanation of its effect. Important timing, scope, exclusions, and override reasons shall remain visible beside its control.
- **AC-UI-SETTINGS-COMPOSITION-003.2:** Secondary technical explanations shall use a consistent Details disclosure. Descriptions shall wrap without truncation or a forced single-line height.
- **AC-UI-SETTINGS-COMPOSITION-003.3:** Collapsing a group shall preserve drafts, validation, save contributors, and unsaved-change protection. Expansion alone shall not persist settings.
- **AC-UI-SETTINGS-COMPOSITION-003.4:** A search result or direct fragment shall open its enclosing disclosures before focus and highlight. Repeated requests shall work after manual collapse.
- **AC-UI-SETTINGS-COMPOSITION-003.5:** A collapsed dirty group shall indicate unsaved changes. New validation, load, or save errors shall reveal the affected controls and recovery action.
- **AC-UI-SETTINGS-COMPOSITION-003.6:** The runtime summary shall distinguish effective values from unsaved changes. Save and Reset shall retain their existing route-level behavior.

### REQ-UI-SETTINGS-COMPOSITION-004: Accessible responsive composition

**Intent:** Users can operate the same settings on desktop and phone.

#### Acceptance criteria

- **AC-UI-SETTINGS-COMPOSITION-004.1:** Phones shall use the existing settings navigation and one vertical page scroll region. Groups shall open inline without another navigation layer.
- **AC-UI-SETTINGS-COMPOSITION-004.2:** Phone fields and group actions shall stack when needed. Labels, descriptions, controls, and save actions shall remain inside the viewport.
- **AC-UI-SETTINGS-COMPOSITION-004.3:** Disclosures shall support keyboard and touch activation. Hidden content shall not receive focus. Labels and descriptions shall remain associated with controls.
- **AC-UI-SETTINGS-COMPOSITION-004.4:** Long translations shall wrap without document horizontal scrolling. Shared phone and coarse-pointer actions shall retain targets of at least 44px.
- **AC-UI-SETTINGS-COMPOSITION-004.5:** Layout changes shall preserve settings values, permissions, runtime defaults, and confirmation behavior across reloads and viewport changes.

## Out of scope

- New settings pages, navigation categories, tabs, or a global settings search redesign.
- Backend schemas, policy, permissions, defaults, or save transaction changes.
- A global UI theme or changes to unrelated application cards.
- Restyling third-party plugin-owned content or changing the plugin SDK.
- Redesigning specialized workflow canvases, editors, terminals, or diagnostic tables.
- Inverting the automatic-start switch. This package keeps its existing semantics and translated label.

## Implementation plan

See [Settings composition](../../../plans/settings-composition/plan.md).
