"""
Bridge MQTT -> Supabase
Recebe leituras reais do ESP32 via MQTT e grava em tempo real no Supabase.
Sem simulação: apenas dados reais do sensor são repassados.
"""

import json
import paho.mqtt.client as mqtt
from supabase import create_client

# Configurações Supabase
SUPABASE_URL = "https://ngzkahxyraioonptmawd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nemthaHh5cmFpb29ucHRtYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTMyODcsImV4cCI6MjA5MjM4OTI4N30.eBuPX6LLXKvXd3AfbRExAohL2lOwWVZBOJWJHCyxAuo"

# Configurações MQTT
# IP do computador onde o Mosquitto está rodando.
# Pelo seu netstat atual, o broker está em 10.145.67.21:1883.
MQTT_BROKER = "10.145.67.21"
MQTT_PORT   = 1883
MQTT_TOPIC  = "iot/sensores"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def mqtt_ok(codigo):
    try:
        return int(codigo) == 0
    except Exception:
        return str(codigo).lower() in ("success", "0")


def on_connect(client, userdata, flags, reason_code, properties=None):
    if mqtt_ok(reason_code):
        print(f"Conectado ao MQTT Broker {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe(MQTT_TOPIC)
        print(f"Escutando tópico: {MQTT_TOPIC}")
    else:
        print(f"Falha ao conectar no MQTT. Código: {reason_code}")


def on_message(client, userdata, msg):
    try:
        dados = json.loads(msg.payload.decode())
        leitura = {
            "temperatura": float(dados["temperatura"]),
            "umidade":     float(dados["umidade"]),
            "presenca":    bool(dados["presenca"]),
        }
        supabase.table("sensor_readings").insert(leitura).execute()
        print(f"Gravado: {leitura}")
    except Exception as e:
        print(f"Erro ao processar mensagem: {e}")


try:
    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id="mqtt-bridge-supabase",
    )
except (AttributeError, TypeError):
    client = mqtt.Client(client_id="mqtt-bridge-supabase")

client.on_connect = on_connect
client.on_message = on_message

print(f"Conectando ao MQTT Broker {MQTT_BROKER}:{MQTT_PORT}...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()
