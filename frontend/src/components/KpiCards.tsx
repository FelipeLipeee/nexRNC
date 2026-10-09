import React from 'react';
import { AlertTriangle, CheckCircle2, Inbox, TrendingUp, Check } from 'lucide-react';
import type { KpiSummary, SectorType } from '../types';

export type KpiFilterType = 'my_bancada' | 'em_transito' | 'atrasadas' | 'concluidas';

interface KpiCardsProps {
  kpis: KpiSummary | null;
  currentSector: SectorType;
  myQueueCount: number;
  activeFilter?: KpiFilterType | null;
  onSelectFilter?: (type: KpiFilterType) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  kpis,
  currentSector,
  myQueueCount,
  activeFilter,
  onSelectFilter,
}) => {
  const handleClick = (type: KpiFilterType) => {
    if (onSelectFilter) {
      onSelectFilter(type);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
      
      {/* 1. Na Minha Bancada */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleClick('my_bancada')}
        onKeyDown={(e) => e.key === 'Enter' && handleClick('my_bancada')}
        className={`bg-white rounded-xl p-5 border transition-all duration-200 cursor-pointer text-left select-none relative ${
          activeFilter === 'my_bancada'
            ? 'border-tec-orange ring-2 ring-tec-orange shadow-md bg-orange-50/30'
            : 'border-slate-200/80 shadow-xs hover:border-tec-orange/50 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Na Minha Bancada
          </span>
          <div className="w-9 h-9 rounded-lg bg-tec-orange-light text-tec-orange flex items-center justify-center font-bold">
            <Inbox className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-tec-navy tracking-tight">
            {myQueueCount}
          </span>
          <span className="text-xs font-bold text-tec-orange bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Setor {currentSector}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Ações Pendentes</span>
          <span className="font-semibold text-tec-orange flex items-center gap-1">
            {activeFilter === 'my_bancada' && <Check className="w-3.5 h-3.5" />}
            {activeFilter === 'my_bancada' ? 'Filtro ativo' : 'Clique para filtrar'}
          </span>
        </div>
      </div>

      {/* 2. Total em Trânsito */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleClick('em_transito')}
        onKeyDown={(e) => e.key === 'Enter' && handleClick('em_transito')}
        className={`bg-white rounded-xl p-5 border transition-all duration-200 cursor-pointer text-left select-none relative ${
          activeFilter === 'em_transito'
            ? 'border-blue-500 ring-2 ring-blue-500 shadow-md bg-blue-50/30'
            : 'border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total em Trânsito
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-tec-navy tracking-tight">
            {kpis?.total_ativas ?? 0}
          </span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            7 Etapas POP
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Esteira Global</span>
          <span className="font-semibold text-blue-600 flex items-center gap-1">
            {activeFilter === 'em_transito' && <Check className="w-3.5 h-3.5" />}
            {activeFilter === 'em_transito' ? 'Filtro ativo' : 'Clique para filtrar'}
          </span>
        </div>
      </div>

      {/* 3. SLA Atrasado */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleClick('atrasadas')}
        onKeyDown={(e) => e.key === 'Enter' && handleClick('atrasadas')}
        className={`bg-white rounded-xl p-5 border transition-all duration-200 cursor-pointer text-left select-none relative ${
          activeFilter === 'atrasadas'
            ? 'border-rose-500 ring-2 ring-rose-500 shadow-md bg-rose-50/30'
            : 'border-slate-200/80 shadow-xs hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            SLA Atrasado
          </span>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
            {kpis?.total_atrasadas ?? 0}
          </span>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
            Estouro de Prazo
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Critério SGI</span>
          <span className="font-semibold text-rose-600 flex items-center gap-1">
            {activeFilter === 'atrasadas' && <Check className="w-3.5 h-3.5" />}
            {activeFilter === 'atrasadas' ? 'Filtro ativo' : 'Clique para filtrar'}
          </span>
        </div>
      </div>

      {/* 4. Concluídas */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleClick('concluidas')}
        onKeyDown={(e) => e.key === 'Enter' && handleClick('concluidas')}
        className={`bg-white rounded-xl p-5 border transition-all duration-200 cursor-pointer text-left select-none relative ${
          activeFilter === 'concluidas'
            ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-md bg-emerald-50/30'
            : 'border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Concluídas / Baixadas
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {kpis?.total_concluidas ?? 0}
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Finalizadas
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Tratativas Executadas</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            {activeFilter === 'concluidas' && <Check className="w-3.5 h-3.5" />}
            {activeFilter === 'concluidas' ? 'Filtro ativo' : 'Clique para filtrar'}
          </span>
        </div>
      </div>

    </div>
  );
};
