export type EffectiveLimit = {
  status: "loading" | "unavailable" | "ready";
  enabled?: boolean;
  unlimited?: boolean;
  value?: number;
};

export type EffectiveLimitLabels = {
  loading: string;
  unavailable: string;
  unlimited: string;
  noLimit: string;
};

export function formatEffectiveLimit(limit: EffectiveLimit, labels: EffectiveLimitLabels): string {
  if (limit.status === "loading") return labels.loading;
  if (limit.status === "unavailable") return labels.unavailable;
  if (limit.enabled === false) return labels.noLimit;
  if (limit.unlimited || limit.value === 0) return labels.unlimited;
  if (limit.value === undefined || !Number.isFinite(limit.value)) return labels.unavailable;
  return String(limit.value);
}
