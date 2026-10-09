import React from 'react';
import { Calendar, Filter, RotateCcw, Sparkles } from 'lucide-react';
import type { BiFilterParams } from '../../types';

interface BiFilterBarProps {
  filters: BiFilterParams;
  onFilterChange: (newFilters: BiFilterParams) => void;
  onReset: () => void;
  loading: boolean;
}

export const BiFilterBar: React.FC<BiFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  loading,
}) => {
  const setQuickRange = (days: number | 'month' | 'all') => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];

    if (days === 'all') {
      onFilterChange({ ...filters, start_date: '', end_date: '' });
      return;
    }

    if (days === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      onFilterChange({
        ...filters,
        start_date: firstDay.toISOString().split('T')[0],
        end_date: endStr,
      });
      return;
    }

    const start = new Date();
    start.setDate(today.getDate() - days);
    onFilterChange({
      ...filters,
      start_date: start.toISOString().split('T')[0],
      end_date: endStr,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 mb-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-tec-navy/10 text-tec-navy flex items-center justify-center">
            <Filter className="w-4 h-4 text-tec-navy" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Filtros Executivos de BI
            </h3>
            <span className="text-[11px] text-slate-500">
              Filtre por período personalizado, tipo de fluxo e gargalo setorial
            </span>
          </div>
        </div>

        {/* Quick Range Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-tec-orange" /> Atalhos:
          </span>
          <button
            type="button"
            onClick={() => setQuickRange(7)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            7 dias
          </button>
          <button
            type="button"
            onClick={() => setQuickRange(30)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            30 dias
          </button>
          <button
            type="button"
            onClick={() => setQuickRange(90)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            90 dias
          </button>
          <button
            type="button"
            onClick={() => setQuickRange('month')}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            Este Mês
          </button>
          <button
            type="button"
            onClick={() => setQuickRange('all')}
            className="px-2.5 py-1 text-xs rounded-md bg-tec-navy/10 hover:bg-tec-navy/20 text-tec-navy font-semibold transition cursor-pointer"
          >
            Histórico Completo
          </button>
        </div>
      </div>

      {/* Date Pickers & Category Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
        {/* Data Inicial */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-tec-orange" /> Data Inicial
          </label>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
          />
        </div>

        {/* Data Final */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-tec-orange" /> Data Final
          </label>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
          />
        </div>

        {/* Tipo de Trâmite */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Tipo de Trâmite
          </label>
          <select
            value={filters.tipo_fluxo || 'todos'}
            onChange={(e) => onFilterChange({ ...filters, tipo_fluxo: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white cursor-pointer"
          >
            <option value="todos">Todos os Trâmites</option>
            <option value="padrao">Físico (Retorno de Peça)</option>
            <option value="financeiro">💳 Crédito / Sem Peça</option>
          </select>
        </div>

        {/* Botão Reset */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium transition cursor-pointer"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Limpar Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
};
