/**
 * EstoqueSection.tsx
 * 
 * Seção de controle de estoque no dashboard.
 * Exibe produtos, permite entrada/saída e mostra o formulário de novo produto.
 */

import { useState } from 'react';
import { Package, Plus, Minus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Produto } from '@/hooks/useEstoque';

interface EstoqueSectionProps {
  produtos: Produto[];
  loading: boolean;
  onAdicionarProduto: (nome: string, quantidade: number) => void;
  onEntrada: (produtoId: string, quantidade: number, obs?: string) => void;
  onSaida: (produtoId: string, quantidade: number, obs?: string) => void;
}

export function EstoqueSection({ produtos, loading, onAdicionarProduto, onEntrada, onSaida }: EstoqueSectionProps) {
  const [novoNome, setNovoNome] = useState('');
  const [novaQtd, setNovaQtd] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Estado de movimentação por produto
  const [movQtd, setMovQtd] = useState<Record<string, string>>({});

  const handleAddProduto = () => {
    if (!novoNome.trim() || !novaQtd) return;
    onAdicionarProduto(novoNome.trim(), parseInt(novaQtd));
    setNovoNome('');
    setNovaQtd('');
    setShowForm(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-warning-custom" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Controle de Estoque
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Produto
        </button>
      </div>

      {/* Formulário novo produto */}
      {showForm && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 p-3 rounded-md bg-secondary/50 border border-border">
          <input
            type="text"
            placeholder="Nome do produto"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md text-sm bg-background border border-input
                       text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Qtd inicial"
            min="0"
            value={novaQtd}
            onChange={e => setNovaQtd(e.target.value)}
            className="w-28 px-3 py-2 rounded-md text-sm bg-background border border-input
                       text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleAddProduto}
            disabled={loading || !novoNome.trim() || !novaQtd}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground
                       hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Adicionar
          </button>
        </div>
      )}

      {/* Lista de produtos */}
      <div className="space-y-2">
        {produtos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum produto cadastrado.
          </p>
        ) : (
          produtos.map(produto => (
            <div
              key={produto.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-md
                         bg-secondary/30 border border-border/50 hover:border-border transition-colors"
            >
              {/* Info do produto */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{produto.nome}</p>
                <p className="text-xs text-muted-foreground">
                  Estoque: <span className={`font-mono font-bold ${
                    produto.quantidade_atual <= 5 ? 'text-destructive' :
                    produto.quantidade_atual <= 15 ? 'text-warning-custom' : 'text-success'
                  }`}>
                    {produto.quantidade_atual}
                  </span> un
                </p>
              </div>

              {/* Controles de movimentação */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qtd"
                  value={movQtd[produto.id] || ''}
                  onChange={e => setMovQtd(prev => ({ ...prev, [produto.id]: e.target.value }))}
                  className="w-20 px-2 py-1.5 rounded-md text-xs bg-background border border-input
                             text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => {
                    const qty = parseInt(movQtd[produto.id] || '0');
                    if (qty > 0) {
                      onEntrada(produto.id, qty);
                      setMovQtd(prev => ({ ...prev, [produto.id]: '' }));
                    }
                  }}
                  disabled={loading}
                  title="Entrada"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium
                             bg-success/10 text-success hover:bg-success/20 disabled:opacity-50 transition-colors"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  Entrada
                </button>
                <button
                  onClick={() => {
                    const qty = parseInt(movQtd[produto.id] || '0');
                    if (qty > 0) {
                      onSaida(produto.id, qty);
                      setMovQtd(prev => ({ ...prev, [produto.id]: '' }));
                    }
                  }}
                  disabled={loading}
                  title="Saída"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium
                             bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  Saída
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
