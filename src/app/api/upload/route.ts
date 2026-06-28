import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { resolveUploadFolder, saveUploadedFile } from "@/lib/uploads";

export const runtime = "nodejs";

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "name" in value &&
      "type" in value &&
      "size" in value &&
      "arrayBuffer" in value,
  );
}

export async function POST(request: Request) {
  try {
    console.info("[upload] route reached", {
      contentType: request.headers.get("content-type") ?? "unknown",
    });

    await requireApiUser();

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Upload requests must use multipart/form-data." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "general";
    const prefix = resolveUploadFolder(folder);

    console.info("[upload] parsed form data", {
      hasFile: isUploadFile(file),
      fileName: isUploadFile(file) ? file.name : null,
      fileType: isUploadFile(file) ? file.type : null,
      fileSize: isUploadFile(file) ? file.size : null,
      prefix,
      hasBlobStoreId: Boolean(process.env.BLOB_STORE_ID),
      hasOidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
      hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    });

    if (!isUploadFile(file)) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    const url = await saveUploadedFile(file, prefix);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error) {
      console.error("[upload] route failed", {
        name: error.name,
        message: error.message,
        cause:
          error.cause instanceof Error
            ? { name: error.cause.name, message: error.cause.message }
            : error.cause ?? null,
        stack: error.stack,
      });
    } else {
      console.error("[upload] route failed", { error });
    }

    return handleApiError(error);
  }
}
