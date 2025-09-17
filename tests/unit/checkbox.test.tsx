import { describe, expect, it } from "vitest";
import { Checkbox, CheckboxWithLabel } from "~/components/ui/checkbox";

describe("Checkbox exports", () => {
  it("exposes checkbox primitives", () => {
    expect(typeof Checkbox).toBe("function");
    expect(typeof CheckboxWithLabel).toBe("function");
  });
});
