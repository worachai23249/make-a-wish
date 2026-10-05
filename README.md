# Make a Wish 🎁 — แอปแชร์ความปรารถนากับคนพิเศษ

ระบบบันทึกรายการของขวัญ/ความปรารถนาและแชร์กับคนพิเศษในห้องส่วนตัว พร้อมฟังก์ชันวงล้อสุ่มของขวัญและ Progressive Web App (PWA) 

สถาปัตยกรรมและเทคโนโลยีถอดแบบมาจาก **church_accounting (HWP Accounting)** ทุกประการ เพื่อความเร็วระดับสูงสุด (Zero Latency)

---

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)

* **Build Tool:** Vite (Bundler ความเร็วสูง)
* **ภาษาหลัก:** JavaScript (ES6+) / React 18 / HTML5 / CSS3
* **UI/UX Design:** Tailwind CSS (Glassmorphism รองรับ Light / Dark Mode)
* **ไอคอน:** Lucide React Icons
* **ฐานข้อมูล (Database):** Supabase Cloud (PostgreSQL) ผ่าน `@supabase/supabase-js`
* **โฮสติ้ง (Hosting):** Cloudflare Pages (Global Edge CDN เร็วระดับ <10ms)
* **การติดตั้ง (PWA):** Progressive Web App (Standalone Mode พร้อมไอคอนความละเอียดสูง)

---

## 🌟 ฟังก์ชันการทำงานหลัก (Key Features)

1. **ระบบยืนยันตัวตน (Authentication & Persistent Session)**
   - ค้างสถานะล็อกอินไว้ตลอดเหมือน Facebook (ไม่ต้องกรอกรหัสใหม่ทุกครั้ง)
   - แอดมิน: `admin@gmail.com` / `123456` ➡️ เข้าแผงควบคุม `/admin`
   - ผู้ใช้ทั่วไป: สมัครสมาชิกแล้วล็อกอินอัตโนมัติ ➡️ เข้าแดชบอร์ด

2. **หน้าหลักและระบบห้อง (Dashboard & Spaces)**
   - สร้างห้อง 1-on-1 หรือกลุ่ม พร้อมเลือกอีโมจิ
   - สุ่มรหัสเชิญ 6 หลักอัตโนมัติ (เช่น `AB12CD`)
   - พิมพ์รหัส 6 หลักเพื่อเข้าร่วมห้องได้ทันที

3. **ระบบรายการของขวัญ (Wishes & Optimistic UI)**
   - 3 หมวดหมู่: 🎁 สิ่งของ, 🍜 อาหาร, 📍 สถานที่
   - ตัวกรอง: ทั้งหมด / ของฉัน / ของคนอื่น
   - Optimistic UI (0 วินาที): เพิ่ม/ลบของขวัญหน้าจอเปลี่ยนทันที

4. **วงล้อสุ่มของขวัญ (Gift Roulette)**
   - ปุ่ม "🎰 สุ่มของขวัญ" พร้อมแอนิเมชันการหมุนสลับของขวัญ
   - หยุดที่ของขวัญผู้โชคดี พร้อมเอฟเฟกต์หัวใจลอยกระจาย (ConfettiHearts)

5. **ระบบเพื่อน (Friends Management)**
   - ค้นหาเพื่อนด้วย `@username`
   - ส่งคำขอเป็นเพื่อน / ตรวจสอบรายชื่อเพื่อน

6. **โปรไฟล์และรูปถ่าย (Canvas Image Compression)**
   - บีบอัดรูปโปรไฟล์อัตโนมัติด้วย HTML5 Canvas เหลือไม่เกิน 256x256 px คุณภาพ 82% (ลดเหลือเพียง 10-20 KB)

7. **แผงควบคุมแอดมิน (Admin Panel)**
   - สถิติจำนวนผู้ใช้, ห้อง, และของขวัญ
   - ตารางดูรายชื่อผู้ใช้ทั้งหมด และปุ่มลบบัญชี

---

## 🚀 วิธี Deploy บน Cloudflare Pages (เหมือน church_accounting)

1. Push โค้ดขึ้น GitHub Repository (`worachai23249/make-a-wish`)
2. เข้าไปที่ **Cloudflare Dashboard** ➡️ **Workers & Pages** ➡️ **Create application** ➡️ **Pages** ➡️ **Connect to Git**
3. เลือก Repository `make-a-wish`
4. ตั้งค่า Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. กด **Save and Deploy** จะได้ URL ใช้งานจริงทันที เช่น `https://make-a-wish.pages.dev`
