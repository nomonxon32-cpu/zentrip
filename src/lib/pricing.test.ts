import { BookingStatus } from "@prisma/client";

import { calculateBookingPrice, getBookingStatusLabel, validateRentalPeriod } from "@/lib/pricing";

describe("calculateBookingPrice", () => {
  it("calculates rental, fee, and total", () => {
    const price = calculateBookingPrice({
      startDate: new Date("2026-05-20"),
      endDate: new Date("2026-05-23"),
      dailyPrice: 400000,
      depositAmount: 1000000,
    });

    expect(price.days).toBe(3);
    expect(price.rentalAmount).toBe(1200000);
    expect(price.serviceFee).toBe(144000);
    expect(price.totalAmount).toBe(2344000);
  });
});

describe("validateRentalPeriod", () => {
  it("rejects rentals longer than 30 days", () => {
    const validation = validateRentalPeriod(
      new Date("2026-05-20"),
      new Date("2026-06-25"),
      new Date("2026-05-19"),
    );

    expect(validation.valid).toBe(false);
  });
});

describe("getBookingStatusLabel", () => {
  it("returns a readable booking label", () => {
    expect(getBookingStatusLabel(BookingStatus.PENDING_OWNER_APPROVAL)).toBe("Pending owner approval");
  });
});
