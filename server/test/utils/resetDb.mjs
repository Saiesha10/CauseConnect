import { PrismaClient } from "../../generated/prisma/index.js";
const prisma = new PrismaClient();

export async function resetDb() {
  console.log("🧹 Resetting database...");

  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.eventVolunteer.deleteMany();
  await prisma.event.deleteMany();
  await prisma.nGO.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cause.deleteMany();

  console.log("✅ Database reset complete.");
}
