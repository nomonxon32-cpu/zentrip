import { randomUUID } from "node:crypto";

import { put } from "@vercel/blob";

import { acceptedUploadTypes, MAX_UPLOAD_SIZE } from "@/lib/constants";
import { ApiError } from "@/lib/http";

const uploadFolderMap = {
  vehicles: "vehicles",
  kyc: "kyc",
  general: "general",
} as const;

export type UploadFolder = keyof typeof uploadFolderMap;

export function resolveUploadFolder(folder: string | null | undefined): UploadFolder {
  if (!folder) return "general";

  const normalized = folder.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return normalized in uploadFolderMap ? (normalized as UploadFolder) : "general";
}

export async function saveUploadedFile(file: File, folder: UploadFolder = "general") {
  if (!acceptedUploadTypes.includes(file.type)) {
    throw new ApiError(400, "Unsupported file type. Upload JPG, JPEG, PNG, WEBP, or PDF.");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ApiError(400, "File exceeds the 4 MB upload limit.");
  }

  const prefix = uploadFolderMap[folder];
  const hasBlobStoreId = Boolean(process.env.BLOB_STORE_ID);
  const hasOidcToken = Boolean(process.env.VERCEL_OIDC_TOKEN);
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  console.info("[upload] blob upload requested", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    prefix,
    hasBlobStoreId,
    hasOidcToken,
    hasBlobToken,
  });

  if (!hasOidcToken && !hasBlobToken) {
    throw new ApiError(
      500,
      "File storage is not configured. Connect the Blob store in Vercel or provide a valid BLOB_READ_WRITE_TOKEN for local uploads.",
    );
  }

  const extension = getFileExtension(file.name, file.type);
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const pathname = `${prefix}/${filename}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    console.info("[upload] blob upload complete", {
      fileName: file.name,
      prefix,
      url: blob.url,
      hasBlobStoreId,
      hasOidcToken,
      hasBlobToken,
    });

    return blob.url;
  } catch (error) {
    console.error("[upload] blob upload failed", serializeUploadError(error, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      prefix,
    }));

    throw new ApiError(502, "Could not store the uploaded file. Please try again.");
  }
}

function getFileExtension(fileName: string, mimeType: string) {
  const rawExtension = fileName.includes(".") ? `.${fileName.split(".").pop() ?? ""}` : "";
  const safeExtension = rawExtension.toLowerCase();

  if (safeExtension && /^\.([a-z0-9]{1,8})$/i.test(safeExtension)) {
    return safeExtension;
  }

  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

function serializeUploadError(
  error: unknown,
  context: { fileName: string; fileType: string; fileSize: number; prefix: string },
) {
  if (error instanceof Error) {
    return {
      ...context,
      name: error.name,
      message: error.message,
      cause:
        error.cause instanceof Error
          ? { name: error.cause.name, message: error.cause.message }
          : error.cause ?? null,
      stack: error.stack,
    };
  }

  return {
    ...context,
    name: "UnknownUploadError",
    message: String(error),
    cause: null,
  };
}
