import { describe, expect, it } from "vitest";
import { Separator } from "~/components/ui/separator";

describe("Separator component", () => {
  it("exports component", () => {
    expect(typeof Separator).toBe("function");
  });
});
