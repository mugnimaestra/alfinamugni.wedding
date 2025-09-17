import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

describe("Card exports", () => {
  it("provide card building blocks", () => {
    expect(typeof Card).toBe("function");
    expect(typeof CardHeader).toBe("function");
    expect(typeof CardTitle).toBe("function");
    expect(typeof CardDescription).toBe("function");
    expect(typeof CardContent).toBe("function");
    expect(typeof CardFooter).toBe("function");
  });
});
