import React, { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, Database, ShieldAlert } from 'lucide-react';
import { fetchBiMetrics } from '../../services/api';
import type { BiMetricsResponse, BiFilterParams } from '../../types';
import { BiFilterBar } from './BiFilterBar';
import { BiKpiCards } from './BiKpiCards';
import { BiBottleneckChart } from './BiBottleneckChart';
import { BiQualitySection } from './BiQualitySection';
import { BiCriticalAlertsTable } from './BiCriticalAlertsTable';

interface BiDashboardProps {
  onOpenDetail: (rncId: number) => void;
}

export const BiDashboard: React.FC<BiDashboardProps> = ({ onOpenDetail }) => {
  const [filters, setFilters] = useState<BiFilterParams>({
    start_date: '',
    end_date: '',
    tipo_fluxo: 'todos',
    sector: 'todos',
  });

  const [data, setData] = useState<BiMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async (activeFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBiMetrics(activeFilters);
      setData(res);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Falha ao carregar métricas de BI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const handleResetFilters = () => {
    const emptyFilters: BiFilterParams = {
      start_date: '',
      end_date: '',
      tipo_fluxo: 'todos',
      sector: 'todos',
    };
    setFilters(emptyFilters);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Executive BI Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-tec-navy to-slate-900 rounded-xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-tec-orange text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
              Business Intelligence
            </span>
            <span className="text-xs text-slate-300">
              Painel Estratégico de Qualidade, SLA & Finanças
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-tec-orange" />
            Centro de Inteligência de Não Conformidades (BI)
          </h2>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Consolidado analítico em tempo real direto do <strong className="text-white">Banco de Dados Ativo</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadMetrics()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
            title="Atualizar dados analíticos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-tec-orange' : ''}`} />
            <span>{loading ? 'Calculando...' : 'Atualizar BI'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar with Custom Date Range */}
      <BiFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        loading={loading}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Erro ao carregar dados do BI: {error}. Verifique a conexão com o SQL Server.</span>
        </div>
      )}

      {/* Loading overlay indicator */}
      {loading && !data && (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-tec-orange mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Calculando métricas analíticas...</p>
        </div>
      )}

      {/* Main Content */}
      {data && (
        <>
          {/* 1. Executive Top KPI Cards */}
          <BiKpiCards summary={data.summary} />

          {/* 2. Bottlenecks Funnel Chart */}
          <BiBottleneckChart
            bottlenecks={data.bottlenecks}
            totalActive={data.summary.em_andamento}
          />

          {/* 3. Quality & Pareto Section */}
          <BiQualitySection
            quality={data.quality}
            topClientes={data.top_clientes}
            totalRncs={data.summary.total_rncs}
          />

          {/* 4. Critical Alerts Table */}
          <BiCriticalAlertsTable
            alerts={data.critical_alerts}
            onOpenDetail={onOpenDetail}
          />
        </>
      )}
    </div>
  );
};
