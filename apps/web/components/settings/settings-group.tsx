"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { SettingsCard } from "./settings-card";
import { SettingsSaveDirtyScope } from "./settings-save-provider";
import { SettingsFieldLabel, SETTINGS_TYPOGRAPHY } from "./settings-typography";
import { useSettingsTargetRegistration } from "./settings-target-provider";
import { UnsavedChangesBadge } from "./unsaved-indicator";
import { cn } from "@/lib/utils";

export type SettingsPresentation = "card" | "row";

type SettingsGroupProps = Omit<ComponentProps<"section">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  titleAccessory?: ReactNode;
  children: ReactNode;
  isDirty?: boolean;
  discoveryTargetId?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  summary?: ReactNode;
  revealOn?: boolean;
  contentClassName?: string;
  titleTestId?: string;
};

function SettingsGroupHeading({
  title,
  description,
  summary,
  titleTestId,
  titleAccessory,
  dirty,
}: Pick<
  SettingsGroupProps,
  "title" | "description" | "summary" | "titleTestId" | "titleAccessory"
> & {
  dirty: boolean;
}) {
  return (
    <span className="min-w-0">
      <span className="flex items-center gap-2">
        <svg
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
        </svg>
        <h3 className={SETTINGS_TYPOGRAPHY.sectionTitle} data-testid={titleTestId}>
          {title}
        </h3>
        {titleAccessory}
      </span>
      {(description || summary) && (
        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 pl-6">
          {description && (
            <span className={SETTINGS_TYPOGRAPHY.sectionDescription}>{description}</span>
          )}
          {summary && <span className={SETTINGS_TYPOGRAPHY.meta}>{summary}</span>}
        </span>
      )}
      {dirty && <UnsavedChangesBadge />}
    </span>
  );
}

function SettingsGroupHeader({
  title,
  description,
  action,
  titleTestId,
  titleAccessory,
  dirty,
}: Pick<
  SettingsGroupProps,
  "title" | "description" | "action" | "titleTestId" | "titleAccessory"
> & { dirty: boolean }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={SETTINGS_TYPOGRAPHY.sectionTitle} data-testid={titleTestId}>
            {title}
          </h3>
          {titleAccessory}
          {dirty && <UnsavedChangesBadge />}
        </div>
        {description && <p className={SETTINGS_TYPOGRAPHY.sectionDescription}>{description}</p>}
      </div>
      {action && <div className="w-full shrink-0 md:w-auto">{action}</div>}
    </div>
  );
}

/** A settings group owns one heading and one bordered surface. */
export function SettingsGroup({
  title,
  description,
  action,
  titleAccessory,
  children,
  isDirty = false,
  discoveryTargetId,
  collapsible = false,
  defaultOpen = true,
  summary,
  revealOn = false,
  className,
  contentClassName,
  titleTestId,
  ...props
}: SettingsGroupProps) {
  const registerTarget = useSettingsTargetRegistration(discoveryTargetId);
  const [open, setOpen] = useState(defaultOpen);
  const wasRevealed = useRef(false);

  useEffect(() => {
    if (revealOn && !wasRevealed.current) setOpen(true);
    wasRevealed.current = revealOn;
  }, [revealOn]);

  return (
    <SettingsSaveDirtyScope>
      {(nestedIsDirty) => {
        const groupIsDirty = isDirty || nestedIsDirty;
        const groupContent = (
          <SettingsCard
            isDirty={groupIsDirty}
            className="min-w-0 w-full"
            data-settings-group-card="true"
          >
            <div className={cn("divide-y divide-border/70 px-4 py-2", contentClassName)}>
              {children}
            </div>
          </SettingsCard>
        );

        return (
          <section
            {...props}
            ref={registerTarget}
            className={cn("min-w-0 space-y-3", className)}
            data-settings-group="true"
            data-settings-dirty={groupIsDirty}
          >
            {collapsible ? (
              <details
                open={open}
                onToggle={(event) => setOpen(event.currentTarget.open)}
                data-settings-group-disclosure="true"
              >
                <summary className="group flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <SettingsGroupHeading
                    title={title}
                    description={description}
                    summary={summary}
                    titleTestId={titleTestId}
                    titleAccessory={titleAccessory}
                    dirty={groupIsDirty}
                  />
                </summary>
                <div className="mt-3">{groupContent}</div>
              </details>
            ) : (
              <>
                <SettingsGroupHeader
                  title={title}
                  description={description}
                  action={action}
                  titleTestId={titleTestId}
                  titleAccessory={titleAccessory}
                  dirty={groupIsDirty}
                />
                {groupContent}
              </>
            )}
          </section>
        );
      }}
    </SettingsSaveDirtyScope>
  );
}

type SettingsRowProps = Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  controlId?: string;
  descriptionId?: string;
  touchTarget?: "switch";
  controlWrapperTestId?: string;
  controlWrapperClassName?: string;
  details?: { label: ReactNode; children: ReactNode };
  discoveryTargetId?: string;
  isDirty?: boolean;
};

/** A row keeps a setting's label, explanation, control, and discovery target together. */
export function SettingsRow({
  label,
  description,
  control,
  controlId,
  descriptionId,
  touchTarget,
  controlWrapperTestId,
  controlWrapperClassName,
  details,
  discoveryTargetId,
  isDirty = false,
  className,
  ...props
}: SettingsRowProps) {
  const registerTarget = useSettingsTargetRegistration(discoveryTargetId);
  const generatedDescriptionId = useId();
  const resolvedDescriptionId = description
    ? (descriptionId ?? `settings-row-description-${generatedDescriptionId.replace(/:/g, "")}`)
    : undefined;
  const setTargetRef = useCallback(
    (element: HTMLDivElement | null) => registerTarget(element),
    [registerTarget],
  );
  const describedControl =
    resolvedDescriptionId && isValidElement(control)
      ? cloneElement(control as ReactElement<{ "aria-describedby"?: string }>, {
          "aria-describedby": [
            (control as ReactElement<{ "aria-describedby"?: string }>).props["aria-describedby"],
            resolvedDescriptionId,
          ]
            .filter(Boolean)
            .join(" "),
        })
      : control;

  return (
    <div
      {...props}
      ref={setTargetRef}
      className={cn(
        "flex min-w-0 flex-col gap-3 py-3 first:pt-2 last:pb-2 md:flex-row md:items-center md:justify-between",
        className,
      )}
      data-settings-row="true"
      data-settings-dirty={isDirty}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <SettingsFieldLabel htmlFor={controlId}>{label}</SettingsFieldLabel>
        {description && (
          <div id={resolvedDescriptionId} className={SETTINGS_TYPOGRAPHY.fieldDescription}>
            {description}
          </div>
        )}
        {details && <SettingsDetails label={details.label}>{details.children}</SettingsDetails>}
      </div>
      {touchTarget === "switch" ? (
        <label
          htmlFor={controlId}
          data-testid={controlWrapperTestId}
          data-settings-touch-target="true"
          className={cn(
            "flex min-w-0 shrink-0 items-center md:max-w-[min(50%,28rem)] md:justify-end max-md:min-h-11 max-md:min-w-11 max-md:w-full max-md:justify-end",
            "[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
            controlWrapperClassName,
          )}
        >
          {describedControl}
        </label>
      ) : (
        <div
          data-testid={controlWrapperTestId}
          className={cn(
            "flex min-w-0 shrink-0 items-center md:max-w-[min(50%,28rem)] md:justify-end max-md:min-h-11 max-md:w-full",
            "[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
            controlWrapperClassName,
          )}
        >
          {describedControl}
        </div>
      )}
    </div>
  );
}

export function SettingsDetails({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <details className="pt-1 text-xs text-muted-foreground">
      <summary className="inline-flex w-fit cursor-pointer items-center px-2 -mx-2 font-medium text-foreground max-md:min-h-11 max-md:min-w-11 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11">
        {label}
      </summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
}
