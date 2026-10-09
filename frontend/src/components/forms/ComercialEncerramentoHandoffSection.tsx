import React from 'react';
import { DollarSign, FileText, CheckSquare, Sparkles } from 'lucide-react';
import type { RncItem } from '../../types';

interface ComercialEncerramentoHandoffSectionProps {
  rnc: RncItem;
  fechamentoObs: string;
  setFechamentoObs: (val: string) => void;
  confirmacaoCliente: boolean;
  setConfirmacaoCliente: (val: boolean) => void;
}

export const ComercialEncerramentoHandoffSection: React.FC<ComercialEncerramentoHandoffSectionProps> = ({
  rnc,
  fechamentoObs,
  setFechamentoObs,
  confirmacaoCliente,
  setConfirmacaoCliente,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 font-medium text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-indigo-900 font-bold">
            Etapa 8: Validação Final e Encerramento com o Cliente (Comercial)
          </strong>
          <span className="text-indigo-800 text-[11px]">
            O Financeiro concluiu a tratativa. Revise o retorno financeiro, confirme com o cliente e encerre a RNC.
          </span>
        </div>
      </div>

      {/* Resumo da Tratativa Financeira e Acordo Comercial */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Resumo do Trâmite Realizado
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-600" />
              Acordo Comercial Proposto
            </span>
            <p className="font-bold text-slate-800 mt-0.5 truncate">
              {rnc.comercial_tratativa || 'Tratativa comercial'}
            </p>
            {rnc.comercial_detalhes && (
              <p className="text-[11px] text-slate-600 mt-0.5 italic line-clamp-2">
                {rnc.comercial_detalhes}
              </p>
            )}
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-cyan-200">
            <span className="text-[10px] font-bold text-cyan-800 uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-cyan-700" />
              Liquidação Financeira
            </span>
            <p className="font-bold text-cyan-950 mt-0.5">
              {rnc.financeiro_tipo_operacao || 'Operação registrada'} • R$ {(rnc.financeiro_valor ?? 0).toFixed(2)}
            </p>
            {rnc.financeiro_obs && (
              <p className="text-[11px] text-slate-600 mt-0.5 italic line-clamp-2">
                {rnc.financeiro_obs}
              </p>
            )}
            {rnc.financeiro_concluido_por && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Por: {rnc.financeiro_concluido_por}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Parecer do Comercial */}
      <div>
        <label className="block font-bold text-tec-navy mb-1 text-xs">
          Parecer Final do Comercial / Retorno ao Cliente *
        </label>
        <textarea
          rows={3}
          required
          value={fechamentoObs}
          onChange={(e) => setFechamentoObs(e.target.value)}
          placeholder="Ex: Cliente informado da emissão da nota de crédito/estorno via WhatsApp/e-mail. Acordo cumprido e chamado encerrado."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>

      {/* Confirmação com o cliente */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmacaoCliente}
            onChange={(e) => setConfirmacaoCliente(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
              Confirmar resolução e encerramento definitivo
            </span>
            <span className="text-[11px] text-emerald-800/80 block mt-0.5">
              Ao marcar e enviar, a RNC será formalmente finalizada no sistema com status <strong>CONCLUÍDO</strong>.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};
