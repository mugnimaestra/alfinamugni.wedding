import { describe, expect, it } from "vitest";
import { Input } from "~/components/ui/input";

describe("Input component", () => {
  it("exports a Qwik component", () => {
    expect(typeof Input).toBe("function");
  });
});
