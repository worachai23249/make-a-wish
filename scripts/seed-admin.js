const bcrypt = require('bcryptjs');
const mysql2 = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  
  const url = new URL(process.env.DATABASE_URL);
  
  const connection = await mysql2.createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username || 'root',
    password: url.password || '',
    database: url.pathname.replace('/', ''),
    ssl: {
      rejectUnauthorized: false
    },
    charset: 'utf8mb4',
  });

  try {
    // Check if admin exists
    const [rows] = await connection.execute("SELECT id FROM users WHERE username = 'admin'");
    if (rows.length > 0) {
      console.log('ℹ️  Admin already exists, skipping.');
    } else {
      await connection.execute(
        `INSERT INTO users (id, username, displayName, email, passwordHash, emoji, role, createdAt, updatedAt) 
         VALUES (UUID(), 'admin', 'ผู้ดูแลระบบ', 'admin@wishy.com', ?, '👑', 'admin', NOW(), NOW())`,
        [passwordHash]
      );
      console.log('✅ Admin created successfully in Aiven Cloud Database!');
      console.log('   Email: admin@wishy.com');
      console.log('   Password: admin123');
    }
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
