-- ============================================================
-- Dashboard IoT — Script completo para o SQL Editor do Supabase
-- Execute este arquivo inteiro de uma vez no SQL Editor.
-- ============================================================

DROP TABLE IF EXISTS sensor_readings CASCADE;

-- ------------------------------------------------------------
-- Tabela: leituras dos sensores (DHT11 + PIR)
-- ------------------------------------------------------------
CREATE TABLE sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  temperatura REAL    NOT NULL,
  umidade     REAL    NOT NULL,
  presenca    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública sensor_readings"
  ON sensor_readings FOR SELECT TO anon USING (true);

CREATE POLICY "Inserção pública sensor_readings"
  ON sensor_readings FOR INSERT TO anon WITH CHECK (true);

-- ------------------------------------------------------------
-- Habilita Realtime
-- ------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
