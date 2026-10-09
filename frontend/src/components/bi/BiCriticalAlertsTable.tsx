import React from 'react';
import { AlertTriangle, Clock, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { BiCriticalAlert } from '../../types';

interface BiCriticalAlertsTableProps {
  alerts: BiCriticalAlert[];
  onOpenDetail: (rncId: number) => void;
}

export const BiCriticalAlertsTable: React.FC<BiCriticalAlertsTableProps> = ({
  alerts,
  onOpenDetail,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Alertas Críticos da Diretoria (Atenção Prioritária)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ocorrências com atraso severo de SLA ou alto impacto financeiro que demandam intervenção
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          {alerts.length} casos críticos
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-slate-700">Tudo sob controle!</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Nenhuma ocorrência com estouro de SLA ou valor elevado pendente no momento.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">Protocolo</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Etapa Atual</th>
                <th className="py-2.5 px-3">Trâmite</th>
                <th className="py-2.5 px-3">Status SLA</th>
                <th className="py-2.5 px-3 text-right">Impacto</th>
                <th className="py-2.5 px-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-tec-navy">
                    {alt.protocol}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-[200px] truncate" title={alt.cliente}>
                    {alt.cliente}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                      {alt.current_step_label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {alt.tipo_fluxo === 'financeiro' ? (
                      <span className="bg-cyan-50 text-cyan-700 font-semibold px-2 py-0.5 rounded text-[10px] border border-cyan-200/60">
                        💳 Crédito
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                        Físico
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {alt.is_delayed ? (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Atrasado ({alt.days_delay > 0 ? `${alt.days_delay}d` : `${alt.hours_delay}h`})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Alto Valor
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {alt.valor > 0 ? formatCurrency(alt.valor) : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(alt.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-tec-navy text-white hover:bg-tec-navy-light transition cursor-pointer"
                      title="Abrir detalhes e auditoria desta RNC"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspecionar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
