/**
 * useEstoque.ts
 * 
 * Hook para controle de estoque com Supabase Realtime.
 * Gerencia produtos e movimentações (entrada/saída).
 * Fallback local quando Supabase não está configurado.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Produto {
  id: string;
  nome: string;
  quantidade_atual: number;
  created_at: string;
}

export interface Movimentacao {
  id: string;
  produto_id: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  observacao?: string;
  created_at: string;
}

export function useEstoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega dados iniciais
  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadProdutos();
      loadMovimentacoes();

      // Realtime: produtos
      const prodChannel = supabase
        .channel('produtos_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
          loadProdutos();
        })
        .subscribe();

      // Realtime: movimentações
      const movChannel = supabase
        .channel('movimentacoes_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'movimentacoes_estoque' }, (payload) => {
          setMovimentacoes(prev => [payload.new as Movimentacao, ...prev].slice(0, 50));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(prodChannel);
        supabase.removeChannel(movChannel);
      };
    } else {
      // Dados de demonstração
      setProdutos([
        { id: '1', nome: 'Sensor DHT11', quantidade_atual: 25, created_at: new Date().toISOString() },
        { id: '2', nome: 'ESP32 DevKit', quantidade_atual: 10, created_at: new Date().toISOString() },
        { id: '3', nome: 'Cabo USB-C', quantidade_atual: 50, created_at: new Date().toISOString() },
      ]);
    }
  }, []);

  async function loadProdutos() {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');
    if (data) setProdutos(data);
  }

  async function loadMovimentacoes() {
    const { data } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setMovimentacoes(data);
  }

  /** Adiciona um novo produto ao estoque */
  const adicionarProduto = useCallback(async (nome: string, quantidade: number) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('produtos')
          .insert({ nome, quantidade_atual: quantidade });
        if (error) throw error;
      } else {
        // Modo local
        setProdutos(prev => [...prev, {
          id: String(Date.now()),
          nome,
          quantidade_atual: quantidade,
          created_at: new Date().toISOString(),
        }]);
      }
      toast({ title: '✅ Produto adicionado', description: `${nome} (${quantidade} un)` });
    } catch (e: any) {
      toast({ title: '❌ Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  /** Registra entrada de estoque */
  const entradaEstoque = useCallback(async (produtoId: string, quantidade: number, observacao?: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        // Registra movimentação
        const { error: movError } = await supabase
          .from('movimentacoes_estoque')
          .insert({ produto_id: produtoId, tipo: 'entrada', quantidade, observacao });
        if (movError) throw movError;

        // Atualiza quantidade
        const produto = produtos.find(p => p.id === produtoId);
        if (produto) {
          const { error } = await supabase
            .from('produtos')
            .update({ quantidade_atual: produto.quantidade_atual + quantidade })
            .eq('id', produtoId);
          if (error) throw error;
        }
      } else {
        // Modo local
        setProdutos(prev => prev.map(p =>
          p.id === produtoId ? { ...p, quantidade_atual: p.quantidade_atual + quantidade } : p
        ));
        setMovimentacoes(prev => [{
          id: String(Date.now()),
          produto_id: produtoId,
          tipo: 'entrada',
          quantidade,
          observacao,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
      toast({ title: '📦 Entrada registrada', description: `+${quantidade} unidades` });
    } catch (e: any) {
      toast({ title: '❌ Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [produtos]);

  /** Registra saída de estoque */
  const saidaEstoque = useCallback(async (produtoId: string, quantidade: number, observacao?: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    // Impede estoque negativo
    if (quantidade > produto.quantidade_atual) {
      toast({
        title: '⚠️ Estoque insuficiente',
        description: `Disponível: ${produto.quantidade_atual} un`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error: movError } = await supabase
          .from('movimentacoes_estoque')
          .insert({ produto_id: produtoId, tipo: 'saida', quantidade, observacao });
        if (movError) throw movError;

        const { error } = await supabase
          .from('produtos')
          .update({ quantidade_atual: produto.quantidade_atual - quantidade })
          .eq('id', produtoId);
        if (error) throw error;
      } else {
        setProdutos(prev => prev.map(p =>
          p.id === produtoId ? { ...p, quantidade_atual: p.quantidade_atual - quantidade } : p
        ));
        setMovimentacoes(prev => [{
          id: String(Date.now()),
          produto_id: produtoId,
          tipo: 'saida',
          quantidade,
          observacao,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
      toast({ title: '📤 Saída registrada', description: `-${quantidade} unidades` });
    } catch (e: any) {
      toast({ title: '❌ Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [produtos]);

  return { produtos, movimentacoes, loading, adicionarProduto, entradaEstoque, saidaEstoque };
}
