-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "monthlyPrice" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "days" INTEGER NOT NULL,
    "bookingType" TEXT NOT NULL DEFAULT 'DAILY',
    "durationMonths" INTEGER,
    "dailyPrice" INTEGER NOT NULL,
    "monthlyPrice" INTEGER,
    "rentalAmount" INTEGER NOT NULL,
    "serviceFee" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "pickupLocation" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "pickupNotes" TEXT,
    "returnNotes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("cancellationReason", "createdAt", "dailyPrice", "days", "deliveryFee", "depositAmount", "endDate", "endTime", "id", "ownerId", "paymentStatus", "pickupLocation", "pickupNotes", "rentalAmount", "renterId", "returnNotes", "serviceFee", "startDate", "startTime", "status", "totalAmount", "updatedAt", "vehicleId") SELECT "cancellationReason", "createdAt", "dailyPrice", "days", "deliveryFee", "depositAmount", "endDate", "endTime", "id", "ownerId", "paymentStatus", "pickupLocation", "pickupNotes", "rentalAmount", "renterId", "returnNotes", "serviceFee", "startDate", "startTime", "status", "totalAmount", "updatedAt", "vehicleId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_vehicleId_startDate_endDate_idx" ON "Booking"("vehicleId", "startDate", "endDate");
CREATE INDEX "Booking_renterId_status_idx" ON "Booking"("renterId", "status");
CREATE INDEX "Booking_ownerId_status_idx" ON "Booking"("ownerId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
