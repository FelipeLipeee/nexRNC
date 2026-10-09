import React from 'react';

interface ComercialTratativaHandoffSectionProps {
  tratativa: string;
  setTratativa: (val: string) => void;
  detalhesAcordo: string;
  setDetalhesAcordo: (val: string) => void;
}

export const ComercialTratativaHandoffSection: React.FC<ComercialTratativaHandoffSectionProps> = ({
  tratativa,
  setTratativa,
  detalhesAcordo,
  setDetalhesAcordo,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium text-xs">
        Etapa 6: Definição do acordo com o cliente com base no laudo técnico homologado pelo SGI.
      </div>

      <div>
        <label className="block font-bold text-tec-navy mb-1 text-xs">Tratativa com o Cliente *</label>
        <select
          value={tratativa}
          onChange={(e) => setTratativa(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange cursor-pointer font-medium"
        >
          <option value="sem_custo">Sem custo</option>
          <option value="manuseio_transporte">Manuseio transporte</option>
          <option value="credito_futuro">Crédito Futuro</option>
          <option value="credito_parcial">Crédito Parcial</option>
          <option value="reposicao">Reposição de Material (Novo Pedido em Garantia)</option>
          <option value="devolucao_valor">Devolução do Valor / Estorno Financeiro</option>
          <option value="improcedente">Improcedente (Comunicação de Laudo Negativo)</option>
        </select>
        <div className="mt-2 text-[11px] text-cyan-900 bg-cyan-50 p-2.5 rounded-lg border border-cyan-200 font-medium">
          A tratativa comercial será formalizada e a ocorrência seguirá para a <strong>Etapa 7: Financeiro (Priscila Mariano)</strong> para a tratativa contábil.
        </div>
      </div>

      <div>
        <label className="block font-bold text-tec-navy mb-1 text-xs">Detalhes do Acordo</label>
        <textarea
          rows={2}
          value={detalhesAcordo}
          onChange={(e) => setDetalhesAcordo(e.target.value)}
          placeholder="Número do novo pedido faturado em bonificação ou prazo acordado..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>
    </div>
  );
};
