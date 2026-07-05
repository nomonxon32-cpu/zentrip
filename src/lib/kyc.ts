import { DocumentType, KycStatus, Role } from "@prisma/client";

export const identityDocumentTypes = [DocumentType.PASSPORT, DocumentType.ID_CARD] as const;
export const renterDriverLicenseTypes = [DocumentType.DRIVER_LICENSE] as const;
export const ownerOptionalDocumentTypes = [
  DocumentType.VEHICLE_REGISTRATION,
  DocumentType.DRIVER_LICENSE,
] as const;

type KycDocumentSnapshot = {
  documentType: DocumentType;
  status: KycStatus;
};

export function getAllowedKycDocumentTypes(role: Role): DocumentType[] {
  if (role === Role.OWNER) {
    return [DocumentType.PASSPORT, DocumentType.ID_CARD, DocumentType.VEHICLE_REGISTRATION];
  }

  return [DocumentType.PASSPORT, DocumentType.ID_CARD, DocumentType.DRIVER_LICENSE];
}

export function isKycDocumentTypeAllowedForRole(role: Role, documentType: DocumentType) {
  return getAllowedKycDocumentTypes(role).includes(documentType);
}

export function isRequiredKycDocumentType(role: Role, documentType: DocumentType) {
  if (identityDocumentTypes.includes(documentType as (typeof identityDocumentTypes)[number])) {
    return true;
  }

  return role === Role.RENTER && documentType === DocumentType.DRIVER_LICENSE;
}

export function getDocumentGroupStatus(
  documents: readonly KycDocumentSnapshot[],
  documentTypes: readonly DocumentType[],
) {
  const matches = documents.filter((document) => documentTypes.includes(document.documentType));

  if (matches.some((document) => document.status === KycStatus.APPROVED)) {
    return KycStatus.APPROVED;
  }

  if (matches.some((document) => document.status === KycStatus.PENDING)) {
    return KycStatus.PENDING;
  }

  if (matches.some((document) => document.status === KycStatus.REJECTED)) {
    return KycStatus.REJECTED;
  }

  return KycStatus.NOT_SUBMITTED;
}

export function getOwnerOptionalDocumentState(documents: readonly KycDocumentSnapshot[]) {
  const matches = documents.filter((document) =>
    (ownerOptionalDocumentTypes as readonly DocumentType[]).includes(document.documentType),
  );

  if (matches.some((document) => document.status === KycStatus.APPROVED)) {
    return "UPLOADED" as const;
  }

  if (matches.some((document) => document.status === KycStatus.PENDING)) {
    return KycStatus.PENDING;
  }

  if (matches.some((document) => document.status === KycStatus.REJECTED)) {
    return KycStatus.REJECTED;
  }

  return "NOT_UPLOADED" as const;
}

export function getKycStatusForRole(role: Role, documents: readonly KycDocumentSnapshot[]) {
  const identityStatus = getDocumentGroupStatus(documents, identityDocumentTypes);

  if (role === Role.OWNER) {
    if (identityStatus === KycStatus.APPROVED) {
      return KycStatus.APPROVED;
    }

    if (identityStatus === KycStatus.REJECTED) {
      return KycStatus.REJECTED;
    }

    return documents.length ? KycStatus.PENDING : KycStatus.NOT_SUBMITTED;
  }

  const driverLicenseStatus = getDocumentGroupStatus(documents, renterDriverLicenseTypes);

  if (identityStatus === KycStatus.APPROVED && driverLicenseStatus === KycStatus.APPROVED) {
    return KycStatus.APPROVED;
  }

  if (identityStatus === KycStatus.REJECTED || driverLicenseStatus === KycStatus.REJECTED) {
    return KycStatus.REJECTED;
  }

  return documents.length ? KycStatus.PENDING : KycStatus.NOT_SUBMITTED;
}
