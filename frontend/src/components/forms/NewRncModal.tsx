import React, { useState } from 'react';
import { X, Send, AlertTriangle, Package, Calendar } from 'lucide-react';
import type { UserProfile } from '../../types';
import { createRncWithAttachment } from '../../services/api';
import { ItemAdderSection, type FormItemEntry } from './ItemAdderSection';
import { MultiFileUploader } from './MultiFileUploader';
import { TramiteSelector } from './TramiteSelector';

interface NewRncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSuccess: () => void;
}

export const NewRncModal: React.FC<NewRncModalProps> = ({ isOpen, onClose, currentUser, onSuccess }) => {
  const [cliente, setCliente] = useState('');
  const [tipoRnc, setTipoRnc] = useState('Cliente');
  const [dataReclamacao, setDataReclamacao] = useState(() => new Date().toISOString().split('T')[0]);
  const [pedidoSankhya, setPedidoSankhya] = useState('');
  const [notaFiscal, setNotaFiscal] = useState('');
  
  // Itens da devolucao (+)
  const [items, setItems] = useState<FormItemEntry[]>([]);
  const [currTipoMaterial, setCurrTipoMaterial] = useState('perfil');
  const [currQuantidade, setCurrQuantidade] = useState('1');
  const [currUnidadeMedida, setCurrUnidadeMedida] = useState('UN');
  const [currProdutoDescricao, setCurrProdutoDescricao] = useState('');

  const [motivoReclamacao, setMotivoReclamacao] = useState('');
  const [tipoFluxo, setTipoFluxo] = useState<'padrao' | 'financeiro'>('padrao');
  const devolucaoAutorizada = tipoFluxo === 'padrao';
  const [fluxoFlexivel, setFluxoFlexivel] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFiles = (newFiles: File[]) => {
    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}_${f.size}`));
      const uniqueNew = newFiles.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));
      return [...prev, ...uniqueNew];
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleAddItem = () => {
    if (!currProdutoDescricao.trim()) {
      setError('Informe a descrição do produto antes de clicar no botão "+".');
      return;
    }
    const q = parseFloat(currQuantidade) || 1.0;
    if (q <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        tipo_material: currTipoMaterial,
        produto_descricao: currProdutoDescricao.trim(),
        quantidade: q,
        unidade_medida: currUnidadeMedida,
      },
    ]);
    setCurrProdutoDescricao('');
    setCurrQuantidade('1');
    setError(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !motivoReclamacao.trim()) {
      setError('Por favor, preencha o Cliente e o Motivo da reclamação.');
      return;
    }

    const finalItems = [...items];
    if (finalItems.length === 0 && currProdutoDescricao.trim()) {
      const q = parseFloat(currQuantidade) || 1.0;
      finalItems.push({
        id: 'auto-1',
        tipo_material: currTipoMaterial,
        produto_descricao: currProdutoDescricao.trim(),
        quantidade: q > 0 ? q : 1.0,
        unidade_medida: currUnidadeMedida,
      });
    }

    if (finalItems.length === 0) {
      setError('Adicione pelo menos um item à devolução usando o botão "+".');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('cliente', cliente.trim());
      fd.append('tipo_rnc', tipoRnc);
      if (dataReclamacao) fd.append('data_reclamacao', dataReclamacao);
      if (pedidoSankhya.trim()) fd.append('pedido_sankhya', pedidoSankhya.trim());
      if (notaFiscal.trim()) fd.append('nota_fiscal', notaFiscal.trim());

      const totQtd = finalItems.reduce((acc, it) => acc + it.quantidade, 0);
      const descSummary = finalItems.map((it) => it.produto_descricao).join(', ');
      const allTypes = new Set(finalItems.map((it) => it.tipo_material));
      const mainType = allTypes.size === 1 ? finalItems[0].tipo_material : 'multiplo';

      fd.append('tipo_material', mainType);
      fd.append('quantidade', totQtd.toString());
      fd.append('produto_descricao', descSummary);
      fd.append('itens_json', JSON.stringify(finalItems.map((it) => ({
        tipo_material: it.tipo_material,
        produto_descricao: it.produto_descricao,
        quantidade: it.quantidade,
        unidade_medida: it.unidade_medida || 'UN',
      }))));

      fd.append('motivo_reclamacao', motivoReclamacao.trim());
      fd.append('tipo_fluxo', tipoFluxo);
      fd.append('devolucao_autorizada', tipoFluxo === 'financeiro' ? 'false' : (devolucaoAutorizada ? 'true' : 'false'));
      const creatorSignature = currentUser.username
        ? `${currentUser.username} (${currentUser.name})`
        : currentUser.name;
      fd.append('user_name', creatorSignature);

      selectedFiles.forEach((f) => {
        fd.append('files', f);
      });
      if (selectedFiles.length > 0) {
        fd.append('file', selectedFiles[0]);
      }

      await createRncWithAttachment(fd);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao abrir RNC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header in Tec Navy */}
        <div className="p-5 bg-tec-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tec-orange text-white flex items-center justify-center shadow-md font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Etapa 1: Abertura de RNC Comercial</h3>
              <p className="text-xs text-slate-300">POP-CMC.0020 • SLA de 12 horas para triagem e abertura</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-tec-navy-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-tec-navy mb-1">Cliente / Razão Social *</label>
              <input
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ex: Vidros Exemplo Distribuidora Ltda"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-tec-navy mb-1">Tipo de RNC *</label>
              <select
                value={tipoRnc}
                onChange={(e) => setTipoRnc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white font-medium"
              >
                <option value="Cliente">Cliente</option>
                <option value="Fornecedor">Fornecedor</option>
                <option value="Auditoria">Auditoria</option>
                <option value="Inspeção de produto">Inspeção de produto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-tec-navy mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-tec-orange" />
                <span>Data Reclamação *</span>
              </label>
              <input
                type="date"
                required
                value={dataReclamacao}
                onChange={(e) => setDataReclamacao(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-tec-navy mb-1">Pedido Sankhya</label>
              <input
                type="text"
                value={pedidoSankhya}
                onChange={(e) => setPedidoSankhya(e.target.value)}
                placeholder="Ex: 84920"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-tec-navy mb-1">Nota Fiscal Venda</label>
              <input
                type="text"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
                placeholder="Ex: 104820"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
              />
            </div>
          </div>

          {/* Secao de Itens com [+] */}
          <ItemAdderSection
            items={items}
            currTipoMaterial={currTipoMaterial}
            setCurrTipoMaterial={setCurrTipoMaterial}
            currProdutoDescricao={currProdutoDescricao}
            setCurrProdutoDescricao={setCurrProdutoDescricao}
            currQuantidade={currQuantidade}
            setCurrQuantidade={setCurrQuantidade}
            currUnidadeMedida={currUnidadeMedida}
            setCurrUnidadeMedida={setCurrUnidadeMedida}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />

          <div>
            <label className="block text-xs font-bold text-tec-navy mb-1">Motivo da Reclamação / Defeito *</label>
            <textarea
              required
              rows={3}
              value={motivoReclamacao}
              onChange={(e) => setMotivoReclamacao(e.target.value)}
              placeholder="Descreva detalhadamente a não conformidade relatada pelo cliente..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white"
            />
          </div>

          {/* Anexos de PDF, Fotos ou Videos */}
          <MultiFileUploader
            files={selectedFiles}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAllFiles}
          />

          {/* Modalidade de Tramite e Opcoes */}
          <TramiteSelector
            tipoFluxo={tipoFluxo}
            setTipoFluxo={setTipoFluxo}
            fluxoFlexivel={fluxoFlexivel}
            setFluxoFlexivel={setFluxoFlexivel}
          />

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-1.5 px-5 py-2 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer ${
                tipoFluxo === 'financeiro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-tec-orange hover:bg-tec-orange-hover'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {loading
                  ? 'Abrindo...'
                  : tipoFluxo === 'financeiro'
                  ? 'Abrir e Enviar para Compras (Crédito)'
                  : 'Abrir e Enviar para Expedição'}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
