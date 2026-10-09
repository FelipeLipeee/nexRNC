import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ComprasHandoffSectionProps {
  nfDevolucao: string;
  setNfDevolucao: (v: string) => void;
  obsCompras: string;
  setObsCompras: (v: string) => void;
  isFlex: boolean;
}

export const ComprasHandoffSection: React.FC<ComprasHandoffSectionProps> = ({
  nfDevolucao,
  setNfDevolucao,
  obsCompras,
  setObsCompras,
  isFlex,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-600 text-xs">
        <ShoppingCart className="w-4 h-4 text-purple-600 shrink-0" />
        <span>Setor de Compras: emissão e escrituração da Nota Fiscal de Devolução no Sankhya ERP.</span>
      </div>

      <div>
        <label className="block font-bold text-tec-navy text-xs mb-1">
          Número da NF de Devolução / Entrada {!isFlex && '*'}
        </label>
        <input
          type="text"
          required={!isFlex}
          value={nfDevolucao}
          onChange={(e) => setNfDevolucao(e.target.value)}
          placeholder="Ex: 009841 ou N/A"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>

      <div>
        <label className="block font-bold text-tec-navy text-xs mb-1">Observações de Compras / Fornecedor</label>
        <textarea
          rows={3}
          value={obsCompras}
          onChange={(e) => setObsCompras(e.target.value)}
          placeholder="Chave da NFe, protocolo Sankhya, autorização de envio de reposição de fornecedor..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>
    </div>
  );
};
