import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { acceptedUploadTypes, MAX_UPLOAD_SIZE } from "@/lib/constants";
import { ApiError } from "@/lib/http";

export async function saveUploadedFile(file: File, folder = "general") {
  if (!acceptedUploadTypes.includes(file.type)) {
    throw new ApiError(400, "Unsupported file type. Upload JPG, PNG, WEBP, or PDF.");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ApiError(400, "File exceeds the 5MB upload limit.");
  }

  const extension = path.extname(file.name) || mimeTypeToExtension(file.type);
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const relativeDir = path.join("public", "uploads", folder);
  const absoluteDir = path.join(process.cwd(), relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(path.join(absoluteDir, filename), Buffer.from(arrayBuffer));

  return `/uploads/${folder}/${filename}`;
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
