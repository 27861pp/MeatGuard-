/*
 * ──────────────────────────────────────────────────────────────────────────
 *  MEAT GUARD — ESP32 sensor node (reference firmware)
 * ──────────────────────────────────────────────────────────────────────────
 *  Pushes live readings to Firebase Realtime Database in the exact structure
 *  the web dashboard expects:
 *
 *    meat/
 *    ├── latest/ { temperature, humidity, nh3, h2s, timestamp }
 *    └── history/<pushId>/ { ...same fields }
 *
 *  Hardware (example):
 *    - DHT22                  -> temperature + humidity      (GPIO 4)
 *    - MQ-137  (NH3)          -> analog                      (GPIO 34)
 *    - MQ-136  (H2S)          -> analog                      (GPIO 35)
 *
 *  Libraries (Arduino Library Manager):
 *    - "Firebase ESP Client" by Mobizt
 *    - "DHT sensor library"  by Adafruit
 *
 *  NOTE: MQ-series sensors need warm-up + calibration. The ppm conversions
 *        below are placeholders — calibrate against a known reference.
 * ──────────────────────────────────────────────────────────────────────────
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ── Wi-Fi ──
#define WIFI_SSID      "YOUR_WIFI_SSID"
#define WIFI_PASSWORD  "YOUR_WIFI_PASSWORD"

// ── Firebase ── (Project Settings > Web API Key, and the RTDB URL)
#define API_KEY        "YOUR_FIREBASE_WEB_API_KEY"
#define DATABASE_URL   "https://YOUR-PROJECT-default-rtdb.firebaseio.com"

// A device service account / email-password user that the DB rules allow:
#define USER_EMAIL     "device@meatguard.io"
#define USER_PASSWORD  "YOUR_DEVICE_PASSWORD"

// ── Pins ──
#define DHTPIN   4
#define DHTTYPE  DHT22
#define NH3_PIN  34
#define H2S_PIN  35

DHT dht(DHTPIN, DHTTYPE);

FirebaseData  fbdo;
FirebaseAuth  auth;
FirebaseConfig config;

unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 3000; // ms

float readNH3ppm() {
  int raw = analogRead(NH3_PIN);            // 0..4095
  float v = raw * (3.3f / 4095.0f);
  return v * 9.0f;                          // placeholder mapping -> ppm
}

float readH2Sppm() {
  int raw = analogRead(H2S_PIN);
  float v = raw * (3.3f / 4095.0f);
  return v * 1.5f;                          // placeholder mapping -> ppm
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.printf("\nConnected: %s\n", WiFi.localIP().toString().c_str());

  config.api_key      = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email     = USER_EMAIL;
  auth.user.password  = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (!Firebase.ready() || millis() - lastSend < SEND_INTERVAL) return;
  lastSend = millis();

  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();
  float nh3         = readNH3ppm();
  float h2s         = readH2Sppm();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT read failed, skipping.");
    return;
  }

  FirebaseJson json;
  json.set("temperature", temperature);
  json.set("humidity",    humidity);
  json.set("nh3",         nh3);
  json.set("h2s",         h2s);
  json.set("timestamp/.sv", "timestamp"); // Firebase server timestamp

  // overwrite the latest snapshot
  if (Firebase.RTDB.setJSON(&fbdo, "/meat/latest", &json)) {
    Serial.printf("latest OK  T=%.1f H=%.0f NH3=%.1f H2S=%.2f\n",
                  temperature, humidity, nh3, h2s);
  } else {
    Serial.printf("latest ERR: %s\n", fbdo.errorReason().c_str());
  }

  // append to history
  Firebase.RTDB.pushJSON(&fbdo, "/meat/history", &json);
}
