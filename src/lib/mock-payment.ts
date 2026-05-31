import { PaymentMethod } from "@prisma/client";

import { sleep } from "@/lib/utils";

export async function simulatePayment(params: {
  amount: number;
  method: PaymentMethod;
}) {
  await sleep(500);

  return {
    success: true,
    providerReference: `MOCK-${params.method}-${Date.now()}`,
    amount: params.amount,
  };
}
