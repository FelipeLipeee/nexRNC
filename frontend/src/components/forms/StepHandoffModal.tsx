import React, { useState } from 'react';
import { X, ArrowRight, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import type { RncItem, ProducaoSubItem, RncSubItem, UserProfile } from '../../types';
import { ReturnStepModal } from '../ReturnStepModal';
import { ExpedicaoHandoffSection } from './ExpedicaoHandoffSection';
import { ProducaoHandoffSection } from './ProducaoHandoffSection';
import { ComprasHandoffSection } from './ComprasHandoffSection';
import { SgiHandoffSection } from './SgiHandoffSection';
import { ComercialTratativaHandoffSection } from './ComercialTratativaHandoffSection';
import { FinanceiroHandoffSection } from './FinanceiroHandoffSection';
import { ComercialEncerramentoHandoffSection } from './ComercialEncerramentoHandoffSection';

interface StepHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  rnc: RncItem | null;
  currentUser?: UserProfile;
  onSubmitTransition: (rncId: number, targetStep: string, payload: any) => Promise<void>;
  onReturnStep?: (rncId: number, motivo: string) => Promise<void>;
}

const StepHandoffModalContent: React.FC<StepHandoffModalProps & { rnc: RncItem }> = ({
  onClose,
  rnc,
  currentUser: _currentUser,
  onSubmitTransition,
  onReturnStep,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [obsComercialRevisao, setObsComercialRevisao] = useState('');

  // Etapa 2: Expedicao
  const [volumes, setVolumes] = useState(rnc.quantidade.toString());
  const [avariaFrete, setAvariaFrete] = useState(false);
  const [setorEncaminhado, setSetorEncaminhado] = useState('estoque_beneficiado');
  const [obsExpedicao, setObsExpedicao] = useState('');

  // Etapa 3: Producao
  const [procedente, setProcedente] = useState(true);
  const [destinacao, setDestinacao] = useState('retrabalho');
  const [itensProducao, setItensProducao] = useState<ProducaoSubItem[]>(() =>
    rnc.itens && rnc.itens.length > 0
      ? rnc.itens.map((it: RncSubItem) => ({
          id: Math.random().toString(36).substring(2, 9),
          produto_descricao: it.produto_descricao,
          quantidade: it.quantidade,
          unidade_medida: it.unidade_medida || 'UN',
          defeitos: [],
        }))
      : [{
          id: Math.random().toString(36).substring(2, 9),
          produto_descricao: rnc.produto_descricao || '',
          quantidade: rnc.quantidade || 1,
          unidade_medida: 'UN',
          defeitos: [],
        }]
  );
  const [causaRaiz, setCausaRaiz] = useState('');
  const [acaoCorretiva, setAcaoCorretiva] = useState('');
  const [obsProducao, setObsProducao] = useState('');

  // Etapa 4: Compras
  const [nfDevolucao, setNfDevolucao] = useState('');
  const [obsCompras, setObsCompras] = useState('');

  // Etapa 5: SGI
  const [sgiLiberado, setSgiLiberado] = useState(true);
  const [obsSgi, setObsSgi] = useState('');

  // Etapa 6: Comercial Tratativa
  const [tratativa, setTratativa] = useState(rnc.comercial_tratativa || 'sem_custo');
  const [detalhesAcordo, setDetalhesAcordo] = useState(rnc.comercial_detalhes || '');

  // Etapa 7: Financeiro
  const [tipoOperacao, setTipoOperacao] = useState(rnc.financeiro_tipo_operacao || 'abatimento_duplicata');
  const [valorFinanceiro, setValorFinanceiro] = useState(rnc.financeiro_valor?.toString() || '0');
  const [obsFinanceiro, setObsFinanceiro] = useState(rnc.financeiro_obs || '');
  const [tratativaFinalizada, setTratativaFinalizada] = useState(true);

  // Etapa 8: Comercial Encerramento
  const [fechamentoObs, setFechamentoObs] = useState(rnc.comercial_fechamento_obs || '');
  const [confirmacaoCliente, setConfirmacaoCliente] = useState(true);

  const isFlex = Boolean(rnc.fluxo_flexivel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const step = rnc.current_step;

      if (step === 'step_1_abertura' || step === 'step_1_comercial') {
        const isFin = rnc.tipo_fluxo === 'financeiro' || !rnc.devolucao_autorizada;
        const target = isFin ? 'step_4_compras' : 'step_2_expedicao';
        await onSubmitTransition(rnc.id, target, {
          observacoes: obsComercialRevisao,
          obs_comercial_revisao: obsComercialRevisao,
        });
      } else if (step === 'step_2_3_expedicao' || step === 'step_2_expedicao') {
        await onSubmitTransition(rnc.id, 'step_4_analise_tecnica', {
          volumes: parseInt(volumes) || 1,
          avaria_frete: avariaFrete,
          setor_encaminhado: setorEncaminhado,
          obs_expedicao: obsExpedicao || (isFlex ? 'Dispensado recebimento físico (Trâmite flexível)' : ''),
        });
      } else if (step === 'step_4_analise_tecnica' || step === 'step_3_producao') {
        const defectsSummary = itensProducao
          .flatMap((it) =>
            it.defeitos.map((d) =>
              typeof d === 'string' ? d : `${d.quantidade}x ${d.defeito}`
            )
          )
          .join(', ');
        await onSubmitTransition(rnc.id, 'step_4_1_escrituracao', {
          procedente,
          destinacao,
          defeito_tecnico: defectsSummary || (isFlex ? 'Flexível' : 'Inspecionado em linha'),
          itens_inspecionados: itensProducao,
          causa_raiz: causaRaiz || (isFlex ? 'Trâmite flexível' : ''),
          acao_corretiva: acaoCorretiva || (isFlex ? 'Tratativa flexível' : ''),
          obs_producao: obsProducao,
        });
      } else if (step === 'step_4_1_escrituracao' || step === 'step_4_compras') {
        const isFin = rnc.tipo_fluxo === 'financeiro' || !rnc.devolucao_autorizada;
        const target = isFin ? 'step_7_financeiro' : 'step_5_sgi_qualidade';
        await onSubmitTransition(rnc.id, target, {
          nf_devolucao: nfDevolucao || (isFlex ? 'N/A - Flexível' : ''),
          observacoes: obsCompras,
        });
      } else if (step === 'step_5_sgi_qualidade' || step === 'step_5_sgi') {
        await onSubmitTransition(rnc.id, 'step_6_tratativa_comercial', {
          liberado: sgiLiberado,
          observacoes: obsSgi,
        });
      } else if (step === 'step_6_tratativa_comercial' || step === 'step_6_comercial') {
        await onSubmitTransition(rnc.id, 'step_7_financeiro', {
          tratativa,
          detalhes_acordo: detalhesAcordo,
          solicitar_financeiro: true,
        });
      } else if (step === 'step_7_financeiro') {
        await onSubmitTransition(rnc.id, 'step_8_comercial', {
          tipo_operacao: tipoOperacao,
          valor: parseFloat(valorFinanceiro) || 0.0,
          observacoes: obsFinanceiro,
          financeiro_obs: obsFinanceiro,
          tratativa_concluida: tratativaFinalizada,
        });
      } else if (step === 'step_8_comercial' || step === 'step_8_encerramento') {
        await onSubmitTransition(rnc.id, 'concluido', {
          comercial_fechamento_obs: fechamentoObs,
          observacoes: fechamentoObs,
          concluido: confirmacaoCliente,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar etapa');
    } finally {
      setLoading(false);
    }
  };

  const isStep1 = rnc.current_step === 'step_1_abertura' || rnc.current_step === 'step_1_comercial';
  const isStep7 = rnc.current_step === 'step_7_financeiro';
  const isStep8 = rnc.current_step === 'step_8_comercial' || rnc.current_step === 'step_8_encerramento';
  const isStep6 = rnc.current_step === 'step_6_comercial' || rnc.current_step === 'step_6_tratativa_comercial';
  const handleReturnConfirm = async (motivo: string) => {
    if (!onReturnStep) return;
    await onReturnStep(rnc.id, motivo);
    setShowReturnModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 bg-tec-navy text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-tec-orange">{rnc.protocol}</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-tec-navy-dark border border-gray-600/50 text-slate-200 font-semibold">
                {rnc.current_step_label}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 truncate max-w-md">
              Cliente: <strong className="text-white">{rnc.cliente}</strong> • {rnc.produto_descricao}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-tec-navy-light transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isFlex && (
            <div className="px-3 py-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
              <span className="font-bold text-amber-800 shrink-0">⚡ Trâmite Flexível:</span>
              <span className="text-amber-800/90">Campos opcionais para celeridade operacional.</span>
            </div>
          )}

          {/* Etapa 1: Revisão Comercial (pós-retorno) */}
          {isStep1 && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <RotateCcw className="w-4 h-4" />
                <span>Esta RNC foi devolvida ao Comercial para revisão</span>
              </div>
              <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-amber-200">
                <strong className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">Motivo da Reclamação Registrado:</strong>
                {rnc.motivo_reclamacao}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações da Revisão Comercial (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={obsComercialRevisao}
                  onChange={(e) => setObsComercialRevisao(e.target.value)}
                  placeholder="Instruções ou correções antes de reencaminhar a RNC..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-tec-orange"
                />
              </div>
            </div>
          )}

          {/* Etapa 2: Expedicao */}
          {(rnc.current_step === 'step_2_3_expedicao' || rnc.current_step === 'step_2_expedicao') && (
            <ExpedicaoHandoffSection
              volumes={volumes}
              setVolumes={setVolumes}
              avariaFrete={avariaFrete}
              setAvariaFrete={setAvariaFrete}
              setorEncaminhado={setorEncaminhado}
              setSetorEncaminhado={setSetorEncaminhado}
              obsExpedicao={obsExpedicao}
              setObsExpedicao={setObsExpedicao}
              isFlex={isFlex}
            />
          )}

          {/* Etapa 3: Producao */}
          {(rnc.current_step === 'step_4_analise_tecnica' || rnc.current_step === 'step_3_producao') && (
            <ProducaoHandoffSection
              procedente={procedente}
              setProcedente={setProcedente}
              destinacao={destinacao}
              setDestinacao={setDestinacao}
              itensProducao={itensProducao}
              setItensProducao={setItensProducao}
              causaRaiz={causaRaiz}
              setCausaRaiz={setCausaRaiz}
              acaoCorretiva={acaoCorretiva}
              setAcaoCorretiva={setAcaoCorretiva}
              obsProducao={obsProducao}
              setObsProducao={setObsProducao}
              isFlex={isFlex}
            />
          )}

          {/* Etapa 4: Compras */}
          {(rnc.current_step === 'step_4_1_escrituracao' || rnc.current_step === 'step_4_compras') && (
            <ComprasHandoffSection
              nfDevolucao={nfDevolucao}
              setNfDevolucao={setNfDevolucao}
              obsCompras={obsCompras}
              setObsCompras={setObsCompras}
              isFlex={isFlex}
            />
          )}

          {/* Etapa 5: SGI */}
          {(rnc.current_step === 'step_5_sgi_qualidade' || rnc.current_step === 'step_5_sgi') && (
            <SgiHandoffSection
              liberado={sgiLiberado}
              setLiberado={setSgiLiberado}
              obsSgi={obsSgi}
              setObsSgi={setObsSgi}
            />
          )}

          {/* Etapa 6: Comercial */}
          {isStep6 && (
            <ComercialTratativaHandoffSection
              tratativa={tratativa}
              setTratativa={setTratativa}
              detalhesAcordo={detalhesAcordo}
              setDetalhesAcordo={setDetalhesAcordo}
            />
          )}

          {/* Etapa 7: Financeiro */}
          {isStep7 && (
            <FinanceiroHandoffSection
              tipoOperacao={tipoOperacao}
              setTipoOperacao={setTipoOperacao}
              valorFinanceiro={valorFinanceiro}
              setValorFinanceiro={setValorFinanceiro}
              obsFinanceiro={obsFinanceiro}
              setObsFinanceiro={setObsFinanceiro}
              tratativaFinalizada={tratativaFinalizada}
              setTratativaFinalizada={setTratativaFinalizada}
            />
          )}

          {/* Etapa 8: Comercial Encerramento */}
          {isStep8 && (
            <ComercialEncerramentoHandoffSection
              rnc={rnc}
              fechamentoObs={fechamentoObs}
              setFechamentoObs={setFechamentoObs}
              confirmacaoCliente={confirmacaoCliente}
              setConfirmacaoCliente={setConfirmacaoCliente}
            />
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              {onReturnStep && !isStep1 && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 cursor-pointer disabled:opacity-50"
                  title="Retornar esta RNC para a etapa anterior"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Voltar Etapa</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
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
                className={`flex items-center gap-1.5 px-5 py-2 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer ${
                  isStep8
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-tec-orange hover:bg-tec-orange-hover'
                }`}
              >
                <span>
                  {loading
                    ? 'Processando...'
                    : isStep8
                    ? 'Finalizar e Concluir RNC'
                    : isStep7
                    ? 'Concluir Tratativa Financeira e Enviar ao Comercial'
                    : isStep6
                    ? 'Confirmar e Enviar ao Financeiro'
                    : 'Confirmar e Passar Bastão'}
                </span>
                {isStep8 ? <CheckCircle className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </form>
      </div>

      {showReturnModal && (
        <ReturnStepModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          onConfirm={handleReturnConfirm}
          protocol={rnc.protocol}
        />
      )}
    </div>
  );
};

export const StepHandoffModal: React.FC<StepHandoffModalProps> = (props) => {
  if (!props.isOpen || !props.rnc) return null;
  return <StepHandoffModalContent {...props} rnc={props.rnc} />;
};

