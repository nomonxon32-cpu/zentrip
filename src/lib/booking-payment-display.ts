import { BookingPaymentStatus, BookingStatus } from "@prisma/client";

type BookingStatusLike = BookingStatus | "APPROVED" | "PENDING" | "CANCELED" | "EXPIRED" | string;

export type CashPaymentDisplayState =
  | "NO_PAYMENT_DUE"
  | "PAID_IN_CASH"
  | "CASH_PAYMENT_STATUS_UNKNOWN"
  | "CASH_AT_PICKUP"
  | "CASH_AFTER_APPROVAL"
  | "PENDING_CASH_PAYMENT";

type PaymentLabels = {
  noPaymentDue: string;
  paidInCash: string;
  cashPaymentStatusUnknown: string;
  cashAtPickup: string;
  cashPaymentAfterApproval: string;
  pendingCashPayment: string;
};

export function getCashPaymentDisplayState({
  bookingStatus,
  paymentStatus,
}: {
  bookingStatus?: BookingStatusLike | null;
  paymentStatus?: BookingPaymentStatus | string | null;
}): CashPaymentDisplayState {
  const normalizedBookingStatus = bookingStatus?.toUpperCase();
  const normalizedPaymentStatus = paymentStatus?.toUpperCase();

  if (
    normalizedBookingStatus === BookingStatus.CANCELLED ||
    normalizedBookingStatus === "CANCELED" ||
    normalizedBookingStatus === BookingStatus.REJECTED ||
    normalizedBookingStatus === "EXPIRED" ||
    normalizedPaymentStatus === BookingPaymentStatus.REFUNDED
  ) {
    return "NO_PAYMENT_DUE";
  }

  if (normalizedBookingStatus === BookingStatus.COMPLETED) {
    return normalizedPaymentStatus === BookingPaymentStatus.PAID
      ? "PAID_IN_CASH"
      : "CASH_PAYMENT_STATUS_UNKNOWN";
  }

  if (
    normalizedBookingStatus === BookingStatus.ACTIVE ||
    normalizedBookingStatus === BookingStatus.CONFIRMED ||
    normalizedBookingStatus === "APPROVED"
  ) {
    return normalizedPaymentStatus === BookingPaymentStatus.PAID
      ? "PAID_IN_CASH"
      : "CASH_AT_PICKUP";
  }

  if (
    normalizedBookingStatus === BookingStatus.PENDING_OWNER_APPROVAL ||
    normalizedBookingStatus === "PENDING"
  ) {
    return "CASH_AFTER_APPROVAL";
  }

  if (normalizedPaymentStatus === BookingPaymentStatus.PAID) {
    return "PAID_IN_CASH";
  }

  return "PENDING_CASH_PAYMENT";
}

export function getCashPaymentDisplayLabel(
  labels: PaymentLabels,
  state: CashPaymentDisplayState,
) {
  switch (state) {
    case "NO_PAYMENT_DUE":
      return labels.noPaymentDue;
    case "PAID_IN_CASH":
      return labels.paidInCash;
    case "CASH_PAYMENT_STATUS_UNKNOWN":
      return labels.cashPaymentStatusUnknown;
    case "CASH_AT_PICKUP":
      return labels.cashAtPickup;
    case "CASH_AFTER_APPROVAL":
      return labels.cashPaymentAfterApproval;
    case "PENDING_CASH_PAYMENT":
    default:
      return labels.pendingCashPayment;
  }
}

export function getCashPaymentDisplayTone(state: CashPaymentDisplayState) {
  switch (state) {
    case "PAID_IN_CASH":
      return "settled" as const;
    case "CASH_AT_PICKUP":
    case "CASH_AFTER_APPROVAL":
    case "PENDING_CASH_PAYMENT":
      return "pending" as const;
    case "NO_PAYMENT_DUE":
    case "CASH_PAYMENT_STATUS_UNKNOWN":
    default:
      return "neutral" as const;
  }
}
