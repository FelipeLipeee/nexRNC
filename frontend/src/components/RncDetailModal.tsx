import React, { useEffect, useState } from 'react';
import { X, Clock, ArrowRight, Ban, Calendar, RotateCcw } from 'lucide-react';
import { canUserActOnRnc, type RncDetail, type UserProfile } from '../types';
import { fetchRnc, uploadAttachment, cancelRnc, returnStep } from '../services/api';
import { VideoPlayerModal } from './VideoPlayerModal';
import { RncItemsTable } from './RncItemsTable';
import { RncAttachmentGallery } from './RncAttachmentGallery';
import { CancelRncDialog } from './CancelRncDialog';
import { ReturnStepModal } from './ReturnStepModal';

interface RncDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rncId: number | null;
  currentUser: UserProfile;
  onOpenAction: (rnc: any) => void;
  onUpdated?: () => void;
}

export const RncDetailModal: React.FC<RncDetailModalProps> = ({
  isOpen,
  onClose,
  rncId,
  currentUser,
  onOpenAction,
  onUpdated,
}) => {
  const [detail, setDetail] = useState<RncDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [activeVideo, setActiveVideo] = useState<{ url: string; name: string } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    if (isOpen && rncId) {
      loadData(rncId);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  }, [isOpen, rncId]);

  const loadData = async (id: number) => {
    setLoading(true);
    try {
      const data = await fetchRnc(id);
      setDetail(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rncId) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0 || !detail) return;
    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const cat = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)
          ? 'video'
          : ext === 'pdf'
          ? 'pdf'
          : 'foto';
        await uploadAttachment(detail.rnc.id, file, detail.rnc.current_step, cat, currentUser.name);
      }
      await loadData(detail.rnc.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCancelRnc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !cancelReason.trim()) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelRnc(detail.rnc.id, cancelReason.trim(), currentUser.name);
      setShowCancelDialog(false);
      setCancelReason('');
      await loadData(detail.rnc.id);
    } catch (err: any) {
      setCancelError(err.message || 'Erro ao cancelar RNC');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnStep = async (motivo: string) => {
    if (!detail) return;
    await returnStep(detail.rnc.id, motivo, currentUser.name);
    await loadData(detail.rnc.id);
    onUpdated?.();
  };

  const rnc = detail?.rnc;
  const canAct = Boolean(rnc && canUserActOnRnc(currentUser, rnc));
  const isManager = ['gestao', 'gerencia', 'diretoria', 'ti'].includes(currentUser.sector) ||
    Boolean(currentUser.role && /gestor|gerente|diretor|administrador/i.test(currentUser.role));
  const isCreator = Boolean(rnc && (currentUser.name === rnc.criado_por || currentUser.username === rnc.criado_por));
  const canCancel = Boolean(rnc && rnc.status !== 'concluido' && rnc.status !== 'cancelado' && (isManager || isCreator));
  const canReturn = Boolean(
    rnc &&
    rnc.status === 'em_andamento' &&
    rnc.current_step !== 'step_1_abertura' &&
    rnc.current_step !== 'step_1_comercial' &&
    (canAct || isManager)
  );

  if (!isOpen || !rncId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in duration-200">
        
        {/* Header in Tec Navy */}
        <div className="p-5 bg-tec-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black text-tec-orange">{rnc?.protocol ?? 'RNC'}</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-tec-navy-dark border border-gray-600/50 text-slate-200 font-semibold">
              {rnc?.current_step_label}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              rnc?.status === 'concluido'
                ? 'bg-emerald-500/20 text-emerald-300'
                : rnc?.status === 'cancelado'
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {rnc?.status.toUpperCase()}
            </span>
            {(rnc?.tipo_fluxo === 'financeiro' || rnc?.devolucao_autorizada === 0) ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-400/20 text-blue-200 border border-blue-400/30">
                💳 Fluxo de Crédito (Sem Peça Física)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-400/20 text-orange-200 border border-orange-400/30">
                📦 Devolução Física
              </span>
            )}
            {Boolean(rnc?.fluxo_flexivel) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ⚡ Trâmite Flexível
              </span>
            )}
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-tec-navy-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading || !rnc ? (
          <div className="p-12 text-center text-xs text-slate-500">Carregando detalhes da RNC...</div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
            
            {/* Cancelado Warning Banner */}
            {rnc.status === 'cancelado' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-800">Esta RNC foi Cancelada</strong>
                  <p className="mt-0.5 text-rose-700 italic">Justificativa: {rnc.motivo_cancelamento || 'Cancelada pelo operador responsável.'}</p>
                </div>
              </div>
            )}
            
            {/* Top Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Cliente</span>
                <span className="font-bold text-tec-navy text-xs truncate block">{rnc.cliente}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Tipo de RNC</span>
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-tec-navy text-white inline-block mt-0.5">
                  {rnc.tipo_rnc || 'Cliente'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Data Reclamação</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 text-xs">
                  <Calendar className="w-3 h-3 text-tec-orange shrink-0" />
                  {rnc.data_reclamacao ? new Date(rnc.data_reclamacao + 'T00:00:00').toLocaleDateString('pt-BR') : new Date(rnc.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Pedido / Nota Fiscal</span>
                <span className="font-semibold text-slate-800 text-xs">
                  Ped: {rnc.pedido_sankhya || 'N/D'} • NF: {rnc.nota_fiscal || 'N/D'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Setor Direcionado</span>
                <span className="font-semibold text-slate-800 text-xs uppercase">
                  {rnc.setor_encaminhado || rnc.current_sector}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Prazo de SLA</span>
                <span className={`font-bold text-xs ${rnc.sla_status === 'atrasado' ? 'text-rose-600' : 'text-tec-orange'}`}>
                  {rnc.sla_hours_remaining ? `${rnc.sla_hours_remaining}h restantes` : 'Concluído'}
                </span>
              </div>
            </div>

            {/* Tabela de Itens e Materiais Reclamados */}
            <RncItemsTable
              itens={detail.itens}
              fallbackProduto={rnc.produto_descricao}
              fallbackMaterial={rnc.tipo_material}
              fallbackQuantidade={rnc.quantidade}
            />

            {/* Description & Cause */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-tec-navy uppercase tracking-wider mb-1">Motivo da Reclamação</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {rnc.motivo_reclamacao}
                </div>
              </div>

              {/* Technical / Compras / SGI details if filled */}
              {(rnc.laudo_defeito_tecnico || rnc.sgi_causa_raiz || rnc.compras_nf_devolucao || rnc.sgi_liberado !== undefined) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rnc.laudo_defeito_tecnico && (
                    <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl">
                      <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block mb-1">
                        Laudo Técnico ({rnc.laudo_responsavel}): {rnc.laudo_procedencia?.toUpperCase()}
                      </span>
                      <p className="text-slate-800 font-medium">{rnc.laudo_defeito_tecnico}</p>
                      <span className="text-[11px] text-orange-900 font-bold mt-1 block">
                        Destino: {rnc.laudo_destinacao}
                      </span>
                      {rnc.sgi_causa_raiz && (
                        <div className="mt-2 pt-2 border-t border-orange-200">
                          <p className="text-[11px] text-slate-700"><strong>Causa:</strong> {rnc.sgi_causa_raiz}</p>
                          <p className="text-[11px] text-emerald-800 font-semibold"><strong>Ação:</strong> {rnc.sgi_acao_corretiva}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {rnc.compras_nf_devolucao && (
                    <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                        Compras - NF Devolução
                      </span>
                      <p className="text-slate-900 font-bold text-xs">{rnc.compras_nf_devolucao}</p>
                      <span className="text-[11px] text-purple-700 mt-1 block">
                        Emitida em: {rnc.compras_data ? new Date(rnc.compras_data).toLocaleDateString('pt-BR') : 'Registrado'}
                      </span>
                    </div>
                  )}

                  {rnc.sgi_liberado !== undefined && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        SGI - Conclusão Técnica
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${rnc.sgi_liberado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {rnc.sgi_liberado ? '✓ Liberado pelo SGI' : '⚠ Com Ressalvas'}
                      </span>
                      {rnc.sgi_observacoes && (
                        <p className="text-slate-700 text-[11px] mt-1 italic">{rnc.sgi_observacoes}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Comercial & Financeiro resolution details */}
              {(rnc.comercial_tratativa || rnc.financeiro_tipo_operacao || rnc.comercial_fechamento_obs) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rnc.comercial_tratativa && (
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                        Comercial - Tratativa
                      </span>
                      <p className="text-slate-900 font-bold text-xs">{rnc.comercial_tratativa}</p>
                      {rnc.comercial_detalhes && <p className="text-slate-700 text-[11px] mt-1">{rnc.comercial_detalhes}</p>}
                    </div>
                  )}
                  {rnc.financeiro_tipo_operacao && (
                    <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl">
                      <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block mb-1">
                        Financeiro - Liquidação
                      </span>
                      <p className="text-slate-900 font-bold text-xs">{rnc.financeiro_tipo_operacao} • R$ {(rnc.financeiro_valor ?? 0).toFixed(2)}</p>
                      {rnc.financeiro_obs && <p className="text-slate-700 text-[11px] mt-1 italic">{rnc.financeiro_obs}</p>}
                      {rnc.financeiro_concluido_por && <span className="text-[10px] text-slate-400 block mt-1">Por: {rnc.financeiro_concluido_por}</span>}
                    </div>
                  )}
                  {rnc.comercial_fechamento_obs && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        Comercial - Encerramento
                      </span>
                      <p className="text-slate-800 text-[11px] font-medium">{rnc.comercial_fechamento_obs}</p>
                      {rnc.comercial_concluido_por && <span className="text-[10px] text-slate-500 block mt-1">Finalizado por: {rnc.comercial_concluido_por}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* History / Timeline */}
            <div>
              <h4 className="text-xs font-bold text-tec-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-tec-orange" />
                Linha do Tempo & Histórico de Handoff
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {detail.history.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-tec-orange border-2 border-white shadow-sm" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-tec-navy text-xs">{h.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(h.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-[11px] text-tec-orange font-bold">
                        Responsável: {h.user_name} ({h.sector.toUpperCase()})
                      </div>
                      {h.notes && <p className="text-slate-600 mt-1 italic">{h.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments / Multimedia Gallery */}
            <RncAttachmentGallery
              attachments={detail.attachments}
              uploading={uploading}
              onFileUpload={handleFileUpload}
              onOpenVideo={setActiveVideo}
            />

          </div>
        )}

        {/* Footer Actions */}
        {rnc && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-slate-500">
              Registrado por: <strong className="text-slate-800">{rnc.criado_por}</strong> em {new Date(rnc.criado_em).toLocaleDateString('pt-BR')}
            </span>

            <div className="flex items-center gap-2.5">
              {canReturn && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Voltar Etapa</span>
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelDialog(true)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancelar RNC</span>
                </button>
              )}

              <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
                Fechar
              </button>

              {canAct && rnc.status === 'em_andamento' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAction(rnc);
                  }}
                  className="flex items-center gap-1.5 bg-tec-orange hover:bg-tec-orange-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>Tratar Etapa Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
      {/* Return Step Confirmation Modal */}
      <ReturnStepModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={handleReturnStep}
        protocol={rnc?.protocol ?? 'RNC'}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelRncDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onSubmit={handleCancelRnc}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        cancelling={cancelling}
        error={cancelError}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.url || null}
        videoName={activeVideo?.name || null}
      />
    </div>
  );
};
