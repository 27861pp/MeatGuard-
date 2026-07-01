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

## 🚀 Deployment

> โปรเจกต์ใช้ **HashRouter** → route ทั้งหมด (`#/home`, `#/dashboard`, `#/recipes`)
> ทำงานบน static host ได้เลย **ไม่ต้องตั้ง server rewrite** และ refresh/deep-link ไม่ 404
>
> **Base path** ตั้งอัตโนมัติ:
> - `npm run build` (ไม่มี env) → base = **`/MeatGuard-/`** (สำหรับ GitHub Pages)
> - ตั้ง `VITE_BASE=/` ตอน build → base = **`/`** (สำหรับ Firebase / Vercel / Netlify ที่เสิร์ฟจาก root)
>
> ⚠️ ต้องตั้ง `VITE_FIREBASE_*` ตอน build มิฉะนั้นเว็บจะรันเป็น **Demo Mode** (ไม่เชื่อม Firebase จริง)

### ตัวเลือก A — GitHub Pages (อัตโนมัติจาก repo นี้) ⭐

1. repo → **Settings → Pages → Source = “GitHub Actions”**
2. (ถ้าต้องการ Firebase จริง) เพิ่ม **Repository Secrets** `VITE_FIREBASE_*` ทั้ง 7 ตัว
   ที่ Settings → Secrets and variables → Actions
3. push ขึ้น `main` — workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml)
   จะ build (base `/MeatGuard-/`) แล้ว publish ให้อัตโนมัติ
4. เว็บจะขึ้นที่ **https://27861pp.github.io/MeatGuard-/**

> เดิมหน้าเว็บว่างเปล่าเพราะ build ใช้ base `/` แต่ GitHub Pages เสิร์ฟที่ `/MeatGuard-/`
> ทำให้โหลดไฟล์ JS ไม่เจอ — ตอนนี้แก้ให้ base ถูกต้องแล้ว

### ตัวเลือก B — Firebase Hosting (ใช้ระบบเดียวกับ Auth/DB)

```bash
npm install -g firebase-tools
firebase login
VITE_BASE=/ npm run build   # base = "/" (Firebase เสิร์ฟจาก root) + ใช้ค่าจาก .env
firebase deploy             # ใช้ firebase.json + .firebaserc (project: meat-83f83)
```

### ตัวเลือก C — Vercel (เชื่อมจาก GitHub, ไม่ต้องใช้ CLI)

1. ไปที่ [vercel.com](https://vercel.com) → **Add New Project** → import repo `27861pp/MeatGuard-`
2. Vercel ตรวจ `vercel.json` ให้อัตโนมัติ (ตั้ง `VITE_BASE=/` ให้แล้ว)
3. เพิ่ม **Environment Variables** ทั้ง 7 ตัว (`VITE_FIREBASE_*`) จากไฟล์ `.env`
4. กด **Deploy**

### ตัวเลือก D — Netlify

เชื่อม repo แล้ว Netlify จะอ่าน `netlify.toml` เอง (ตั้ง `VITE_BASE=/` ให้แล้ว) —
เพิ่ม env `VITE_FIREBASE_*` ในหน้า Site settings

### ตัวเลือก E — Auto-deploy ทุกครั้งที่ push (GitHub Actions → Firebase)

มี workflow ที่ [`.github/workflows/firebase-hosting.yml`](.github/workflows/firebase-hosting.yml) แล้ว
ตั้งค่า **Repository Secrets** (Settings → Secrets and variables → Actions):

| Secret | ค่า |
|--------|-----|
| `FIREBASE_SERVICE_ACCOUNT` | JSON ของ Service Account (Firebase Console → Project Settings → Service accounts → Generate new private key) |
| `VITE_FIREBASE_API_KEY` … `VITE_FIREBASE_DATABASE_URL` | ค่าเดียวกับใน `.env` (7 ตัว) |

หลังตั้งค่าครบ ทุกครั้งที่ push ขึ้น `main` ระบบจะ build + deploy ไป Firebase Hosting อัตโนมัติ
(ก่อนตั้ง secret workflow จะ build อย่างเดียวและผ่านเป็นสีเขียว ไม่ deploy)

### หลัง deploy — เพิ่ม Authorized Domain

Firebase Console → **Authentication → Settings → Authorized domains** →
เพิ่มโดเมนที่ deploy (เช่น `27861pp.github.io`, `meat-83f83.web.app`, `xxx.vercel.app`)
เพื่อให้ Google Sign-in ทำงาน

---

© MEAT GUARD — Smart Food Safety System
