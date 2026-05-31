import { db } from "@/lib/db";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  return db.notification.create({
    data: params,
  });
}
