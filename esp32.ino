

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>


const char* WIFI_SSID     = "b";
const char* WIFI_PASSWORD = "teste123";


const char* MQTT_BROKER   = "10.145.67.21";
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "iot/sensores";


#define DHT_PIN   4
#define DHT_TYPE  DHT11
#define PIR_PIN   27
#define LED_PIN   2


const float TEMP_CRITICA = 32.0;
const float UMI_CRITICA  = 60.0;

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


void atualizarLED(bool presenca, float temperatura) {

  if (temperatura > TEMP_CRITICA) {
    digitalWrite(LED_PIN, HIGH);
    return;
  }

  if (presenca) {
    if (millis() - ultimoBlink >= 250) {
      ultimoBlink = millis();
      ledBlinkState = !ledBlinkState;
      digitalWrite(LED_PIN, ledBlinkState ? HIGH : LOW);
    }
    return;
  }

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


  float temperatura = dht.readTemperature();
  float umidade     = dht.readHumidity();
  bool  presenca    = digitalRead(PIR_PIN) == HIGH;


  if (!isnan(temperatura)) {
    atualizarLED(presenca, temperatura);
  }


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
