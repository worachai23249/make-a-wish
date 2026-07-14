// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin if not exists
  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        username: "admin",
        displayName: "ผู้ดูแลระบบ (Admin)",
        email: "admin@wishy.com",
        passwordHash,
        emoji: "👑",
        role: "admin",
      },
    });
    console.log("✅ Admin user created:");
    console.log("   Email: admin@wishy.com");
    console.log("   Password: admin123");
  } else {
    console.log("ℹ️  Admin already exists, skipping.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
