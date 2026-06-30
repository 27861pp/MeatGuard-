# 🛡️ MEAT GUARD — Smart Food Safety System

ระบบอัจฉริยะตรวจสอบ **คุณภาพและความสดของเนื้อสัตว์** แบบ Real-Time ด้วยเซ็นเซอร์ IoT
และการวิเคราะห์อัจฉริยะ — ตรวจจับก๊าซจากการเน่าเสีย (NH₃ / H₂S) วิเคราะห์ระดับความปลอดภัย
และแจ้งเตือนผู้ใช้งานก่อนบริโภค

ออกแบบในสไตล์ **Modern Premium Technology** · Dark Mode · Glassmorphism · Smooth Animation ·
Responsive 100% (Desktop / Tablet / Mobile)

---

## ✨ ฟีเจอร์หลัก

| หมวด | รายละเอียด |
|------|-----------|
| 🔐 **Authentication** | Google Sign-In ผ่าน Firebase Auth · Protected Routes · Profile + Logout |
| 🏠 **Landing Page** | Hero · How It Works (Timeline) · Food Safety · Did You Know · Consumption · Storage Guide |
| 📊 **Monitor Dashboard** | Sensor Cards · Real-Time Charts (Chart.js) · AI-like Analysis (Fresh / Warning / Spoiled) |
| 🔔 **Notification** | Toast แจ้งเตือนอัตโนมัติเมื่อระดับคุณภาพเปลี่ยน |
| 🧪 **Demo Mode** | รันได้ทันทีโดยไม่ต้องตั้งค่า Firebase — จำลอง Login + ข้อมูลเซ็นเซอร์ |
| 🔌 **Hardware Ready** | พร้อมเชื่อมต่อ ESP32 + Sensor จริง (ดู `firmware/esp32_meatguard.ino`) |

---

## 🧱 Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui structure (`src/components/ui`)
- **Animation:** Framer Motion
- **Charts:** Chart.js + react-chartjs-2
- **Backend / Auth / DB:** Firebase (Authentication + Realtime Database)
- **Icons:** lucide-react

---

## 🚀 เริ่มต้นใช้งาน

```bash
# 1) ติดตั้ง dependencies
npm install

# 2) รัน dev server  (เปิด http://localhost:5173)
npm run dev

# 3) build สำหรับ production
npm run build && npm run preview
```

> **ยังไม่ต้องตั้งค่าอะไรก็รันได้!** หากไม่มีค่า Firebase ในไฟล์ `.env`
> ระบบจะเข้าสู่ **DEMO MODE** อัตโนมัติ — จำลองการ Login และสร้างข้อมูลเซ็นเซอร์
> ให้ทดลองใช้งานครบทุกหน้า

---

## 🔥 ตั้งค่า Firebase (สำหรับใช้งานจริง)

1. สร้างโปรเจกต์ที่ <https://console.firebase.google.com>
2. **Authentication → Sign-in method →** เปิดใช้งาน **Google**
3. **Realtime Database →** สร้างฐานข้อมูล แล้ววาง Rules จากไฟล์ [`FIREBASE_RULES.json`](./FIREBASE_RULES.json)
4. **Project Settings → Web App →** คัดลอกค่า config
5. คัดลอก `.env.example` เป็น `.env` แล้วกรอกค่า:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=https://<project>-default-rtdb.firebaseio.com
```

6. รัน `npm run dev` ใหม่ — ระบบจะสลับเป็น **LIVE MODE** อัตโนมัติ

### โครงสร้างฐานข้อมูล (Realtime Database)

```
meat/
├── latest/
│   ├── temperature   (number, °C)
│   ├── humidity      (number, %)
│   ├── nh3           (number, ppm)
│   ├── h2s           (number, ppm)
│   └── timestamp     (number, epoch ms)
└── history/
    └── <pushId>/ { temperature, humidity, nh3, h2s, timestamp }
```

---

## 🔌 เชื่อมต่อ ESP32 + Sensor จริง

ดูตัวอย่างเฟิร์มแวร์ที่ [`firmware/esp32_meatguard.ino`](./firmware/esp32_meatguard.ino)

| Sensor | ค่า | ขา (ตัวอย่าง) |
|--------|-----|----------------|
| DHT22 | Temperature + Humidity | GPIO 4 |
| MQ-137 | NH₃ (Ammonia) | GPIO 34 (Analog) |
| MQ-136 | H₂S (Sulfide) | GPIO 35 (Analog) |

อุปกรณ์จะเขียนค่าไปยัง `meat/latest` และ push เข้า `meat/history` ตามรอบที่กำหนด
ซึ่งตรงกับที่ Dashboard subscribe ไว้ทุกประการ

---

## 🧠 ตรรกะการวิเคราะห์ (`src/lib/analysis.ts`)

| ระดับ | เงื่อนไข (ค่าเริ่มต้น) | ผลลัพธ์ |
|-------|----------------------|---------|
| 🟢 **Fresh** | NH₃ ≤ 5 ppm และ H₂S ≤ 0.5 ppm | สามารถบริโภคได้อย่างปลอดภัย |
| 🟡 **Warning** | ค่าเริ่มสูงขึ้น | ควรนำไปปรุงอาหารโดยเร็ว |
| 🔴 **Spoiled** | NH₃ ≥ 12 ppm หรือ H₂S ≥ 1.5 ppm | ไม่แนะนำให้บริโภค |

> ค่า threshold เป็นค่าตั้งต้นเชิงสาธิต — ควร **calibrate** กับเซ็นเซอร์และชนิดเนื้อจริงก่อนใช้งานจริง

---

## 📁 โครงสร้างโปรเจกต์

```
src/
├── components/
│   ├── ui/            # shadcn primitives (skeleton, card, button, badge)
│   ├── layout/        # Navbar, Footer
│   ├── sections/      # Hero, HowItWorks, FoodSafety, DidYouKnow, ...
│   └── dashboard/     # SensorCard, RealtimeChart, AnalysisResult, Sidebar, ...
├── contexts/          # AuthContext (Firebase + demo)
├── hooks/             # useSensorData (RTDB + demo simulator)
├── lib/               # analysis, firebase, mockSensor, utils
└── pages/             # Home, Login, Dashboard, NotFound
```

---

## 🔒 Security

- **Firebase Security Rules** — อ่าน/เขียนเฉพาะผู้ใช้ที่ผ่านการยืนยันตัวตน + validate ชนิดข้อมูล
- **Protected Routes** — หน้า Dashboard เข้าถึงได้เฉพาะหลัง Login
- **Data Validation** — normalize ข้อมูลจาก Firebase ก่อนนำไปแสดง
- **Secrets** — ค่า config อยู่ใน `.env` (ถูก gitignore แล้ว)

---

© MEAT GUARD — Smart Food Safety System
