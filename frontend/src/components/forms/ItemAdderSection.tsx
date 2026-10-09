import React from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';

export interface FormItemEntry {
  id: string;
  tipo_material: string;
  produto_descricao: string;
  quantidade: number;
  unidade_medida: string;
}

interface ItemAdderSectionProps {
  items: FormItemEntry[];
  currTipoMaterial: string;
  setCurrTipoMaterial: (val: string) => void;
  currProdutoDescricao: string;
  setCurrProdutoDescricao: (val: string) => void;
  currQuantidade: string;
  setCurrQuantidade: (val: string) => void;
  currUnidadeMedida: string;
  setCurrUnidadeMedida: (val: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

export const ItemAdderSection: React.FC<ItemAdderSectionProps> = ({
  items,
  currTipoMaterial,
  setCurrTipoMaterial,
  currProdutoDescricao,
  setCurrProdutoDescricao,
  currQuantidade,
  setCurrQuantidade,
  currUnidadeMedida,
  setCurrUnidadeMedida,
  onAddItem,
  onRemoveItem,
}) => {
  return (
    <div className="pt-1 space-y-2.5">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <span className="text-xs font-bold text-tec-navy flex items-center gap-1.5 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-tec-orange" />
          <span>Itens da Devolução ({items.length})</span>
        </span>
        <span className="text-[11px] text-slate-400">Adicione os produtos com quantidade e unidade</span>
      </div>

      {/* Linha de Adicao de Item */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tipo de Material</label>
          <select
            value={currTipoMaterial}
            onChange={(e) => setCurrTipoMaterial(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
          >
            <option value="perfil">Perfil de Alumínio</option>
            <option value="kit">Kit Box / Instalação</option>
            <option value="acessorio">Acessório / Roldana</option>
            <option value="outro">Outro Material</option>
          </select>
        </div>

        <div className="sm:col-span-4">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Descrição do Produto</label>
          <input
            type="text"
            value={currProdutoDescricao}
            onChange={(e) => setCurrProdutoDescricao(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddItem(); } }}
            placeholder="Ex: Guia Superior 6m Branco"
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Qtd</label>
          <input
            type="number"
            step="1"
            min="1"
            value={currQuantidade}
            onChange={(e) => setCurrQuantidade(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddItem(); } }}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange text-center font-bold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Unidade</label>
          <select
            value={currUnidadeMedida}
            onChange={(e) => setCurrUnidadeMedida(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-tec-orange font-bold text-center"
          >
            <option value="UN">UN</option>
            <option value="PT">PT</option>
            <option value="KG">KG</option>
          </select>
        </div>

        <div className="sm:col-span-1 flex items-end">
          <button
            type="button"
            onClick={onAddItem}
            title="Adicionar item à lista"
            className="w-full h-8 flex items-center justify-center bg-tec-orange hover:bg-tec-orange-hover text-white rounded font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista dos Itens Adicionados */}
      {items.length > 0 ? (
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {items.map((it, idx) => (
            <div key={it.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  it.tipo_material === 'perfil' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  it.tipo_material === 'kit' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  it.tipo_material === 'acessorio' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {it.tipo_material.toUpperCase()}
                </span>
                <span className="font-semibold text-slate-800 truncate flex-1">{it.produto_descricao}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="font-black text-tec-navy text-xs">{it.quantidade} {it.unidade_medida || 'UN'}</span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(it.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title="Remover item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-2.5 text-[11px] text-slate-400 italic bg-white/60 rounded-lg border border-dashed border-slate-200">
          Nenhum item adicionado ainda. Preencha os campos e clique no botão "+" acima.
        </div>
      )}
    </div>
  );
};
