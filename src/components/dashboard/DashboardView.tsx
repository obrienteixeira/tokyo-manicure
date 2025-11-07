// @ts-nocheck
import React, { useState, useEffect } from 'react';
import SummaryCard from './SummaryCard'; // 1. Importa o componente corrigido
import InsightsCard from './InsightsCard';
import { getAgendamentos, getTransacoes, getClientes, getProdutos } from '../../services/api';
import type { Agendamento, Transacao, Cliente, Produto } from '../../types';

// 2. Funções de utilidade para formatar dados
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const DashboardView: React.FC = () => {
  // 3. Estado para as estatísticas e carregamento
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    receitaDoDia: 0,
    novosClientesHoje: 0,
    produtosEmBaixa: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 4. useEffect para buscar dados da API e calcular as estatísticas
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [agendamentos, transacoes, clientes, produtos] = await Promise.all([
          getAgendamentos(),
          getTransacoes(),
          getClientes(),
          getProdutos(),
        ]);

        const agendamentosHoje = agendamentos.filter(a => isToday(a.dataHora)).length;
        const receitaDoDia = transacoes
          .filter(t => isToday(t.dataTransacao))
          .reduce((sum, t) => sum + t.valor, 0);
        const novosClientesHoje = clientes.filter(c => isToday(c.dataRegistro)).length;
        const produtosEmBaixa = produtos.filter(p => p.estoque <= p.estoqueMinimo).length;

        setStats({
          agendamentosHoje,
          receitaDoDia,
          novosClientesHoje,
          produtosEmBaixa,
        });

      } catch (error) {
        console.error("Falha ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 5. Renderização do dashboard com os dados dinâmicos
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Resumo das atividades do salão em tempo real.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
            title="Agendamentos Hoje" 
            value={isLoading ? '...' : stats.agendamentosHoje.toString()} 
            subtitle="Confirmados para hoje" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
            color="text-blue-500"
        />
        <SummaryCard 
            title="Receita do Dia" 
            value={isLoading ? '...' : formatCurrency(stats.receitaDoDia)} 
            subtitle="Total de vendas hoje" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            color="text-green-500"
        />
        <SummaryCard 
            title="Novos Clientes Hoje" 
            value={isLoading ? '...' : stats.novosClientesHoje.toString()} 
            subtitle="Cadastrados hoje" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            color="text-yellow-500"
        />
        <SummaryCard 
            title="Produtos em Baixa" 
            value={isLoading ? '...' : stats.produtosEmBaixa.toString()} 
            subtitle="Estoque baixo ou zerado" 
            isWarning={stats.produtosEmBaixa > 0}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>}
            color="text-red-500"
        />
      </div>

      <InsightsCard />
    </div>
  );
};

// 6. A declaração duplicada que causava o erro foi removida daqui.

export default DashboardView;