-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "dailyPrice" INTEGER NOT NULL,
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
INSERT INTO "new_Booking" ("cancellationReason", "createdAt", "dailyPrice", "days", "depositAmount", "endDate", "id", "ownerId", "paymentStatus", "pickupNotes", "rentalAmount", "renterId", "returnNotes", "serviceFee", "startDate", "status", "totalAmount", "updatedAt", "vehicleId") SELECT "cancellationReason", "createdAt", "dailyPrice", "days", "depositAmount", "endDate", "id", "ownerId", "paymentStatus", "pickupNotes", "rentalAmount", "renterId", "returnNotes", "serviceFee", "startDate", "status", "totalAmount", "updatedAt", "vehicleId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_vehicleId_startDate_endDate_idx" ON "Booking"("vehicleId", "startDate", "endDate");
CREATE INDEX "Booking_renterId_status_idx" ON "Booking"("renterId", "status");
CREATE INDEX "Booking_ownerId_status_idx" ON "Booking"("ownerId", "status");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "dailyPrice" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "mileageLimitPerDay" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "hasOsago" BOOLEAN NOT NULL,
    "hasCasco" BOOLEAN NOT NULL DEFAULT false,
    "airportPickupAvailable" BOOLEAN NOT NULL DEFAULT false,
    "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
    "monthlyAvailable" BOOLEAN NOT NULL DEFAULT false,
    "instantBook" BOOLEAN NOT NULL DEFAULT false,
    "pickupInstructions" TEXT,
    "deliveryFee" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("address", "category", "city", "createdAt", "dailyPrice", "depositAmount", "description", "fuelType", "hasCasco", "hasOsago", "id", "latitude", "longitude", "make", "mileageLimitPerDay", "model", "ownerId", "plateNumber", "rejectionReason", "rules", "seats", "status", "transmission", "updatedAt", "year") SELECT "address", "category", "city", "createdAt", "dailyPrice", "depositAmount", "description", "fuelType", "hasCasco", "hasOsago", "id", "latitude", "longitude", "make", "mileageLimitPerDay", "model", "ownerId", "plateNumber", "rejectionReason", "rules", "seats", "status", "transmission", "updatedAt", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE INDEX "Vehicle_city_status_idx" ON "Vehicle"("city", "status");
CREATE INDEX "Vehicle_ownerId_status_idx" ON "Vehicle"("ownerId", "status");
CREATE INDEX "Vehicle_category_transmission_fuelType_idx" ON "Vehicle"("category", "transmission", "fuelType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Favorite_vehicleId_createdAt_idx" ON "Favorite"("vehicleId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_vehicleId_key" ON "Favorite"("userId", "vehicleId");
