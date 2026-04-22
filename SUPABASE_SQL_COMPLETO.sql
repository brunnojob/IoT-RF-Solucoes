-- ============================================================
-- Dashboard IoT — Script completo para o SQL Editor do Supabase
-- Execute este arquivo inteiro de uma vez no SQL Editor.
-- ============================================================

-- Limpa estruturas antigas (se existirem)
DROP TABLE IF EXISTS movimentacoes_estoque CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
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
-- Tabela: produtos (estoque)
-- ------------------------------------------------------------
CREATE TABLE produtos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,
  quantidade_atual INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública produtos"
  ON produtos FOR SELECT TO anon USING (true);

CREATE POLICY "Inserção pública produtos"
  ON produtos FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Atualização pública produtos"
  ON produtos FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Exclusão pública produtos"
  ON produtos FOR DELETE TO anon USING (true);

-- ------------------------------------------------------------
-- Tabela: movimentações de estoque (entradas e saídas)
-- ------------------------------------------------------------
CREATE TABLE movimentacoes_estoque (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id  UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
  observacao  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública movimentacoes"
  ON movimentacoes_estoque FOR SELECT TO anon USING (true);

CREATE POLICY "Inserção pública movimentacoes"
  ON movimentacoes_estoque FOR INSERT TO anon WITH CHECK (true);

-- ------------------------------------------------------------
-- Habilita Realtime para as três tabelas
-- ------------------------------------------------------------
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
