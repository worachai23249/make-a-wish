// scripts/inspect-db.js
const { PrismaClient } = require('../src/generated/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

const url = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username || 'root',
  password: url.password || '',
  database: url.pathname.replace('/', ''),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== USERS ===');
  const users = await prisma.user.findMany({
    select: { id: true, username: true, displayName: true, email: true, role: true }
  });
  console.table(users);

  console.log('=== SPACES ===');
  const spaces = await prisma.space.findMany({
    include: {
      members: { include: { user: { select: { displayName: true } } } }
    }
  });
  
  const formattedSpaces = spaces.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type,
    inviteCode: s.inviteCode,
    members: s.members.map(m => m.user.displayName).join(', ')
  }));
  console.table(formattedSpaces);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
