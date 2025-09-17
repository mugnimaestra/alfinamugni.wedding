import { describe, expect, it } from "vitest";
import { Select } from "~/components/ui/select";

describe("Select component", () => {
  it("is defined", () => {
    expect(typeof Select).toBe("function");
  });
});
