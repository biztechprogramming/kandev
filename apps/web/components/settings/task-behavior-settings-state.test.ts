import { describe, expect, it } from "vitest";
import { formatEffectiveLimit } from "./task-behavior-settings-state";

const labels = {
  loading: "Loading",
  unavailable: "Unavailable",
  unlimited: "Unlimited",
  noLimit: "No automatic-session limit",
};

describe("formatEffectiveLimit", () => {
  it("keeps loading and unavailable values explicit", () => {
    expect(formatEffectiveLimit({ status: "loading" }, labels)).toBe("Loading");
    expect(formatEffectiveLimit({ status: "unavailable" }, labels)).toBe("Unavailable");
  });

  it("does not turn a disabled or unlimited effective value into zero", () => {
    expect(formatEffectiveLimit({ status: "ready", enabled: false, value: 0 }, labels)).toBe(
      "No automatic-session limit",
    );
    expect(formatEffectiveLimit({ status: "ready", unlimited: true, value: 0 }, labels)).toBe(
      "Unlimited",
    );
  });

  it("shows a loaded positive effective value", () => {
    expect(formatEffectiveLimit({ status: "ready", value: 5 }, labels)).toBe("5");
  });
});
