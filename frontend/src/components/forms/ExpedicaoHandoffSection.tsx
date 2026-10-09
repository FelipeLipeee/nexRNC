import React from 'react';
import { Truck, ArrowRight } from 'lucide-react';

interface ExpedicaoHandoffSectionProps {
  volumes: string;
  setVolumes: (v: string) => void;
  avariaFrete: boolean;
  setAvariaFrete: (v: boolean) => void;
  setorEncaminhado: string;
  setSetorEncaminhado: (v: string) => void;
  obsExpedicao: string;
  setObsExpedicao: (v: string) => void;
  isFlex: boolean;
}

const QUICK_ROUTING_PRESETS = [
  { label: 'Perfis ➔ Estoque Beneficiado (Fabrício)', value: 'estoque_beneficiado' },
  { label: 'Acessórios ➔ Estoque Acessórios', value: 'estoque_acessorios' },
  { label: 'Componentes ➔ Estoque Componentes', value: 'estoque_componentes' },
  { label: 'Kit ➔ Setor Kit', value: 'kit' },
];

const ALL_PRODUCTION_SECTORS = [
  { value: 'estoque_beneficiado', label: 'Estoque de Perfis Beneficiados' },
  { value: 'estoque_acessorios', label: 'Estoque de Acessórios' },
  { value: 'estoque_componentes', label: 'Estoque de Componentes' },
  { value: 'kit', label: 'Setor Kit' },
  { value: 'pintura', label: 'Pintura Eletrostática' },
  { value: 'extrusao', label: 'Extrusão' },
  { value: 'injetora', label: 'Injetora' },
  { value: 'anodizacao', label: 'Anodização' },
  { value: 'embalagem', label: 'Embalagem / Expedição Fabril' },
  { value: 'estoque_in_natura', label: 'Estoque In Natura' },
  { value: 'producao', label: 'Produção Geral / Triagem' },
];

export const ExpedicaoHandoffSection: React.FC<ExpedicaoHandoffSectionProps> = ({
  volumes,
  setVolumes,
  avariaFrete,
  setAvariaFrete,
  setorEncaminhado,
  setSetorEncaminhado,
  obsExpedicao,
  setObsExpedicao,
  isFlex,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-600 text-xs">
        <Truck className="w-4 h-4 text-tec-orange shrink-0" />
        <span>Recebimento físico: confirme os volumes e encaminhe ao setor fabril responsável.</span>
      </div>

      {/* Setor de Destino */}
      <div>
        <label className="block font-bold text-tec-navy text-xs mb-1.5 flex items-center justify-between">
          <span>Para qual setor encaminhar o material? *</span>
          <span className="text-[11px] text-slate-500 font-normal">Fila de Produção</span>
        </label>

        {/* Botoes de selecao rapida conforme POP */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {QUICK_ROUTING_PRESETS.map((preset) => {
            const isSelected = setorEncaminhado === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSetorEncaminhado(preset.value)}
                className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-tec-navy text-white border-tec-navy shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{preset.label}</span>
                {isSelected && <ArrowRight className="w-3.5 h-3.5 text-tec-orange shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Dropdown com todos os setores da fabrica */}
        <select
          value={setorEncaminhado}
          onChange={(e) => setSetorEncaminhado(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange cursor-pointer font-medium"
        >
          {ALL_PRODUCTION_SECTORS.map((s) => (
            <option key={s.value} value={s.value}>
              ➔ {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Volumes e Avaria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-bold text-tec-navy text-xs mb-1">
            Volumes Recebidos {!isFlex && '*'}
          </label>
          <input
            type="number"
            min="1"
            required={!isFlex}
            value={volumes}
            onChange={(e) => setVolumes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-start gap-2 text-xs font-medium text-slate-700 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200 w-full hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={avariaFrete}
              onChange={(e) => setAvariaFrete(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-tec-orange focus:ring-tec-orange mt-0.5"
            />
            <span className="leading-tight">Avaria visível identificada no descarregamento / frete</span>
          </label>
        </div>
      </div>

      {/* Observacoes */}
      <div>
        <label className="block font-bold text-tec-navy text-xs mb-1">Observações da Quarentena / Carga</label>
        <textarea
          rows={2}
          value={obsExpedicao}
          onChange={(e) => setObsExpedicao(e.target.value)}
          placeholder="Ex: Identificação do lote, estado das embalagens, local na baia de quarentena..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
        />
      </div>
    </div>
  );
};
