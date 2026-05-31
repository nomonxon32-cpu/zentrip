import { KycStatus, Role, VehicleStatus } from "@prisma/client";

import { canUserBookVehicle, checkDateOverlap } from "@/lib/availability";

describe("checkDateOverlap", () => {
  it("detects overlapping booking windows", () => {
    expect(
      checkDateOverlap("2026-05-21", "2026-05-24", "2026-05-24", "2026-05-27"),
    ).toBe(true);
  });
});

describe("canUserBookVehicle", () => {
  it("prevents non-approved users from booking", () => {
    const result = canUserBookVehicle({
      user: {
        id: "renter-1",
        role: Role.RENTER,
        kycStatus: KycStatus.PENDING,
        isSuspended: false,
      },
      vehicle: {
        ownerId: "owner-1",
        status: VehicleStatus.ACTIVE,
      },
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-03"),
      now: new Date("2026-05-19"),
    });

    expect(result.allowed).toBe(false);
  });

  it("allows valid renter bookings", () => {
    const result = canUserBookVehicle({
      user: {
        id: "renter-1",
        role: Role.RENTER,
        kycStatus: KycStatus.APPROVED,
        isSuspended: false,
      },
      vehicle: {
        ownerId: "owner-1",
        status: VehicleStatus.ACTIVE,
      },
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-04"),
      now: new Date("2026-05-19"),
    });

    expect(result.allowed).toBe(true);
  });
});
