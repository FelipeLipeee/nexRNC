import React from 'react';
import { DollarSign, CheckSquare, Info } from 'lucide-react';

interface FinanceiroHandoffSectionProps {
  tipoOperacao: string;
  setTipoOperacao: (val: string) => void;
  valorFinanceiro: string;
  setValorFinanceiro: (val: string) => void;
  obsFinanceiro: string;
  setObsFinanceiro: (val: string) => void;
  tratativaFinalizada: boolean;
  setTratativaFinalizada: (val: boolean) => void;
}

export const FinanceiroHandoffSection: React.FC<FinanceiroHandoffSectionProps> = ({
  tipoOperacao,
  setTipoOperacao,
  valorFinanceiro,
  setValorFinanceiro,
  obsFinanceiro,
  setObsFinanceiro,
  tratativaFinalizada,
  setTratativaFinalizada,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 text-cyan-950 font-medium text-xs flex items-start gap-2.5">
        <DollarSign className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-cyan-900 font-bold">Etapa 7: Tratativa Financeira (Priscila Mariano)</strong>
          <span className="text-cyan-800 text-[11px]">
            Registre a liquidação contábil, conciliação e compensação financeira no sistema.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-bold text-tec-navy mb-1">Tipo de Operação *</label>
          <select
            value={tipoOperacao}
            onChange={(e) => setTipoOperacao(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange cursor-pointer font-medium"
          >
            <option value="abatimento_duplicata">Abatimento de Duplicata / Título</option>
            <option value="credito_futuro">Crédito Futuro em Novo Pedido</option>
            <option value="estorno_ted">Estorno via PIX / TED</option>
            <option value="carta_credito">Emissão de Carta de Crédito</option>
            <option value="sem_impacto">Encerramento Administrativo (Sem Custo Financeiro)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-tec-navy mb-1">Valor Contábil (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={valorFinanceiro}
            onChange={(e) => setValorFinanceiro(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange font-mono"
            placeholder="0,00"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-tec-navy mb-1">
          Observações da Tratativa Financeira *
        </label>
        <textarea
          rows={2}
          value={obsFinanceiro}
          onChange={(e) => setObsFinanceiro(e.target.value)}
          placeholder="Número do título baixado no Sankhya, comprovante bancário ou detalhes do estorno..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>

      {/* Caixinha para o financeiro tratar e marcar como finalizado */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={tratativaFinalizada}
            onChange={(e) => setTratativaFinalizada(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-tec-orange focus:ring-tec-orange w-4 h-4 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Marcar tratativa financeira como concluída
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Confirmo que as movimentações de títulos, créditos ou estornos foram executadas no ERP.
            </span>
          </div>
        </label>
      </div>

      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Ao confirmar, o trâmite financeiro será registrado e a RNC <strong>retornará ao Comercial (Etapa 8)</strong> para validação final e encerramento.
        </span>
      </div>
    </div>
  );
};
