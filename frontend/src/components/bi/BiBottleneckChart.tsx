import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { BiBottleneck } from '../../types';

interface BiBottleneckChartProps {
  bottlenecks: BiBottleneck[];
  totalActive: number;
}

export const BiBottleneckChart: React.FC<BiBottleneckChartProps> = ({
  bottlenecks,
  totalActive,
}) => {
  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'comercial': return 'bg-blue-500';
      case 'expedicao': return 'bg-amber-500';
      case 'producao': return 'bg-orange-500';
      case 'compras': return 'bg-purple-500';
      case 'sgi': return 'bg-emerald-500';
      case 'financeiro': return 'bg-cyan-500';
      default: return 'bg-slate-500';
    }
  };

  const maxCount = Math.max(1, ...bottlenecks.map((b) => b.count));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tec-orange animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800">
              Gargalos da Esteira (Onde estão paradas as RNCs ativas?)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribuição das {totalActive} ocorrências em andamento e tempo médio de retenção
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 block">Total em Andamento</span>
          <span className="text-lg font-black text-slate-800 font-mono">{totalActive}</span>
        </div>
      </div>

      {/* Funnel Rows */}
      {totalActive === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-semibold">Nenhuma RNC em andamento no período selecionado.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {bottlenecks.map((item) => {
            const barWidth = `${Math.max(4, Math.round((item.count / maxCount) * 100))}%`;
            const isHighWait = item.avg_days >= 2.0 && item.count > 0;

            return (
              <div key={item.sector} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 min-w-[120px]">
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {item.count} RNCs ({item.pct}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Retenção média:
                    </span>
                    <span
                      className={`font-semibold font-mono px-1.5 py-0.5 rounded ${
                        isHighWait
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.avg_days > 0 ? `${item.avg_days} dias` : `${item.avg_hours}h`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getSectorColor(
                      item.sector
                    )} group-hover:brightness-110`}
                    style={{ width: barWidth }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend & Advice */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Retenção &gt; 2 dias indica gargalo de resposta ou fila sobrecarregada.
        </span>
        <span className="text-slate-400">Atualizado em tempo real via SQL Server</span>
      </div>
    </div>
  );
};
