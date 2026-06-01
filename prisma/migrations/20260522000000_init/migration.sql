-- PostgreSQL baseline migration for Zentrip

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER', 'RENTER');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT', 'ID_CARD', 'DRIVER_LICENSE');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('ECONOMY', 'SEDAN', 'SUV', 'PREMIUM', 'VAN', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'GAS');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_OWNER_APPROVAL', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENTAL_PAYMENT', 'DEPOSIT_HOLD', 'REFUND', 'PAYOUT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UZCARD', 'HUMO', 'CLICK', 'PAYME', 'VISA', 'MASTERCARD', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'HELD', 'RELEASED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "city" TEXT NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "frontImageUrl" TEXT NOT NULL,
    "backImageUrl" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" "VehicleCategory" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "seats" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "dailyPrice" INTEGER NOT NULL,
    "monthlyPrice" INTEGER,
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
    "status" "VehicleStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePhoto" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiclePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "bookingType" "BookingType" NOT NULL DEFAULT 'DAILY',
    "durationMonths" INTEGER,
    "dailyPrice" INTEGER NOT NULL,
    "monthlyPrice" INTEGER,
    "rentalAmount" INTEGER NOT NULL,
    "serviceFee" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "pickupLocation" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "pickupNotes" TEXT,
    "returnNotes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PaymentType" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "providerReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_kycStatus_idx" ON "User"("role", "kycStatus");

-- CreateIndex
CREATE INDEX "KycDocument_userId_status_idx" ON "KycDocument"("userId", "status");

-- CreateIndex
CREATE INDEX "Vehicle_city_status_idx" ON "Vehicle"("city", "status");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_status_idx" ON "Vehicle"("ownerId", "status");

-- CreateIndex
CREATE INDEX "Vehicle_category_transmission_fuelType_idx" ON "Vehicle"("category", "transmission", "fuelType");

-- CreateIndex
CREATE INDEX "VehiclePhoto_vehicleId_sortOrder_idx" ON "VehiclePhoto"("vehicleId", "sortOrder");

-- CreateIndex
CREATE INDEX "AvailabilityBlock_vehicleId_startDate_endDate_idx" ON "AvailabilityBlock"("vehicleId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Booking_vehicleId_startDate_endDate_idx" ON "Booking"("vehicleId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Booking_renterId_status_idx" ON "Booking"("renterId", "status");

-- CreateIndex
CREATE INDEX "Booking_ownerId_status_idx" ON "Booking"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_vehicleId_key" ON "Favorite"("userId", "vehicleId");

-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Favorite_vehicleId_createdAt_idx" ON "Favorite"("vehicleId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_bookingId_type_idx" ON "Payment"("bookingId", "type");

-- CreateIndex
CREATE INDEX "Payment_userId_status_idx" ON "Payment"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_authorId_key" ON "Review"("bookingId", "authorId");

-- CreateIndex
CREATE INDEX "Review_vehicleId_rating_idx" ON "Review"("vehicleId", "rating");

-- CreateIndex
CREATE INDEX "Message_bookingId_createdAt_idx" ON "Message"("bookingId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_receiverId_isRead_idx" ON "Message"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Dispute_status_createdAt_idx" ON "Dispute"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Dispute_bookingId_idx" ON "Dispute"("bookingId");

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePhoto" ADD CONSTRAINT "VehiclePhoto_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityBlock" ADD CONSTRAINT "AvailabilityBlock_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
