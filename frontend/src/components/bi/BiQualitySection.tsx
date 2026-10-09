import React from 'react';
import { Award, Wrench, Users } from 'lucide-react';
import type { BiTopClient } from '../../types';

interface BiQualitySectionProps {
  quality: {
    procedencia: {
      procedente: number;
      improcedente: number;
      pendente: number;
      pct_procedente: number;
    };
    destinacao: { label: string; count: number }[];
    materiais: { label: string; count: number }[];
  };
  topClientes: BiTopClient[];
  totalRncs: number;
}

export const BiQualitySection: React.FC<BiQualitySectionProps> = ({
  quality,
  topClientes,
  totalRncs,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const { procedente, improcedente, pendente, pct_procedente } = quality.procedencia;
  const totalLaudos = procedente + improcedente;

  // SVG Donut calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const procStroke = totalLaudos > 0 ? (procedente / totalLaudos) * circumference : 0;
  const impStroke = totalLaudos > 0 ? (improcedente / totalLaudos) * circumference : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* 1. Procedência Técnica (Donut SVG) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-tec-orange" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Procedência Técnica
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Laudos Fabris</span>
        </div>

        {totalLaudos === 0 && pendente === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Nenhum laudo emitido ainda.</div>
        ) : (
          <div className="flex items-center justify-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="12"
                  fill="transparent"
                />
                {totalLaudos > 0 && (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      className="stroke-emerald-500 transition-all duration-700"
                      strokeWidth="12"
                      strokeDasharray={`${procStroke} ${circumference}`}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      className="stroke-rose-500 transition-all duration-700"
                      strokeWidth="12"
                      strokeDasharray={`${impStroke} ${circumference}`}
                      strokeDashoffset={-procStroke}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </>
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-800 font-mono">
                  {pct_procedente}%
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                  Procedente
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Procedente:</span>
                <strong className="text-slate-800 font-mono">{procedente}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600">Improcedente:</span>
                <strong className="text-slate-800 font-mono">{improcedente}</strong>
              </div>
              {pendente > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-slate-400">Em Análise:</span>
                  <strong className="text-slate-500 font-mono">{pendente}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          {pct_procedente >= 70
            ? '⚠️ Alerta: Alta incidência de falha fabril confirmada'
            : 'Taxa de procedência dentro do esperado'}
        </div>
      </div>

      {/* 2. Destinação das Peças */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-tec-orange" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Destinação de Peças
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Decisão Técnica</span>
        </div>

        <div className="space-y-3 py-1">
          {quality.destinacao.map((dest) => {
            const maxDest = Math.max(1, ...quality.destinacao.map((d) => d.count));
            const pct = Math.round((dest.count / maxDest) * 100);

            return (
              <div key={dest.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{dest.label}</span>
                  <span className="font-mono text-slate-600 font-bold">{dest.count} ocorrências</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-tec-orange h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Sucata acumulada:</span>
          <span className="font-bold text-rose-600">
            {quality.destinacao.find((d) => d.label === 'Sucata')?.count || 0} itens
          </span>
        </div>
      </div>

      {/* 3. Top Clientes com Reclamações (Pareto) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-tec-orange" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Top Clientes Recorrentes
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Pareto ({totalRncs} RNCs)</span>
        </div>

        {topClientes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Nenhum cliente registrado.</div>
        ) : (
          <div className="space-y-2.5 py-1">
            {topClientes.map((cli, idx) => (
              <div
                key={cli.cliente}
                className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-5 h-5 rounded-full bg-tec-navy/10 text-tec-navy font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate" title={cli.cliente}>
                    {cli.cliente}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-800 font-mono block">
                    {cli.count} RNCs
                  </span>
                  {cli.valor > 0 && (
                    <span className="text-[10px] text-emerald-600 font-mono">
                      {formatCurrency(cli.valor)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Monitoramento preventivo para pós-venda e retenção
        </div>
      </div>
    </div>
  );
};
