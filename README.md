# Make a Wish 🎁 — แอปแชร์ความปรารถนากับคนพิเศษ

ระบบบันทึกรายการของขวัญ/ความปรารถนาและแชร์กับคนพิเศษในห้องส่วนตัว พร้อมฟังก์ชันวงล้อสุ่มของขวัญและ Progressive Web App (PWA)

---

## 🌟 ฟังก์ชันหลัก (Key Features)

1. **ระบบยืนยันตัวตนและการเข้าถึง (Authentication & Role Guards)**
   - Persistent Session อยู่ได้นาน 1 ปี ผ่าน NextAuth v5
   - Role-Based Redirect: บัญชีแอดมิน (`admin`) ไป `/admin` เสมอ, บัญชีทั่วไป (`user`) ไป `/dashboard` เสมอ
   - Next.js Proxy/Middleware ปกป้องทุกหน้าส่วนตัว

2. **หน้าหลักและระบบห้อง (Dashboard & Spaces)**
   - แสดงห้องทั้งหมดที่ตนเองเป็นเจ้าของและสมาชิก
   - สร้างห้องแบบ 1-on-1 หรือห้องกลุ่ม พร้อมเลือกอีโมจิ
   - สุ่มรหัสเชิญ 6 หลักอัตโนมัติ (เช่น `AB12CD`)
   - ระบบพิมพ์รหัส 6 หลักเพื่อเข้าร่วมห้องทันที

3. **ระบบรายการของขวัญ (Wishes & Optimistic UI)**
   - 3 หมวดหมู่: 🎁 สิ่งของ, 🍜 อาหาร, 📍 สถานที่
   - ตัวกรอง: ทั้งหมด / ของฉัน / ของคนอื่น
   - Optimistic UI (0 วินาที): เพิ่มหรือลบของขวัญหน้าจอเปลี่ยนทันที แล้วซิงค์ลงฐานข้อมูล

4. **วงล้อสุ่มของขวัญ (Gift Roulette)**
   - ปุ่ม "🎰 สุ่มของขวัญ" ดึงของขวัญทั้งหมดในห้องมาใส่ในวงล้อ
   - แอนิเมชันหมุนสลับของขวัญ หยุดที่ผู้โชคดี พร้อมเอฟเฟกต์หัวใจลอย (ConfettiHearts)

5. **ระบบเพื่อน (Friends Management)**
   - ค้นหาเพื่อนด้วย `@username`
   - ส่งคำขอเป็นเพื่อน
   - ยอมรับหรือปฏิเสธคำขอ / ยกเลิกการเป็นเพื่อน

6. **โปรไฟล์และรูปถ่าย (Profile & Canvas Image Compression)**
   - แก้ไข Display Name และอีโมจิประจำตัว
   - บีบอัดรูปโปรไฟล์อัตโนมัติด้วย HTML5 Canvas เหลือไม่เกิน 256x256 px คุณภาพ 82% (ขนาดลดเหลือเพียง 10-20 KB)
   - ดึงรูปผ่าน `/api/users/[id]/avatar` พร้อมตั้งค่า `Cache-Control: public, max-age=86400`

7. **แผงควบคุมแอดมิน (Admin Panel)**
   - สถิติจำนวนผู้ใช้, ห้อง, และของขวัญทั้งหมด
   - ตารางรายชื่อผู้ใช้ สิทธิ์ และวันที่สมัคร
   - ลบบัญชีผู้ใช้พร้อม Cascade Delete ปลอดภัย

8. **Progressive Web App (PWA)**
   - ไอคอนแอปสีชมพูพาสเทลความละเอียดสูง (`icon-192.png`, `icon-512.png`)
   - ติดตั้งลงมือถือได้ทั้ง iOS (Add to Home Screen) และ Android
   - เปิดใช้งานแบบ Standalone เต็มหน้าจอ

---

## 🛠️ โครงสร้างฐานข้อมูล (Prisma Models)

- `users`: ผู้ใช้งาน (id, username, displayName, email, passwordHash, emoji, avatarUrl, role)
- `spaces`: ห้องแชร์ความปรารถนา (id, name, type, emoji, inviteCode, ownerId)
- `space_members`: ตารางความสัมพันธ์สมาชิกห้อง (spaceId, userId, joinedAt)
- `wishes`: รายการของขวัญ (id, title, description, emoji, category, spaceId, userId)
- `friendships`: ความสัมพันธ์เพื่อน (id, senderId, receiverId, status)

---

## 🚀 การติดตั้งและเริ่มใช้งาน

```bash
# ติดตั้ง dependencies
npm install

# ซิงค์ Prisma Schema กับฐานข้อมูล
npx prisma db push
npx prisma generate

# สร้างบัญชี Admin เริ่มต้น
npm run create-admin
# บัญชี: admin@gmail.com / 123456

# รันในโหมดพัฒนา
npm run dev
```

---

## 🌐 การ Deploy (เหมือน church_accounting)

1. นำโค้ดขึ้น GitHub (`worachai23249/make-a-wish`)
2. เชื่อมต่อโปรเจกต์บน **Vercel**
3. กำหนด Environment Variables บน Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL`
