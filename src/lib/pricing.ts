import { BookingStatus } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import {
  calculatePlatformServiceFee,
  getBookingPayableTotal,
  getOwnerPayoutAmount,
} from "@/lib/booking-finance";
import { MAX_RENTAL_DAYS, MONTHLY_DISCOUNT_RATE } from "@/lib/constants";

export type BookingPrice = {
  days: number;
  dailyPrice: number;
  monthlyPrice?: number | null;
  durationMonths?: number | null;
  rentalAmount: number;
  serviceFee: number;
  depositAmount: number;
  deliveryFee: number;
  totalAmount: number;
  payoutAmount: number;
};

export function getRentalDays(startDate: Date, endDate: Date) {
  return Math.max(1, differenceInCalendarDays(endDate, startDate));
}

export function calculateBookingPrice(params: {
  startDate: Date;
  endDate: Date;
  dailyPrice: number;
  depositAmount: number;
  deliveryFee?: number;
}) {
  const days = getRentalDays(params.startDate, params.endDate);
  const rentalAmount = days * params.dailyPrice;
  const serviceFee = calculatePlatformServiceFee(rentalAmount);
  const deliveryFee = params.deliveryFee ?? 0;
  const totalAmount = getBookingPayableTotal({
    rentalAmount,
    serviceFee,
    depositAmount: params.depositAmount,
    deliveryFee,
  });
  const payoutAmount = getOwnerPayoutAmount({
    rentalAmount,
    serviceFee,
    deliveryFee,
  });

  return {
    days,
    dailyPrice: params.dailyPrice,
    rentalAmount,
    serviceFee,
    depositAmount: params.depositAmount,
    deliveryFee,
    totalAmount,
    payoutAmount,
  } satisfies BookingPrice;
}

export function getVehicleMonthlyPrice(dailyPrice: number, monthlyPrice?: number | null) {
  if (monthlyPrice && monthlyPrice > 0) {
    return monthlyPrice;
  }

  return Math.round(dailyPrice * 30 * MONTHLY_DISCOUNT_RATE);
}

export function calculateMonthlyBookingPrice(params: {
  startDate: Date;
  durationMonths: number;
  dailyPrice: number;
  monthlyPrice?: number | null;
  depositAmount: number;
  deliveryFee?: number;
}) {
  const effectiveMonthlyPrice = getVehicleMonthlyPrice(params.dailyPrice, params.monthlyPrice);
  const rentalAmount = effectiveMonthlyPrice * params.durationMonths;
  const serviceFee = calculatePlatformServiceFee(rentalAmount);
  const deliveryFee = params.deliveryFee ?? 0;
  const totalAmount = getBookingPayableTotal({
    rentalAmount,
    serviceFee,
    depositAmount: params.depositAmount,
    deliveryFee,
  });
  const payoutAmount = getOwnerPayoutAmount({
    rentalAmount,
    serviceFee,
    deliveryFee,
  });

  return {
    days: getRentalDays(params.startDate, new Date(params.startDate.getFullYear(), params.startDate.getMonth() + params.durationMonths, params.startDate.getDate())),
    dailyPrice: params.dailyPrice,
    monthlyPrice: effectiveMonthlyPrice,
    durationMonths: params.durationMonths,
    rentalAmount,
    serviceFee,
    depositAmount: params.depositAmount,
    deliveryFee,
    totalAmount,
    payoutAmount,
  } satisfies BookingPrice;
}

export function validateRentalPeriod(startDate: Date, endDate: Date, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (start < today) {
    return { valid: false, message: "Booking start date cannot be in the past." };
  }

  if (end <= start) {
    return { valid: false, message: "End date must be after start date." };
  }

  const days = getRentalDays(start, end);
  if (days > MAX_RENTAL_DAYS) {
    return { valid: false, message: `Rental period cannot exceed ${MAX_RENTAL_DAYS} days.` };
  }

  return { valid: true, days };
}

export function getBookingStatusLabel(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    PENDING_PAYMENT: "Pending payment",
    PENDING_OWNER_APPROVAL: "Pending owner approval",
    CONFIRMED: "Confirmed",
    ACTIVE: "Active trip",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    DISPUTED: "Disputed",
  };

  return labels[status];
}
