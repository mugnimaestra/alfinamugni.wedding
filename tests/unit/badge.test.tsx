import { describe, expect, it } from "vitest";
import {
  Badge,
  DotBadge,
  DismissibleBadge,
  RSVPBadge,
  VendorCategoryBadge,
  StatusBadge,
} from "~/components/ui/badge";

describe("Badge exports", () => {
  it("define core badges", () => {
    expect(typeof Badge).toBe("function");
    expect(typeof DotBadge).toBe("function");
    expect(typeof DismissibleBadge).toBe("function");
    expect(typeof RSVPBadge).toBe("function");
    expect(typeof VendorCategoryBadge).toBe("function");
    expect(typeof StatusBadge).toBe("function");
  });
});
