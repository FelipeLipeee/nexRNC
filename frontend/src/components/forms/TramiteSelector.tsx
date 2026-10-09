import React from 'react';

interface TramiteSelectorProps {
  tipoFluxo: 'padrao' | 'financeiro';
  setTipoFluxo: (tipo: 'padrao' | 'financeiro') => void;
  fluxoFlexivel: boolean;
  setFluxoFlexivel: (val: boolean) => void;
}

export const TramiteSelector: React.FC<TramiteSelectorProps> = ({
  tipoFluxo,
  setTipoFluxo,
  fluxoFlexivel,
  setFluxoFlexivel,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="space-y-1">
        <label className="block text-xs font-bold text-tec-navy">Modalidade do Trâmite *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setTipoFluxo('padrao')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              tipoFluxo === 'padrao'
                ? 'border-tec-orange bg-orange-50/50 ring-1 ring-tec-orange'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-tec-navy">📦 Devolução Física</span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                tipoFluxo === 'padrao' ? 'border-tec-orange bg-tec-orange' : 'border-slate-300'
              }`}>
                {tipoFluxo === 'padrao' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Peça retorna à fábrica. Expedição ➔ Produção ➔ Compras ➔ SGI ➔ Financeiro.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTipoFluxo('financeiro')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              tipoFluxo === 'financeiro'
                ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-blue-900">💳 Apenas Crédito</span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                tipoFluxo === 'financeiro' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
              }`}>
                {tipoFluxo === 'financeiro' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Sem retorno físico. Comercial ➔ Compras ➔ Financeiro direto.
            </p>
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
        <div>
          <span className="font-semibold text-slate-900 block text-xs flex items-center gap-1.5">
            <span>Trâmite Flexível</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase tracking-wider border border-amber-200">Livre</span>
          </span>
          <span className="text-[11px] text-slate-500 leading-tight">Campos técnicos e laudos opcionais na esteira</span>
        </div>
        <input
          type="checkbox"
          checked={fluxoFlexivel}
          onChange={(e) => setFluxoFlexivel(e.target.checked)}
          className="w-4 h-4 text-tec-orange rounded focus:ring-tec-orange cursor-pointer ml-2"
        />
      </div>
    </div>
  );
};
