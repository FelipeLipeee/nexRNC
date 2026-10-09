import React from 'react';
import { Clock, ShieldCheck, DollarSign, Layers } from 'lucide-react';
import type { BiSummary } from '../../types';

interface BiKpiCardsProps {
  summary: BiSummary;
}

export const BiKpiCards: React.FC<BiKpiCardsProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Lead Time Médio */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Lead Time Médio
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {summary.lead_time_medio_dias}
            </span>
            <span className="text-xs font-semibold text-slate-500">dias corridos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tempo médio da abertura até liquidação final
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Concluídas avaliadas:</span>
          <span className="font-bold text-slate-700">{summary.concluidas} RNCs</span>
        </div>
      </div>

      {/* 2. Cumprimento de SLA Global */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Índice de SLA Global
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {summary.sla_taxa_cumprimento}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">no prazo</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.sla_taxa_cumprimento >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, summary.sla_taxa_cumprimento)}%` }}
            />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Meta corporativa:</span>
          <span className="font-bold text-slate-700">≥ 90.0%</span>
        </div>
      </div>

      {/* 3. Custo Total de Perdas e Devoluções */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Impacto Financeiro
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-800 font-mono truncate" title={formatCurrency(summary.custo_total_perdas)}>
            {formatCurrency(summary.custo_total_perdas)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total liquidado em créditos e reposições
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Custo médio por RNC:</span>
          <span className="font-bold text-slate-700">
            {formatCurrency(summary.total_rncs > 0 ? summary.custo_total_perdas / summary.total_rncs : 0)}
          </span>
        </div>
      </div>

      {/* 4. Mix Operacional (Físico vs Crédito) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Mix de Trâmites
          </span>
          <div className="w-8 h-8 rounded-lg bg-tec-navy/10 text-tec-navy flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Físico: <strong>{summary.total_fisico}</strong> ({summary.pct_fisico}%)
            </span>
            <span className="text-xs font-semibold text-cyan-700">
              Crédito: <strong>{summary.total_credito}</strong> ({summary.pct_credito}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-tec-orange h-full"
              style={{ width: `${summary.pct_fisico}%` }}
              title={`Físico: ${summary.pct_fisico}%`}
            />
            <div
              className="bg-cyan-500 h-full"
              style={{ width: `${summary.pct_credito}%` }}
              title={`Crédito: ${summary.pct_credito}%`}
            />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Volume Total:</span>
          <span className="font-bold text-slate-800">{summary.total_rncs} ocorrências</span>
        </div>
      </div>
    </div>
  );
};
