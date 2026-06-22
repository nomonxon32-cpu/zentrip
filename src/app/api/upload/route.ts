import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { saveUploadedFile } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    await requireApiUser();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "general";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const url = await saveUploadedFile(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
