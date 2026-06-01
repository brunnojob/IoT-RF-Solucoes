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

unsigned long ultimaTentativaMQTT = 0;

void imprimirRede() {
  Serial.println("\n===== DIAGNOSTICO WIFI =====");
  Serial.print("SSID: "); Serial.println(WiFi.SSID());
  Serial.print("IP ESP32: "); Serial.println(WiFi.localIP());
  Serial.print("Gateway: "); Serial.println(WiFi.gatewayIP());
  Serial.print("Mascara: "); Serial.println(WiFi.subnetMask());
  Serial.print("RSSI: "); Serial.print(WiFi.RSSI()); Serial.println(" dBm");
  Serial.print("Broker MQTT: "); Serial.print(MQTT_BROKER); Serial.print(":"); Serial.println(MQTT_PORT);
  Serial.println("============================\n");
}

bool testarTCPBroker() {
  WiFiClient teste;
  Serial.print("Testando acesso TCP ao broker ");
  Serial.print(MQTT_BROKER);
  Serial.print(":");
  Serial.print(MQTT_PORT);
  Serial.print("... ");

  if (teste.connect(MQTT_BROKER, MQTT_PORT)) {
    Serial.println("OK");
    teste.stop();
    return true;
  }

  Serial.println("FALHOU");
  Serial.println("O ESP32 nao consegue chegar no Mosquitto. Verifique firewall, IP do PC, rede 2.4GHz e isolamento AP/clientes.");
  return false;
}

void conectarWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(300);
  Serial.print("Conectando WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" OK");
  imprimirRede();
}

void conectarMQTT() {
  if (mqtt.connected()) return;
  if (millis() - ultimaTentativaMQTT < 3000) return;
  ultimaTentativaMQTT = millis();

  Serial.print("Conectando MQTT... ");
  if (!testarTCPBroker()) return;

  String clientId = "ESP32_Sensor_" + WiFi.macAddress();
  clientId.replace(":", "");

  if (mqtt.connect(clientId.c_str())) {
    Serial.println("MQTT conectado");
  } else {
    Serial.print("Falhou (rc=");
    Serial.print(mqtt.state());
    Serial.println("). Tentando novamente em 3s...");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  dht.begin();
  conectarWiFi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setSocketTimeout(8);
  mqtt.setKeepAlive(30);
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
