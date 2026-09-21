export type CanvasPresentationIdentity = {
  userId: string;
  workspaceId: string;
  taskId: string;
  canvasId: string;
};

export type CanvasPresentationReason = "existing" | "restored" | "manual" | "automatic";

const CANVAS_PRESENTATION_PREFIX = "kandev.canvas-presentation.v1";
// i18n-exempt: stable browser-storage identity, not user-facing copy.
const ANONYMOUS_CANVAS_PRESENTATION_IDENTITY = "anonymous";
const memoryReceipts = new Set<string>();

export function canvasPresentationUserId(auth: {
  mode: "disabled" | "setup" | "enabled";
  user: { id: string } | null;
}): string | null {
  if (auth.user?.id) return auth.user.id;
  return auth.mode === "disabled" ? ANONYMOUS_CANVAS_PRESENTATION_IDENTITY : null;
}

/** Build the tab-local identity for one presented task canvas. */
export function canvasPresentationKey(identity: CanvasPresentationIdentity): string {
  return [
    CANVAS_PRESENTATION_PREFIX,
    identity.userId,
    identity.workspaceId,
    identity.taskId,
    identity.canvasId,
  ]
    .map(encodeURIComponent)
    .join(".");
}

function sessionStorageOrNull(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Whether a task canvas was presented in this browser tab. */
export function wasCanvasPresented(identity: CanvasPresentationIdentity): boolean {
  const key = canvasPresentationKey(identity);
  const storage = sessionStorageOrNull();
  if (!storage) return memoryReceipts.has(key);

  try {
    return storage.getItem(key) === "1" || memoryReceipts.has(key);
  } catch {
    return memoryReceipts.has(key);
  }
}

/** Record a successful task canvas presentation in this browser tab. */
export function markCanvasPresented(identity: CanvasPresentationIdentity): void {
  const key = canvasPresentationKey(identity);
  const storage = sessionStorageOrNull();
  if (!storage) {
    memoryReceipts.add(key);
    return;
  }

  try {
    storage.setItem(key, "1");
  } catch {
    memoryReceipts.add(key);
  }
}

/** Shared seam for manual, restored, and automatic host presentation paths. */
export function recordCanvasPresentation(
  identity: CanvasPresentationIdentity,
  reason: CanvasPresentationReason,
): void {
  void reason;
  markCanvasPresented(identity);
}
