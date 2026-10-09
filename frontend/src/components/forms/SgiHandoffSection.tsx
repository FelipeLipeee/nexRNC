import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SgiHandoffSectionProps {
  liberado: boolean;
  setLiberado: (b: boolean) => void;
  obsSgi: string;
  setObsSgi: (v: string) => void;
}

export const SgiHandoffSection: React.FC<SgiHandoffSectionProps> = ({
  liberado,
  setLiberado,
  obsSgi,
  setObsSgi,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-600 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>SGI / Qualidade: homologação técnica do laudo, causa raiz e liberação para tratativa.</span>
      </div>

      {/* Flag / Quadrado de Liberacao */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="font-bold text-tec-navy text-xs flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${liberado ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Liberar Conclusão Técnica</span>
          </span>
          <p className="text-[11px] text-slate-500">
            {liberado
              ? 'Laudo e causa raiz validados. RNC apta para acordo comercial.'
              : 'Marque a caixa para autorizar e liberar a tratativa comercial.'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={liberado}
            onChange={(e) => setLiberado(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Campo digitavel de Observacoes / Ressalvas */}
      <div>
        <label className="block font-bold text-tec-navy text-xs mb-1">
          Observações / Parecer Técnico do SGI
        </label>
        <textarea
          rows={3}
          value={obsSgi}
          onChange={(e) => setObsSgi(e.target.value)}
          placeholder="Registre aqui as considerações técnicas, auditorias necessárias ou orientações para o comercial..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>
    </div>
  );
};
