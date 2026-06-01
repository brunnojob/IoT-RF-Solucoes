#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// Configurações de rede
const char* WIFI_SSID     = "b";
const char* WIFI_PASSWORD = "teste123";

// Broker MQTT (PC rodando Mosquitto + bridge Python)
// Pelo seu netstat atual, o IP do computador/broker é 10.145.67.21.
const char* MQTT_BROKER   = "10.145.67.21";
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "iot/sensores";

// Pinos
#define DHT_PIN   4
#define DHT_TYPE  DHT11
#define PIR_PIN   27

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void conectarWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado: " + WiFi.localIP().toString());
}

void conectarMQTT() {
  while (!mqtt.connected()) {
    if (mqtt.connect("ESP32_Sensor")) {
      Serial.println("MQTT conectado");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  dht.begin();
  conectarWiFi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWiFi();
  if (!mqtt.connected()) conectarMQTT();
  mqtt.loop();

  // Leitura real do sensor
  float temperatura = dht.readTemperature();
  float umidade     = dht.readHumidity();
  bool  presenca    = digitalRead(PIR_PIN) == HIGH;

  if (isnan(temperatura) || isnan(umidade)) {
    Serial.println("Falha na leitura do DHT11");
    delay(2000);
    return;
  }

  char payload[128];
  snprintf(payload, sizeof(payload),
           "{\"temperatura\":%.1f,\"umidade\":%.1f,\"presenca\":%s}",
           temperatura, umidade, presenca ? "true" : "false");

  mqtt.publish(MQTT_TOPIC, payload);
  Serial.println(payload);

  delay(2000); // Envia leitura real a cada 2 segundos
}
