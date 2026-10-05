import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const plainPassword = '123456';
    const email = 'admin@gmail.com';
    const username = 'admin';

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            passwordHash: passwordHash,
            role: 'admin',
        },
        create: {
            email: email,
            username: username,
            displayName: 'ผู้ดูแลระบบ',
            passwordHash: passwordHash,
            role: 'admin',
            emoji: '👑',
        },
    });

    console.log(`✅ สร้างแอดมิน Make a Wish สำเร็จ!`);
    console.log(`------------------------`);
    console.log(`อีเมล: ${user.email}`);
    console.log(`ชื่อผู้ใช้: @${user.username}`);
    console.log(`รหัสผ่าน: ${plainPassword}`);
    console.log(`บทบาท: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
