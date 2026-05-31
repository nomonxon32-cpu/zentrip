import {
  BookingStatus,
  DisputeStatus,
  FuelType,
  KycStatus,
  PaymentMethod,
  Role,
  Transmission,
  VehicleCategory,
  VehicleStatus,
} from "@prisma/client";

export const APP_NAME = "Zentrip";
export const CURRENCY = "UZS";
export const SERVICE_FEE_RATE = 0.12;
export const MAX_RENTAL_DAYS = 30;
export const MONTHLY_DISCOUNT_RATE = 0.85;
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const LOCALE_COOKIE = "uzcar-locale";
export const SESSION_COOKIE = "uzcar-session";
export const THEME_STORAGE_KEY = "zentrip-theme";

export const CITIES = ["Tashkent", "Samarkand", "Bukhara", "Fergana", "Andijan", "Namangan"];

export const roleOptions = [
  { label: "Owner", value: Role.OWNER },
  { label: "Renter", value: Role.RENTER },
] as const;

export const paymentMethodOptions = [
  PaymentMethod.UZCARD,
  PaymentMethod.HUMO,
  PaymentMethod.CLICK,
  PaymentMethod.PAYME,
  PaymentMethod.VISA,
  PaymentMethod.MASTERCARD,
  PaymentMethod.CASH,
] as const;

export const monthlyDurationOptions = [1, 2, 3, 6] as const;

export const categoryOptions = Object.values(VehicleCategory);
export const transmissionOptions = Object.values(Transmission);
export const fuelTypeOptions = Object.values(FuelType);
export const listingStatusOptions = Object.values(VehicleStatus);
export const bookingStatusOptions = Object.values(BookingStatus);
export const kycStatusOptions = Object.values(KycStatus);
export const disputeStatusOptions = Object.values(DisputeStatus);

export const acceptedUploadTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const bookingConflictStatuses = [
  BookingStatus.CONFIRMED,
  BookingStatus.ACTIVE,
  BookingStatus.PENDING_OWNER_APPROVAL,
  BookingStatus.PENDING_PAYMENT,
];
