import { DocumentType, KycStatus, Role } from "@prisma/client";

import {
  getKycStatusForRole,
  getOwnerOptionalDocumentState,
} from "@/lib/kyc";

describe("getKycStatusForRole", () => {
  it("approves owners with only an approved identity document", () => {
    const status = getKycStatusForRole(Role.OWNER, [
      {
        documentType: DocumentType.PASSPORT,
        status: KycStatus.APPROVED,
      },
    ]);

    expect(status).toBe(KycStatus.APPROVED);
  });

  it("keeps renters pending until both identity and driver license are approved", () => {
    const status = getKycStatusForRole(Role.RENTER, [
      {
        documentType: DocumentType.ID_CARD,
        status: KycStatus.APPROVED,
      },
    ]);

    expect(status).toBe(KycStatus.PENDING);
  });

  it("does not revoke owner approval when an optional vehicle document is rejected", () => {
    const status = getKycStatusForRole(Role.OWNER, [
      {
        documentType: DocumentType.PASSPORT,
        status: KycStatus.APPROVED,
      },
      {
        documentType: DocumentType.VEHICLE_REGISTRATION,
        status: KycStatus.REJECTED,
      },
    ]);

    expect(status).toBe(KycStatus.APPROVED);
  });
});

describe("getOwnerOptionalDocumentState", () => {
  it("treats legacy owner driver license uploads as optional supporting documents", () => {
    const state = getOwnerOptionalDocumentState([
      {
        documentType: DocumentType.DRIVER_LICENSE,
        status: KycStatus.APPROVED,
      },
    ]);

    expect(state).toBe("UPLOADED");
  });
});
