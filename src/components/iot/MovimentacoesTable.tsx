/**
 * MovimentacoesTable.tsx
 * 
 * Tabela de histórico de movimentações de estoque.
 * Mostra entrada/saída com indicadores visuais.
 */

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Movimentacao, Produto } from '@/hooks/useEstoque';

interface MovimentacoesTableProps {
  movimentacoes: Movimentacao[];
  produtos: Produto[];
}

export function MovimentacoesTable({ movimentacoes, produtos }: MovimentacoesTableProps) {
  const getProdutoNome = (id: string) =>
    produtos.find(p => p.id === id)?.nome ?? 'Desconhecido';

  if (movimentacoes.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Histórico de Movimentações
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Produto</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Qtd</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Horário</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.slice(0, 15).map(mov => (
              <tr key={mov.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    mov.tipo === 'entrada'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {mov.tipo === 'entrada'
                      ? <ArrowDownCircle className="w-3 h-3" />
                      : <ArrowUpCircle className="w-3 h-3" />
                    }
                    {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className="py-2 px-3 text-foreground">{getProdutoNome(mov.produto_id)}</td>
                <td className="py-2 px-3 text-right font-mono font-bold">
                  <span className={mov.tipo === 'entrada' ? 'text-success' : 'text-destructive'}>
                    {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                  {new Date(mov.created_at).toLocaleTimeString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
