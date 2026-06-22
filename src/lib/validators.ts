import { BookingType, DocumentType, PaymentMethod, Role, VehicleCategory, Transmission, FuelType } from "@prisma/client";
import { z } from "zod";

import { MAX_RENTAL_DAYS } from "@/lib/constants";

// Accepts a Vercel Blob URL (https://...) or a local-dev path (/uploads/...).
const imageUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || /^https:\/\//i.test(value), {
    message: "Invalid file URL.",
  });
const optionalTimeSchema = z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time in HH:mm format.")]);

export const registerSchema = z.object({
  role: z.union([z.literal(Role.OWNER), z.literal(Role.RENTER)]),
  name: z.string().min(2).max(80),
  email: z.email(),
  phone: z.string().min(7).max(24),
  city: z.string().min(2).max(80),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter.")
    .regex(/\d/, "Include at least one number."),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const availabilityBlockSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().min(2).max(140),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    message: "Availability block end date must be on or after start date.",
    path: ["endDate"],
  });

export const vehicleListingSchema = z.object({
  make: z.string().min(2).max(40),
  model: z.string().min(1).max(40),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  category: z.nativeEnum(VehicleCategory),
  transmission: z.nativeEnum(Transmission),
  fuelType: z.nativeEnum(FuelType),
  seats: z.number().int().min(2).max(12),
  city: z.string().min(2).max(80),
  address: z.string().min(5).max(180),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  dailyPrice: z.number().int().min(100000),
  monthlyPrice: z.number().int().min(100000).optional().nullable(),
  depositAmount: z.number().int().min(0),
  description: z.string().min(30).max(1200),
  rules: z.string().min(10).max(800),
  mileageLimitPerDay: z.number().int().min(50).max(1000),
  plateNumber: z.string().min(4).max(20),
  hasOsago: z.boolean().refine((value) => value, "OSAGO confirmation is required."),
  hasCasco: z.boolean(),
  airportPickupAvailable: z.boolean(),
  deliveryAvailable: z.boolean(),
  monthlyAvailable: z.boolean(),
  instantBook: z.boolean(),
  pickupInstructions: z.string().max(300).optional().nullable(),
  deliveryFee: z.number().int().min(0).optional().nullable(),
  photoUrls: z.array(imageUrlSchema).min(1, "Add at least one vehicle photo.").max(8),
  availabilityBlocks: z.array(availabilityBlockSchema),
})
  .refine((value) => !value.deliveryAvailable || value.deliveryFee == null || value.deliveryFee >= 0, {
    message: "Delivery fee must be zero or greater.",
    path: ["deliveryFee"],
  })
  .refine((value) => !value.monthlyAvailable || (value.monthlyPrice == null || value.monthlyPrice >= 100000), {
    message: "Monthly price must be at least 100000 UZS when provided.",
    path: ["monthlyPrice"],
  });

export const kycUploadSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  frontImageUrl: imageUrlSchema,
  backImageUrl: imageUrlSchema.optional().nullable(),
});

export const bookingSchema = z
  .object({
    vehicleId: z.string().min(1),
    bookingType: z.nativeEnum(BookingType).optional().default(BookingType.DAILY),
    durationMonths: z.number().int().min(1).max(6).optional().nullable(),
    monthlyPrice: z.number().int().min(0).optional().nullable(),
    startDate: z.string(),
    endDate: z.string(),
    pickupLocation: z.string().max(180).optional().nullable(),
    startTime: optionalTimeSchema.optional(),
    endTime: optionalTimeSchema.optional(),
    deliveryFee: z.number().int().min(0).optional().nullable(),
    // Cash-only flow. Kept for backward compatibility but always treated as CASH.
    paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.CASH),
    pickupNotes: z.string().max(300).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);

    if (!(end > start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date.",
        path: ["endDate"],
      });
      return;
    }

    if (value.bookingType === BookingType.MONTHLY) {
      if (!value.durationMonths) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Monthly bookings require a duration in months.",
          path: ["durationMonths"],
        });
      }
      return;
    }

    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (!(diff > 0 && diff <= MAX_RENTAL_DAYS)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Booking cannot exceed ${MAX_RENTAL_DAYS} days.`,
        path: ["endDate"],
      });
    }
  });

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  vehicleId: z.string().min(1),
  receiverId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(600),
});

export const disputeSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(4).max(120),
  description: z.string().min(15).max(1000),
});

export const messageSchema = z.object({
  bookingId: z.string().optional().nullable(),
  receiverId: z.string().min(1),
  content: z.string().min(1).max(1000),
  attachmentUrl: imageUrlSchema.optional().nullable(),
});
