/*
  SISTEMA RF - Monitoramento IoT (ESP32 + DHT11 + PIR)
  Dados 100% REAIS (sem simulação).

  LED AZUL ONBOARD (GPIO 2):
    - APAGADO  -> Tudo OK
    - PISCANDO -> Movimento detectado (PIR HIGH)
    - ACESO FIXO -> Emergência: temperatura crítica (> 32 °C)
                    (prioridade sobre o piscar)
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ====== Rede ======
const char* WIFI_SSID     = "b";
const char* WIFI_PASSWORD = "teste123";

// ====== Broker MQTT (PC com Mosquitto + bridge Python) ======
const char* MQTT_BROKER   = "10.145.67.21";
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "iot/sensores";

// ====== Pinos ======
#define DHT_PIN   4
#define DHT_TYPE  DHT11
#define PIR_PIN   27
#define LED_PIN   2     // LED azul onboard do ESP32

// ====== Limites de alerta crítico ======
const float TEMP_CRITICA = 32.0;  // > 32 °C  -> LED fixo
const float UMI_CRITICA  = 60.0;  // > 60 %   -> alerta no dashboard/SMS

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

unsigned long ultimaTentativaMQTT = 0;
unsigned long ultimoBlink = 0;
bool ledBlinkState = false;

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
  Serial.print(" OK  IP="); Serial.println(WiFi.localIP());
}

void conectarMQTT() {
  if (mqtt.connected()) return;
  if (millis() - ultimaTentativaMQTT < 3000) return;
  ultimaTentativaMQTT = millis();

  String clientId = "ESP32_Sensor_" + WiFi.macAddress();
  clientId.replace(":", "");
  Serial.print("Conectando MQTT... ");
  if (mqtt.connect(clientId.c_str())) {
    Serial.println("OK");
  } else {
    Serial.print("falhou rc="); Serial.println(mqtt.state());
  }
}

// Atualiza o LED conforme o estado real dos sensores
void atualizarLED(bool presenca, float temperatura) {
  // Prioridade 1: temperatura crítica -> LED FIXO
  if (temperatura > TEMP_CRITICA) {
    digitalWrite(LED_PIN, HIGH);
    return;
  }
  // Prioridade 2: presença -> LED PISCANDO
  if (presenca) {
    if (millis() - ultimoBlink >= 250) {
      ultimoBlink = millis();
      ledBlinkState = !ledBlinkState;
      digitalWrite(LED_PIN, ledBlinkState ? HIGH : LOW);
    }
    return;
  }
  // Caso contrário: APAGADO (tudo OK)
  digitalWrite(LED_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  dht.begin();
  conectarWiFi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setSocketTimeout(8);
  mqtt.setKeepAlive(30);
}

unsigned long ultimoEnvio = 0;

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWiFi();
  if (!mqtt.connected()) conectarMQTT();
  mqtt.loop();

  // Leitura REAL dos sensores
  float temperatura = dht.readTemperature();
  float umidade     = dht.readHumidity();
  bool  presenca    = digitalRead(PIR_PIN) == HIGH;

  // Atualiza LED em tempo real (sem esperar o envio MQTT)
  if (!isnan(temperatura)) {
    atualizarLED(presenca, temperatura);
  }

  // Publica a cada 2 segundos
  if (millis() - ultimoEnvio >= 2000) {
    ultimoEnvio = millis();

    if (isnan(temperatura) || isnan(umidade)) {
      Serial.println("Falha na leitura do DHT11");
      return;
    }

    char payload[160];
    snprintf(payload, sizeof(payload),
             "{\"temperatura\":%.1f,\"umidade\":%.1f,\"presenca\":%s}",
             temperatura, umidade, presenca ? "true" : "false");

    if (mqtt.publish(MQTT_TOPIC, payload)) {
      Serial.print("Enviado: "); Serial.println(payload);
    } else {
      Serial.println("Falha ao publicar MQTT");
    }
  }
}
