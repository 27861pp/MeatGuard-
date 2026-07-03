/*********************************************************************
 *  MEAT GUARD — ESP32 sensor-box firmware
 *  (ตรงกับเฟิร์มแวร์จริงของกล่อง — ใส่ WiFi/บัญชีอุปกรณ์ของคุณเองก่อนใช้)
 *
 *  Board   : ESP32
 *  Library : FirebaseClient (Mobizt) v2.x
 *  Sensors : DHT22 + MQ-135 (NH3)   [MQ-136 (H2S) ยังไม่ต่อ → ส่ง 0]
 *
 *  *** การต่อสาย ***
 *    MQ-135 AO  -> GPIO33 (ADC1) — ผ่าน voltage divider 5V->3.3V
 *    MQ-135 VCC(heater) -> 5V
 *    DHT22 DATA -> GPIO4  (pull-up 10k ระหว่าง DATA กับ VCC)
 *    แบตลิเทียม + -> [R1] -> GPIO35 -> [R2] -> GND  (R1=R2 เช่น 100k/100k)
 *
 *  *** ข้อมูลที่ส่งขึ้น Firebase Realtime Database ***
 *    /meat/live        ทุก 2 วิ   — ฟีดสดสำหรับกราฟวิต่อวิบนเว็บ
 *    /meat/latest      ทุก 1 นาที — ค่าล่าสุด (การ์ด/ผลวิเคราะห์)
 *    /meat/history/<n> ทุก 1 นาที — บันทึกย้อนหลัง
 *********************************************************************/

#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <DHT.h>
#include <math.h>

/* ===================== ตั้งค่าที่ต้องแก้ ===================== */
#define WIFI_SSID      "YOUR_WIFI_SSID"
#define WIFI_PASSWORD  "YOUR_WIFI_PASSWORD"

#define Web_API_KEY    "AIzaSyA4sLKQy-mrmfcYNsptYo8fCt0H63gDGE4"
#define DATABASE_URL   "https://meat-83f83-default-rtdb.asia-southeast1.firebasedatabase.app/"
// บัญชีอุปกรณ์ (Firebase Auth แบบ Email/Password ที่สร้างไว้ให้กล่อง)
#define USER_EMAIL     "device@example.com"
#define USER_PASS      "YOUR_DEVICE_PASSWORD"
/* =========================================================== */

/* ---------- ขาเซ็นเซอร์ ---------- */
#define DHTPIN        4
#define DHTTYPE       DHT22
#define MQ135_AO_PIN  33   // MQ-135 -> GPIO33 (ADC1)
#define BATT_AO_PIN   35   // แบตลิเทียม -> GPIO35 (ADC1) ผ่าน voltage divider

/* ---------- แบตเตอรี่ลิเทียม ----------
 * ถ้า R1 = R2 (เช่น 100k/100k) → BATT_DIVIDER = 2.0
 * จูน BATT_DIVIDER ให้ตรงกับมัลติมิเตอร์ เพราะ ADC ของ ESP32 คลาดเคลื่อนได้
 */
#define BATT_DIVIDER  2.0
#define BATT_ADC_REF  3.3
#define BATT_FULL_V   4.20   // LiPo เต็ม = 100%
#define BATT_EMPTY_V  3.30   // LiPo หมด = 0%

/* ---------- ค่าคงที่เซ็นเซอร์ ---------- */
#define RL 1.0
#define CALIBRATE_SAMPLES  50
#define CALIBRATE_INTERVAL 500
#define MQ135_CLEAN_AIR_RATIO 3.6
#define MQ135_A 102.2
#define MQ135_B -2.473

#define REF_TEMP 20.0
#define REF_HUM  65.0

#define NH3_FRESH    10.0
#define NH3_WARNING  25.0

#define PREHEAT_SEC        30      // อุ่นเซ็นเซอร์ก่อน calibrate (วินาที)
#define TEST_DURATION_MIN  120
#define MEASURE_INTERVAL   60000   // บันทึก latest/history ทุก 1 นาที
#define LIVE_INTERVAL      2000    // ส่งฟีดสด meat/live ทุก 2 วิ (กราฟวิต่อวิบนเว็บ)

/* ---------- Firebase objects ---------- */
void processData(AsyncResult &aResult);
UserAuth user_auth(Web_API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
RealtimeDatabase Database;

/* ---------- ตัวแปรเซ็นเซอร์ ---------- */
DHT dht(DHTPIN, DHTTYPE);
float MQ135_RO = 10.0;

/* ---------- ตัวแปรจับเวลา ---------- */
unsigned long lastMeasure = 0;
unsigned long lastLive    = 0;
bool firstDone = false;
bool testDone  = false;
int  reading   = 1;

/* ค่า DHT ล่าสุดที่อ่านได้ (ใช้ในฟีดสด เผื่อ DHT ยังไม่พร้อม) */
float lastTemp = REF_TEMP;
float lastHum  = REF_HUM;

/* ====================== ฟังก์ชันเซ็นเซอร์ ====================== */
float getRs(int rawADC) {
  if (rawADC <= 0) rawADC = 1;
  return ((4095.0 - rawADC) / rawADC) * RL;
}

float getTHcorrection(float temp, float hum) {
  float c = 1.0 - 0.006 * (temp - REF_TEMP) - 0.002 * (hum - REF_HUM);
  if (c < 0.5) c = 0.5;
  if (c > 1.5) c = 1.5;
  return c;
}

float getPPM(float Rs, float Ro, float a, float b, float temp, float hum) {
  float ratio = (Rs * getTHcorrection(temp, hum)) / Ro;
  if (ratio <= 0.001) ratio = 0.001;
  float ppm = a * pow(ratio, b);
  if (ppm < 0)    ppm = 0;
  if (ppm > 9999) ppm = 9999;
  return ppm;
}

float calibrateRo(int pin, float cleanAirRatio, float temp, float hum) {
  float rsSum = 0;
  for (int i = 0; i < CALIBRATE_SAMPLES; i++) {
    rsSum += getRs(analogRead(pin)) * getTHcorrection(temp, hum);
    delay(CALIBRATE_INTERVAL);
    if (i % 10 == 0) {
      Serial.print("  Sample "); Serial.print(i);
      Serial.print(" / ");       Serial.println(CALIBRATE_SAMPLES);
    }
  }
  return (rsSum / CALIBRATE_SAMPLES) / cleanAirRatio;
}

String getStatus(float nh3) {
  if (nh3 >= NH3_WARNING) return "SPOILED";
  else if (nh3 >= NH3_FRESH) return "WARNING";
  else return "FRESH";
}

String sensorCheck(int raw, float rs) {
  if (raw <= 0)    return "RAW=0!";
  if (raw >= 4090) return "SAT!";    // ชนเพดาน = AO เกิน 3.3V (ต้องมี divider)
  if (rs < 1.0)    return "Rs LOW!";
  if (rs > 200.0)  return "Rs HIGH!";
  return "OK";
}

/* อ่านเปอร์เซ็นต์แบตลิเทียม (เฉลี่ย 16 ครั้ง) */
int readBatteryPct() {
  uint32_t sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(BATT_AO_PIN); delay(2); }
  float adc = sum / 16.0;
  float v   = (adc / 4095.0) * BATT_ADC_REF * BATT_DIVIDER;   // แรงดันแบตจริง (V)
  int   pct = (int)((v - BATT_EMPTY_V) / (BATT_FULL_V - BATT_EMPTY_V) * 100.0 + 0.5);
  if (pct < 0)   pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}

/* ฟีดสดสำหรับกราฟวิต่อวิบนเว็บ — เขียนทับ /meat/live ทุก LIVE_INTERVAL */
void sendLive() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) { h = lastHum; t = lastTemp; }
  else { lastHum = h; lastTemp = t; }

  int    raw  = analogRead(MQ135_AO_PIN);
  float  rs   = getRs(raw);
  float  nh3  = getPPM(rs, MQ135_RO, MQ135_A, MQ135_B, t, h);
  String chk  = sensorCheck(raw, rs);
  String st   = getStatus(nh3);
  int    batt = readBatteryPct();

  char s[224];
  snprintf(s, sizeof(s),
    "{\"temp\":%.1f,\"humidity\":%.1f,\"nh3\":%.2f,\"h2s\":0,"
    "\"status\":\"%s\",\"chk135\":\"%s\",\"chk136\":\"OFF\",\"battery\":%d}",
    t, h, nh3, st.c_str(), chk.c_str(), batt);

  object_t liveObj(s);
  Database.set<object_t>(aClient, "/meat/live", liveObj, processData, "set_live");
}

/* ====================== setup ====================== */
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);     // ESP32 ADC = 0..4095
  dht.begin();
  delay(2000);

  // ---- ต่อ WiFi ----
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { Serial.print("."); delay(300); }
  Serial.print("\nConnected, IP: ");
  Serial.println(WiFi.localIP());

  // ---- ตั้งค่า SSL client ----
  ssl_client.setInsecure();
  ssl_client.setConnectionTimeout(1000);
  ssl_client.setHandshakeTimeout(5);

  // ---- อุ่นเซ็นเซอร์ก่อน calibrate ----
  Serial.printf("\nPreheating MQ-135 for %d sec... (วางในอากาศสะอาด)\n", PREHEAT_SEC);
  for (int s = PREHEAT_SEC; s > 0; s--) {
    Serial.printf("  warmup %2d s | raw = %d\n", s, analogRead(MQ135_AO_PIN));
    delay(1000);
  }

  // ---- Calibrate Ro ----
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) { h = REF_HUM; t = REF_TEMP; Serial.println("** DHT อ่านไม่ได้ ใช้ค่าอ้างอิงแทน **"); }

  Serial.println("\n=== Calibrate Ro (MQ-135) ===");
  Serial.printf("Temp = %.1f C | Hum = %.0f %%RH\n", t, h);
  MQ135_RO = calibrateRo(MQ135_AO_PIN, MQ135_CLEAN_AIR_RATIO, t, h);
  Serial.print("MQ-135 Ro = "); Serial.println(MQ135_RO);

  // ---- เริ่ม Firebase ----
  Serial.println("\nInitializing Firebase...");
  initializeApp(aClient, app, getAuth(user_auth), processData, "authTask");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);

  Serial.println("\n=== MEAT FRESHNESS TEST (MQ-135 only) ===");
  Serial.println("MIN | TEMP  HUM | RAW135 Rs135  [CHK]  NH3 | STATUS");

  lastMeasure = millis() - MEASURE_INTERVAL;  // วัดครั้งแรกทันที
  Serial.println("วางเนื้อได้เลย — จะเริ่มวัดเมื่อ Firebase พร้อม");
}

/* ====================== loop ====================== */
void loop() {
  app.loop();
  if (!app.ready()) return;

  unsigned long now = millis();

  /* ---- ฟีดสด: ส่ง /meat/live ทุก 2 วิ (กราฟวิต่อวิ) ---- */
  if (now - lastLive >= LIVE_INTERVAL) {
    lastLive = now;
    sendLive();
  }

  /* ---- การวัดหลัก: บันทึก latest/history ทุก 1 นาที ---- */
  if (firstDone && (now - lastMeasure < MEASURE_INTERVAL)) return;
  lastMeasure = now;
  firstDone = true;

  if (reading > TEST_DURATION_MIN) {
    if (!testDone) {
      Serial.println("\nทดสอบครบ 120 นาทีแล้ว — END OF TEST");
      Database.set<bool>(aClient, "/meat/testFinished", true, processData, "set_done");
      testDone = true;
    }
    return;
  }

  // ---- อ่านเซ็นเซอร์ ----
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) { h = REF_HUM; t = REF_TEMP; }

  int   raw135  = analogRead(MQ135_AO_PIN);
  float rs135   = getRs(raw135);
  float ppm_nh3 = getPPM(rs135, MQ135_RO, MQ135_A, MQ135_B, t, h);
  String chk135 = sensorCheck(raw135, rs135);
  String status = getStatus(ppm_nh3);

  // ---- พิมพ์ลง Serial ----
  char buf[140];
  snprintf(buf, sizeof(buf),
    "%3d | %4.1fC %3.0f%% | %5d %7.2f [%5s] %6.2f | %s",
    reading, t, h, raw135, rs135, chk135.c_str(), ppm_nh3, status.c_str());
  Serial.println(buf);
  if (status == "WARNING") Serial.println("    เริ่มมีกลิ่น");
  else if (status == "SPOILED") Serial.println("    เนื้อเน่า!");

  // ---- อ่านแบตเตอรี่ ----
  int batt = readBatteryPct();
  Serial.printf("    Battery: %d %%\n", batt);

  // ---- JSON (h2s=0 เพราะยังไม่ได้ต่อ MQ-136) ----
  char jsonStr[256];
  snprintf(jsonStr, sizeof(jsonStr),
    "{\"minute\":%d,\"temp\":%.1f,\"humidity\":%.1f,"
    "\"nh3\":%.2f,\"h2s\":0,\"status\":\"%s\","
    "\"chk135\":\"%s\",\"chk136\":\"OFF\",\"battery\":%d}",
    reading, t, h, ppm_nh3, status.c_str(), chk135.c_str(), batt);

  object_t jsonObj(jsonStr);
  Database.set<object_t>(aClient, "/meat/latest", jsonObj, processData, "set_latest");

  char histPath[40];
  snprintf(histPath, sizeof(histPath), "/meat/history/%d", reading);
  Database.set<object_t>(aClient, histPath, jsonObj, processData, "set_hist");

  reading++;
}

/* ====================== callback ====================== */
void processData(AsyncResult &aResult) {
  if (!aResult.isResult()) return;
  if (aResult.isError())
    Firebase.printf("Firebase Error [%s]: %s (code %d)\n",
      aResult.uid().c_str(), aResult.error().message().c_str(), aResult.error().code());
  else if (aResult.available()) {
    if (aResult.uid() != "set_live")   // ฟีดสดยิงทุก 2 วิ — ไม่ต้อง log
      Firebase.printf("Firebase OK [%s]\n", aResult.uid().c_str());
  }
}
