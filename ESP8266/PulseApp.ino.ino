#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "";
const char* password = "";

ESP8266WebServer server(80);
MAX30105 particleSensor;
const byte RATE_SIZE = 4; 
byte rates[RATE_SIZE]; 
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

void setup() {
 
  Serial.begin(115200);
  Serial.println("Initializing...");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(10*1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("WiFi connected");
  Serial.print("Access the pulse readings by visiting: ");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/pulse");

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { 
    Serial.println("MAX30102 was not found. Please check wiring/power.");
    while (1);
  }

  Serial.println("Place your index finger on the sensor and apply steady pressure.");
  particleSensor.setup(); 
  particleSensor.setPulseAmplitudeRed(0x0A); 
  particleSensor.setPulseAmplitudeGreen(0);

  server.on("/", handleRoot);
  server.on("/pulse", HTTP_GET, handlePulse);
  server.on("/pulse", HTTP_POST, handleUpdatePulse);
  server.begin();
  Serial.println("Server started");
}

void loop() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true) {   
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute; 
      rateSpot %= RATE_SIZE; 

      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];

      beatAvg /= RATE_SIZE;
    }
  }

  server.handleClient();
  delay(10);
}

void handleRoot() {
  String html = "<html><body><h1>ESP8266 Pulse Monitor</h1>";
  html += "<p>To view your current pulse data, navigate to <a href=\"/pulse\">/pulse</a>.</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handlePulse() {
  String data = "BPM: " + String(beatsPerMinute) +
                ", Average BPM: " + String(beatAvg);
                
  server.send(200, "text/plain", data);
}

void handleUpdatePulse() {
  String message = "Pulse data updated.";
  server.send(200, "text/plain", message);
}
