# Dashboard IoT — Monitoramento Empresarial em Tempo Real

Sistema de monitoramento IoT com ESP32, sensores reais, MQTT e Supabase.  
Dashboard web com atualização em tempo real, controle de estoque e histórico de leituras.

---

## Funcionalidades

- **Monitoramento de sensores** — Temperatura (DHT11), Umidade, Presença (PIR)
- **Gráfico histórico** — Temperatura e umidade ao longo do tempo
- **Controle de estoque** — Cadastro de produtos, entrada e saída com histórico
- **Tempo real** — Dados atualizados via Supabase Realtime
- **Login protegido** — Usuário: `admin` / Senha: `admin`
- **Responsivo** — Funciona em desktop e mobile

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts |
| Backend | Supabase (PostgreSQL + Realtime) |
| Hardware | ESP32 + DHT11 + PIR (sensor de presença) |
| Comunicação | MQTT (Mosquitto) |
| Bridge | Python (paho-mqtt → Supabase) |
| Deploy | Netlify |

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- ESP32 com Arduino IDE configurado
- Broker MQTT (Mosquitto) rodando na rede local
- Python 3.8+ (para a bridge MQTT → Supabase)

---

## Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd dashboard-iot
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o Supabase

Edite o arquivo `src/lib/supabase.ts` com suas credenciais:

```typescript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON';
```

### 4. Criar as tabelas no Supabase

Acesse o **SQL Editor** do Supabase e execute:

```sql
-- Tabela de leituras dos sensores
DROP TABLE IF EXISTS sensor_readings CASCADE;
CREATE TABLE sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  temperatura REAL NOT NULL,
  umidade REAL NOT NULL,
  presenca BOOLEAN DEFAULT FALSE,
  estoque INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública" ON sensor_readings FOR SELECT TO anon USING (true);
CREATE POLICY "Inserção pública" ON sensor_readings FOR INSERT TO anon WITH CHECK (true);

-- Tabela de produtos
DROP TABLE IF EXISTS movimentacoes_estoque CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  quantidade_atual INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública" ON produtos FOR SELECT TO anon USING (true);
CREATE POLICY "Inserção pública" ON produtos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Atualização pública" ON produtos FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Tabela de movimentações de estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública" ON movimentacoes_estoque FOR SELECT TO anon USING (true);
CREATE POLICY "Inserção pública" ON movimentacoes_estoque FOR INSERT TO anon WITH CHECK (true);

-- Ativar Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE movimentacoes_estoque;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
```

### 5. Rodar o projeto localmente

```bash
npm run dev
```

Acesse: [http://localhost:8080](http://localhost:8080)

---

## Configuração do Hardware (ESP32)

### Componentes

- ESP32 DevKit V1
- Sensor DHT11 (pino de dados no GPIO 4)
- Sensor PIR HC-SR501 (pino de dados no GPIO 27)

### Esquema de ligação

```
ESP32 GPIO 4  → DHT11 DATA
ESP32 GPIO 27 → PIR OUT
ESP32 3.3V    → VCC dos sensores
ESP32 GND     → GND dos sensores
```

### Código Arduino

Abra o arquivo `ESP32_CODIGO_ARDUINO.ino` na Arduino IDE e configure:

- SSID e senha do Wi-Fi
- IP do broker MQTT

Bibliotecas necessárias (instalar via Arduino IDE):
- `WiFi.h` (incluída no ESP32)
- `PubSubClient` (MQTT)
- `DHT sensor library`

---

## Bridge MQTT → Supabase

A bridge (`mqtt_bridge_supabase.py`) conecta o broker MQTT ao Supabase, gravando as leituras no banco.

### Instalar dependências Python

```bash
pip install paho-mqtt supabase
```

### Rodar a bridge

```bash
python mqtt_bridge_supabase.py
```

---

## Deploy na Netlify

1. Faça build do projeto:

```bash
npm run build
```

2. O diretório `dist/` contém os arquivos para deploy.

3. Na Netlify:
   - Arraste a pasta `dist/` ou conecte o repositório Git
   - O arquivo `public/_redirects` já está configurado para SPA

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── iot/
│   │   ├── ConnectionIndicator.tsx   # Indicador de conexão
│   │   ├── EstoqueSection.tsx        # Controle de estoque
│   │   ├── HistoryChart.tsx          # Gráfico histórico
│   │   ├── MovimentacoesTable.tsx    # Tabela de movimentações
│   │   ├── PresenceCard.tsx          # Card de presença
│   │   ├── ReadingsTable.tsx         # Tabela de leituras
│   │   └── SensorCard.tsx            # Card de sensor
│   └── ui/                           # Componentes base
├── contexts/
│   └── AuthContext.tsx               # Autenticação (admin/admin)
├── hooks/
│   ├── useEstoque.ts                 # Hook de estoque
│   └── useIoTData.ts                 # Hook de dados IoT
├── lib/
│   ├── simulatedData.ts              # Dados simulados (fallback)
│   ├── supabase.ts                   # Cliente Supabase
│   └── utils.ts                      # Utilitários
├── pages/
│   ├── Index.tsx                      # Dashboard principal
│   ├── Login.tsx                      # Tela de login
│   └── NotFound.tsx                   # Página 404
├── App.tsx                            # Rotas da aplicação
└── main.tsx                           # Ponto de entrada
```

---

## Credenciais de acesso

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin` |

---

## Licença

Este projeto é de uso livre para fins educacionais e acadêmicos.