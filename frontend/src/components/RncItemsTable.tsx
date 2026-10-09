import React from 'react';
import { Package, Layers } from 'lucide-react';
import type { RncSubItem } from '../types';

interface RncItemsTableProps {
  itens?: RncSubItem[];
  fallbackProduto?: string;
  fallbackMaterial?: string;
  fallbackQuantidade?: number;
}

const MATERIAL_LABELS: Record<string, { label: string; badgeClass: string }> = {
  perfil: { label: 'Perfil de Alumínio', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  kit: { label: 'Kit Box / Instalação', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  acessorio: { label: 'Acessório / Roldana / Fechadura', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  outro: { label: 'Outro Material', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  multiplo: { label: 'Múltiplos Materiais', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const RncItemsTable: React.FC<RncItemsTableProps> = ({
  itens,
  fallbackProduto,
  fallbackMaterial = 'perfil',
  fallbackQuantidade = 1,
}) => {
  const list: RncSubItem[] = (itens && itens.length > 0)
    ? itens
    : fallbackProduto
    ? [{ tipo_material: fallbackMaterial, produto_descricao: fallbackProduto, quantidade: fallbackQuantidade }]
    : [];

  if (list.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-tec-navy flex items-center gap-1.5 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-tec-orange" />
          <span>Itens e Materiais Reclamados ({list.length})</span>
        </span>
        <span className="text-[11px] font-bold text-slate-500">
          Total: {list.reduce((acc, i) => acc + (Number(i.quantidade) || 0), 0)} un
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {list.map((item, idx) => {
          const matConfig = MATERIAL_LABELS[item.tipo_material] || {
            label: item.tipo_material.toUpperCase(),
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          };

          return (
            <div key={item.id ?? idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-tec-navy/5 text-tec-navy flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-900 text-xs block truncate">
                    {item.produto_descricao}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${matConfig.badgeClass}`}>
                      {matConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-tec-navy block">
                  {item.quantidade} <span className="text-[10px] font-semibold text-slate-500">{item.unidade_medida || 'UN'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
