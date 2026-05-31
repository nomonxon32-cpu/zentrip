import { Role } from "@prisma/client";

import { hasRequiredRole } from "@/lib/auth";

describe("hasRequiredRole", () => {
  it("returns true for matching roles", () => {
    expect(hasRequiredRole(Role.ADMIN, Role.ADMIN)).toBe(true);
  });

  it("returns false for mismatched roles", () => {
    expect(hasRequiredRole(Role.RENTER, Role.OWNER)).toBe(false);
  });
});
