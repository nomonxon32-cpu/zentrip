import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/uploads";

export async function POST(request: Request) {
  await requireApiUser();

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "general";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
