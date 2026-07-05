import bcrypt from "bcrypt";
import { KycStatus, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const LEGACY_ADMIN_EMAIL = "admin@uzcar.uz";
const PRIMARY_ADMIN_EMAIL = "nomonxon32@gmail.com";
const PRIMARY_ADMIN_PASSWORD = "7This$Is$My$Code$7Theo";
const PRIMARY_ADMIN_NAME = "Zentrip Admin";
const PRIMARY_ADMIN_PHONE = "+998 90 000 00 01";
const PRIMARY_ADMIN_CITY = "Tashkent";

async function resolveFallbackRole(userId: string) {
  const ownedVehicleCount = await prisma.vehicle.count({
    where: { ownerId: userId },
  });

  return ownedVehicleCount > 0 ? Role.OWNER : Role.RENTER;
}

async function main() {
  const passwordHash = await bcrypt.hash(PRIMARY_ADMIN_PASSWORD, 10);

  const [legacyAdmin, primaryAdmin] = await Promise.all([
    prisma.user.findUnique({
      where: { email: LEGACY_ADMIN_EMAIL },
    }),
    prisma.user.findUnique({
      where: { email: PRIMARY_ADMIN_EMAIL },
    }),
  ]);

  const primaryAdminId = await prisma.$transaction(async (tx) => {
    if (primaryAdmin) {
      await tx.user.update({
        where: { id: primaryAdmin.id },
        data: {
          name: primaryAdmin.name || PRIMARY_ADMIN_NAME,
          passwordHash,
          role: Role.ADMIN,
          phone: primaryAdmin.phone || PRIMARY_ADMIN_PHONE,
          city: primaryAdmin.city || PRIMARY_ADMIN_CITY,
          emailVerifiedAt: primaryAdmin.emailVerifiedAt ?? new Date(),
          kycStatus: KycStatus.APPROVED,
          isSuspended: false,
        },
      });

      return primaryAdmin.id;
    }

    if (legacyAdmin) {
      const updated = await tx.user.update({
        where: { id: legacyAdmin.id },
        data: {
          email: PRIMARY_ADMIN_EMAIL,
          name: legacyAdmin.name || PRIMARY_ADMIN_NAME,
          passwordHash,
          role: Role.ADMIN,
          phone: legacyAdmin.phone || PRIMARY_ADMIN_PHONE,
          city: legacyAdmin.city || PRIMARY_ADMIN_CITY,
          emailVerifiedAt: legacyAdmin.emailVerifiedAt ?? new Date(),
          kycStatus: KycStatus.APPROVED,
          isSuspended: false,
        },
      });

      return updated.id;
    }

    const created = await tx.user.create({
      data: {
        name: PRIMARY_ADMIN_NAME,
        email: PRIMARY_ADMIN_EMAIL,
        phone: PRIMARY_ADMIN_PHONE,
        emailVerifiedAt: new Date(),
        passwordHash,
        role: Role.ADMIN,
        city: PRIMARY_ADMIN_CITY,
        kycStatus: KycStatus.APPROVED,
        isSuspended: false,
      },
    });

    return created.id;
  });

  if (legacyAdmin && primaryAdmin && legacyAdmin.id !== primaryAdmin.id) {
    const fallbackRole = await resolveFallbackRole(legacyAdmin.id);

    await prisma.user.update({
      where: { id: legacyAdmin.id },
      data: {
        role: fallbackRole,
      },
    });

    console.log(
      `Demoted legacy admin account ${LEGACY_ADMIN_EMAIL} to ${fallbackRole} because ${PRIMARY_ADMIN_EMAIL} is now the primary admin.`,
    );
  }

  console.log(`Primary admin is ready: ${PRIMARY_ADMIN_EMAIL}`);
  console.log(`Primary admin user id: ${primaryAdminId}`);
}

main()
  .catch((error) => {
    console.error("Failed to set the primary admin account.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
