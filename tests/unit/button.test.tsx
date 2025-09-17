import { describe, expect, it } from "vitest";
import { buttonVariants } from "~/components/ui/button";

describe("buttonVariants", () => {
  it("provides default classes", () => {
    const classes = buttonVariants({});
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("focus-visible:ring-2");
  });

  it("provides destructive variant classes", () => {
    const classes = buttonVariants({ variant: "destructive" });
    expect(classes).toContain("bg-destructive");
  });
});
