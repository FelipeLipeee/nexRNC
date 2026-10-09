import React, { useState } from 'react';
import { Plus, Trash2, Tag, Layers, Wrench } from 'lucide-react';
import type { ProducaoSubItem } from '../../types';

interface ProducaoHandoffSectionProps {
  procedente: boolean;
  setProcedente: (b: boolean) => void;
  destinacao: string;
  setDestinacao: (d: string) => void;
  itensProducao: ProducaoSubItem[];
  setItensProducao: React.Dispatch<React.SetStateAction<ProducaoSubItem[]>>;
  causaRaiz: string;
  setCausaRaiz: (s: string) => void;
  acaoCorretiva: string;
  setAcaoCorretiva: (s: string) => void;
  obsProducao: string;
  setObsProducao: (s: string) => void;
  isFlex: boolean;
}

export const ProducaoHandoffSection: React.FC<ProducaoHandoffSectionProps> = ({
  procedente,
  setProcedente,
  destinacao,
  setDestinacao,
  itensProducao,
  setItensProducao,
  causaRaiz,
  setCausaRaiz,
  acaoCorretiva,
  setAcaoCorretiva,
  obsProducao,
  setObsProducao,
  isFlex,
}) => {
  // Estado local para adicionar produto
  const [novoProd, setNovoProd] = useState('');
  const [novaQtd, setNovaQtd] = useState('1');
  const [novaUnidade, setNovaUnidade] = useState('UN');
  const [novoDefeitoInput, setNovoDefeitoInput] = useState<{ [itemId: string]: string }>({});
  const [novoDefeitoQtd, setNovoDefeitoQtd] = useState<{ [itemId: string]: string }>({});

  const handleAddProduto = () => {
    if (!novoProd.trim()) return;
    const qtd = parseFloat(novaQtd) || 1.0;
    const newItem: ProducaoSubItem = { id: Math.random().toString(36).substring(2, 9), produto_descricao: novoProd.trim(), quantidade: qtd > 0 ? qtd : 1.0, unidade_medida: novaUnidade, defeitos: [] };
    setItensProducao((prev) => [...prev, newItem]);
    setNovoProd('');
    setNovaQtd('1');
  };
  const handleRemoveProduto = (id: string) => setItensProducao((prev) => prev.filter((p) => p.id !== id));

  const handleAddDefeito = (itemId: string) => {
    const defText = (novoDefeitoInput[itemId] || '').trim();
    if (!defText) return;
    const qtd = parseFloat(novoDefeitoQtd[itemId] || '1') || 1.0;
    const defItem = { id: Math.random().toString(36).substring(2, 9), defeito: defText, quantidade: qtd > 0 ? qtd : 1.0 };
    setItensProducao((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, defeitos: [...it.defeitos, defItem] } : it))
    );
    setNovoDefeitoInput((prev) => ({ ...prev, [itemId]: '' }));
    setNovoDefeitoQtd((prev) => ({ ...prev, [itemId]: '1' }));
  };

  const handleRemoveDefeito = (itemId: string, defIndex: number) => {
    setItensProducao((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, defeitos: item.defeitos.filter((_, idx) => idx !== defIndex) }
          : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Banner Sutil */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-600 text-xs">
        <Wrench className="w-4 h-4 text-tec-orange shrink-0" />
        <span>Laudo de fábrica: confirme a procedência, os itens inspecionados e a causa raiz.</span>
      </div>

      {/* Parecer Pericial & Destinacao */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block font-bold text-slate-700 text-xs mb-1.5">Parecer Técnico *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProcedente(true)}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                procedente
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Procedente (Fábrica)
            </button>
            <button
              type="button"
              onClick={() => setProcedente(false)}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                !procedente
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Improcedente (Externo)
            </button>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 text-xs mb-1.5">Destinação do Material *</label>
          <select
            value={destinacao}
            onChange={(e) => setDestinacao(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange cursor-pointer font-medium shadow-2xs"
          >
            <option value="retrabalho">Retrabalho Interno na Fábrica</option>
            <option value="sucata">Sucata / Descarte</option>
            <option value="devolucao_fornecedor">Devolução ao Fornecedor de Matéria-Prima</option>
            <option value="sem_defeito">Sem Defeito (Retorno ao Estoque)</option>
          </select>
        </div>
      </div>

      {/* Secao de Produtos com sub-adicao de Defeitos (+) */}
      <div className="pt-1 space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="text-xs font-bold text-tec-navy flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-tec-orange" />
            <span>Produtos Inspecionados ({itensProducao.length})</span>
          </span>
          <span className="text-[11px] text-slate-400">Cadastre os produtos e defeitos com quantidade</span>
        </div>

        {/* Linha de entrada de novo produto (+) */}
        <div className="grid grid-cols-12 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
          <div className="col-span-12 sm:col-span-7">
            <input
              type="text"
              value={novoProd}
              onChange={(e) => setNovoProd(e.target.value)}
              placeholder="Descrição do produto (ex: Tubo Redondo 2 Pol Branco)"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange"
            />
          </div>
          <div className="col-span-6 sm:col-span-2">
            <input
              type="number"
              min="0.1"
              step="any"
              value={novaQtd}
              onChange={(e) => setNovaQtd(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange text-center font-bold"
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <select
              value={novaUnidade}
              onChange={(e) => setNovaUnidade(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-tec-orange cursor-pointer"
            >
              <option value="UN">UN</option>
              <option value="PT">PT</option>
              <option value="KG">KG</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={handleAddProduto}
              className="w-full h-8 bg-tec-orange hover:bg-tec-orange-hover text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer"
              title="Adicionar Produto"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de Produtos Cadastrados */}
        {itensProducao.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{item.produto_descricao}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                  {item.quantidade} {item.unidade_medida || 'UN'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProduto(item.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sub-lista de defeitos */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-600">
                  Defeitos Identificados ({item.defeitos.length}):
                </span>
              </div>

              {/* Tags de Defeito */}
              <div className="flex flex-wrap gap-1.5">
                {item.defeitos.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">Nenhum defeito adicionado.</span>
                ) : (
                  item.defeitos.map((def, idx) => {
                    const defDesc = typeof def === 'string' ? def : def.defeito;
                    const defQtd = typeof def === 'string' ? 1 : def.quantidade;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-[11px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                      >
                        <span>{defDesc}</span>
                        <span className="font-bold text-tec-orange bg-white px-1.5 py-0.2 rounded text-[10px] font-mono border border-slate-200">
                          {defQtd} {item.unidade_medida || 'UN'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDefeito(item.id, idx)}
                          className="hover:text-rose-600 font-bold ml-0.5 cursor-pointer text-xs text-slate-400"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Input para adicionar mais um defeito (+) com quantidade */}
              <div className="grid grid-cols-12 gap-1.5 pt-1">
                <div className="col-span-7 sm:col-span-8">
                  <input
                    type="text"
                    value={novoDefeitoInput[item.id] || ''}
                    onChange={(e) => setNovoDefeitoInput({ ...novoDefeitoInput, [item.id]: e.target.value })}
                    placeholder="Descrição do defeito (ex: Risco, Mancha, Fora de esquadro)..."
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDefeito(item.id);
                      }
                    }}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={novoDefeitoQtd[item.id] ?? '1'}
                    onChange={(e) => setNovoDefeitoQtd({ ...novoDefeitoQtd, [item.id]: e.target.value })}
                    placeholder="Qtd"
                    title={`Quantidade defeituosa (${item.unidade_medida || 'UN'})`}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange font-mono text-center font-bold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDefeito(item.id);
                      }
                    }}
                  />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleAddDefeito(item.id)}
                    className="w-full h-full py-1 bg-slate-800 hover:bg-tec-orange text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                    title="Adicionar Defeito com Quantidade"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Defeito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Causa Raiz e Acao Corretiva */}
      <div className="space-y-3 pt-2">
        <div className="pb-1 border-b border-slate-100">
          <span className="text-xs font-bold text-tec-navy uppercase tracking-wider block">
            Causa Raiz & Ação Corretiva
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Causa Raiz {!isFlex && '*'}
            </label>
            <textarea
              required={!isFlex}
              rows={2}
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              placeholder="Origem técnica da não conformidade..."
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Ação Corretiva {!isFlex && '*'}
            </label>
            <textarea
              required={!isFlex}
              rows={2}
              value={acaoCorretiva}
              onChange={(e) => setAcaoCorretiva(e.target.value)}
              placeholder="Tratativa corretiva ou preventiva aplicada..."
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 text-xs mb-1">Observações Técnicas Complementares</label>
          <input
            type="text"
            value={obsProducao}
            onChange={(e) => setObsProducao(e.target.value)}
            placeholder="Lote, bancada, ferramenta de corte..."
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange"
          />
        </div>
      </div>
    </div>
  );
};
