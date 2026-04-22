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
SUPABASE_KEY = "sb_publishable_D6MsiNnKgrENOOB6sc5Xig_Lk7lD0yu"

# Configurações MQTT
MQTT_BROKER = "192.168.206.21"
MQTT_PORT   = 1883
MQTT_TOPIC  = "iot/sensores"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def on_connect(client, userdata, flags, rc):
    print(f"MQTT conectado (código {rc})")
    client.subscribe(MQTT_TOPIC)


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


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()
