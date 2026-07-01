import { SERVICE_FEE_RATE } from "@/lib/constants";

export const PLATFORM_FEE_WAIVED = true;

export function calculatePlatformServiceFee(rentalAmount: number) {
  return Math.round(rentalAmount * SERVICE_FEE_RATE);
}

export function getChargedPlatformFee(serviceFee: number) {
  return PLATFORM_FEE_WAIVED ? 0 : serviceFee;
}

export function getWaivedPlatformFee(serviceFee: number) {
  return PLATFORM_FEE_WAIVED ? serviceFee : 0;
}

export function getBookingPayableTotal(input: {
  rentalAmount: number;
  serviceFee: number;
  depositAmount: number;
  deliveryFee?: number | null;
}) {
  return (
    input.rentalAmount +
    (input.deliveryFee ?? 0) +
    input.depositAmount +
    getChargedPlatformFee(input.serviceFee)
  );
}

export function getOwnerPayoutAmount(input: {
  rentalAmount: number;
  serviceFee: number;
  deliveryFee?: number | null;
}) {
  return input.rentalAmount + (input.deliveryFee ?? 0) - getChargedPlatformFee(input.serviceFee);
}
