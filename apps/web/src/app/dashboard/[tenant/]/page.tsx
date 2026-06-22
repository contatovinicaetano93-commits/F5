'use client';

import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { type DashboardKPIs } from '@/types';

export default function DashboardPage() {
  const { session } = useAuthContext();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // TODO: Implement API call to fetch KPIs
        // For now, using mock data
        setKpis({
          gmv_total: 50000,
          gmv_pct_change: 15.5,
          estoque_total: 1250,
          estoque_baixo_count: 3,
          pedidos_novos: 12,
          pedidos_processando: 8,
          receita_liquida: 35000,
          margem_media_pct: 28.5,
        });
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchKPIs();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h1>
        <p className="text-gray-600">Confira os principais indicadores do seu negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* GMV Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">GMV Este Mês</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                R$ {(kpis?.gmv_total ?? 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 font-semibold text-sm">
              +{kpis?.gmv_pct_change?.toFixed(1)}%
            </span>
            <span className="text-gray-600 text-sm ml-2">vs. mês passado</span>
          </div>
        </div>

        {/* Estoque Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Estoque Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis?.estoque_total.toLocaleString('pt-BR')} un
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
          <div className="mt-4">
            <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded">
              {kpis?.estoque_baixo_count} itens com estoque baixo
            </span>
          </div>
        </div>

        {/* Pedidos Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pedidos Novos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpis?.pedidos_novos}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
          <div className="mt-4 text-gray-600 text-sm">
            {kpis?.pedidos_processando} em processamento
          </div>
        </div>

        {/* Margem Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Margem Média</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis?.margem_media_pct?.toFixed(1)}%
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <div className="mt-4 text-green-600 font-semibold text-sm">
            Receita líquida: R$ {(kpis?.receita_liquida ?? 0).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            📤 Upload de NF
          </button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold border border-blue-200">
            📊 Ver Margem Real
          </button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold border border-blue-200">
            🔄 Sincronizar Estoque
          </button>
        </div>
      </div>

      {/* Placeholder for charts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tendências (Últimos 6 Meses)</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
          Gráfico em desenvolvimento...
        </div>
      </div>
    </div>
  );
}
