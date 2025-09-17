import { describe, expect, it } from "vitest";
import { Label } from "~/components/ui/label";

describe("Label component", () => {
  it("is exported", () => {
    expect(typeof Label).toBe("function");
  });
});
