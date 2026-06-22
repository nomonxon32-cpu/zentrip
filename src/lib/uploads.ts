import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { put } from "@vercel/blob";

import { acceptedUploadTypes, MAX_UPLOAD_SIZE } from "@/lib/constants";
import { ApiError } from "@/lib/http";

/**
 * Stores an uploaded file and returns a URL to persist in the database.
 *
 * Production / any environment with a Blob token: uploads to Vercel Blob (the
 * serverless filesystem is read-only, so we must NOT write to public/uploads).
 * Local development without a token: falls back to writing under public/uploads
 * so the dev experience works with no extra setup.
 */
export async function saveUploadedFile(file: File, folder = "general") {
  if (!acceptedUploadTypes.includes(file.type)) {
    throw new ApiError(400, "Unsupported file type. Upload JPG, PNG, WEBP, or PDF.");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ApiError(400, "File exceeds the 5MB upload limit.");
  }

  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "") || "general";
  const extension = path.extname(file.name) || mimeTypeToExtension(file.type);
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      const blob = await put(`uploads/${safeFolder}/${filename}`, file, {
        access: "public",
        // Random suffix keeps document URLs unguessable (matters for KYC docs).
        addRandomSuffix: true,
        contentType: file.type,
        token,
      });
      return blob.url;
    } catch {
      throw new ApiError(502, "Could not store the uploaded file. Please try again.");
    }
  }

  if (process.env.NODE_ENV === "production") {
    // Never write to the read-only serverless filesystem. Surface a clear,
    // actionable message instead of an EROFS stack trace.
    throw new ApiError(
      500,
      "File storage is not configured. Add the BLOB_READ_WRITE_TOKEN environment variable.",
    );
  }

  // Local-dev only fallback (filesystem is writable here).
  const absoluteDir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${safeFolder}/${filename}`;
}

function mimeTypeToExtension(type: string) {
  switch (type) {
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
