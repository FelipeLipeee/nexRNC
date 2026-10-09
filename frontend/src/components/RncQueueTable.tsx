import React from 'react';
import { ArrowRight, Clock, AlertCircle, Eye, CheckCircle, XCircle, Table, User, Building2, Globe } from 'lucide-react';
import { canUserActOnRnc, type RncItem, type UserProfile } from '../types';

interface RncQueueTableProps {
  rncs: RncItem[];
  currentUser: UserProfile;
  onOpenDetail: (rnc: RncItem) => void;
  onOpenAction: (rnc: RncItem) => void;
  filterMode: 'all' | 'my_sector' | 'my_rncs';
  onFilterModeChange: (mode: 'all' | 'my_sector' | 'my_rncs') => void;
}

export const RncQueueTable: React.FC<RncQueueTableProps> = ({
  rncs,
  currentUser,
  onOpenDetail,
  onOpenAction,
  filterMode,
  onFilterModeChange,
}) => {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const isSyncingRef = React.useRef<boolean>(false);

  const handleTableScroll = () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (topScrollRef.current && tableContainerRef.current) {
      topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const handleTopScroll = () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (tableContainerRef.current && topScrollRef.current) {
      tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const getSlaBadge = (item: RncItem) => {
    if (item.status === 'cancelado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelada
        </span>
      );
    }

    if (item.status === 'concluido') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Concluído
        </span>
      );
    }

    if (item.sla_status === 'aguardando_recebimento') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-500" /> Aguardando Peça
        </span>
      );
    }

    if (item.sla_status === 'atrasado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Atrasado ({Math.abs(item.sla_hours_remaining ?? 0)}h)
        </span>
      );
    }

    if (item.sla_status === 'alerta') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Vence em {item.sla_hours_remaining}h
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3.5 h-3.5 text-blue-500" /> No prazo ({item.sla_hours_remaining ?? '-'}h)
      </span>
    );
  };

  const getFlowProgressBadge = (item: RncItem) => {
    if (item.status === 'cancelado') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 line-through">
          Cancelada
        </span>
      );
    }
    const isFin = item.tipo_fluxo === 'financeiro' || !item.devolucao_autorizada;

    if (item.status === 'concluido') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>{isFin ? '4/4 • Concluída (Crédito)' : '8/8 • Concluída'}</span>
        </span>
      );
    }

    const step = item.current_step;

    if (isFin) {
      if (step === 'step_4_compras' || step === 'step_4_1_escrituracao') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border bg-purple-50 text-purple-800 border-purple-200">
            <span className="font-mono opacity-80">1/3</span>
            <span>Compras (Ajuste/NF)</span>
          </span>
        );
      }
      if (step === 'step_7_financeiro') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border bg-cyan-50 text-cyan-800 border-cyan-200 font-bold">
            <span className="font-mono opacity-80">2/3</span>
            <span>Financeiro</span>
          </span>
        );
      }
      if (step === 'step_8_comercial' || step === 'step_8_encerramento') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border bg-indigo-50 text-indigo-800 border-indigo-200 font-bold">
            <span className="font-mono opacity-80">3/3</span>
            <span>Comercial (Encerramento)</span>
          </span>
        );
      }
    }

    let stepNum = '1/8';
    let stepLabel = 'Comercial';
    let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';

    if (step === 'step_1_comercial' || step === 'step_1_abertura') {
      stepNum = '1/8';
      stepLabel = 'Comercial (Abertura)';
      badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (step === 'step_2_expedicao' || step === 'step_2_3_expedicao') {
      stepNum = '2/8';
      stepLabel = 'Expedição';
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (step === 'step_3_producao' || step === 'step_4_analise_tecnica') {
      stepNum = '3/8';
      const isEst = item.current_sector.startsWith('estoque') || Boolean(item.setor_encaminhado && item.setor_encaminhado.startsWith('estoque'));
      if (isEst) {
        stepLabel = 'Estoque (Laudo)';
        badgeColor = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      } else {
        const sub = item.setor_encaminhado ? item.setor_encaminhado.toUpperCase() : item.current_sector.toUpperCase();
        stepLabel = `Produção (${sub})`;
        badgeColor = 'bg-orange-50 text-orange-900 border-orange-300 font-bold';
      }
    } else if (step === 'step_4_compras' || step === 'step_4_1_escrituracao') {
      stepNum = '4/8';
      stepLabel = 'Compras';
      badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
    } else if (step === 'step_5_sgi' || step === 'step_5_sgi_qualidade') {
      stepNum = '5/8';
      stepLabel = 'SGI (Qualidade)';
      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
    } else if (step === 'step_6_comercial' || step === 'step_6_tratativa_comercial') {
      stepNum = '6/8';
      stepLabel = 'Comercial (Tratativa)';
      badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    } else if (step === 'step_7_financeiro') {
      stepNum = '7/8';
      stepLabel = 'Financeiro';
      badgeColor = 'bg-cyan-50 text-cyan-800 border-cyan-200 font-bold';
    } else if (step === 'step_8_comercial' || step === 'step_8_encerramento') {
      stepNum = '8/8';
      stepLabel = 'Comercial (Fechamento)';
      badgeColor = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}>
        <span className="font-mono opacity-80">{stepNum}</span>
        <span>{stepLabel}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 mb-10">
      {/* Header & Title identical to TecDesk */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold text-tec-navy flex items-center gap-2">
            <Table className="w-5 h-5 text-tec-orange" />
            <span>
              {filterMode === 'my_rncs'
                ? `Minhas RNCs Abertas (${currentUser.name})`
                : filterMode === 'my_sector'
                ? `Fila de Atendimento: Setor ${currentUser.sector === 'fiscal' ? 'COMPRAS' : currentUser.sector.toUpperCase()}`
                : 'Visão Geral: Todas as RNCs em Andamento'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Procedimento Operacional Padrão da Qualidade • Clique na RNC para ver histórico ou tratar etapa
          </p>
        </div>

        {/* 3-Mode Filter Toggle Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onFilterModeChange('my_rncs')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === 'my_rncs'
                ? 'bg-tec-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Minhas RNCs</span>
          </button>

          <button
            onClick={() => onFilterModeChange('my_sector')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === 'my_sector'
                ? 'bg-tec-orange text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Fila do Meu Setor</span>
          </button>

          <button
            onClick={() => onFilterModeChange('all')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-tec-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Toda a Empresa</span>
          </button>
        </div>
      </div>

      {/* Table Container com Rolagem Horizontal Superior Sincronizada */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
        {/* Barra de Rolagem Horizontal Superior Permanente (Sincronizada) */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] shrink-0">
            <span className="text-tec-orange font-bold">↔ Rolagem Rápida:</span>
          </div>
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="overflow-x-auto flex-1 ml-3 py-0.5"
          >
            <div style={{ width: '1300px', height: '6px' }} />
          </div>
        </div>

        {/* Tabela com Rolagem Sincronizada */}
        <div
          ref={tableContainerRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[1300px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Protocolo / Data</th>
              <th className="py-3 px-4">Cliente / Pedido</th>
              <th className="py-3 px-4">Produto & Defeito</th>
              <th className="py-3 px-4">Etapa do Fluxo</th>
              <th className="py-3 px-4">Setor Responsável</th>
              <th className="py-3 px-4 text-center">Status SLA</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rncs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Nenhuma RNC pendente nesta fila no momento.
                </td>
              </tr>
            ) : (
              rncs.map((item) => {
                const canAct = canUserActOnRnc(currentUser, item);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenDetail(item)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-tec-orange whitespace-nowrap">
                      {item.protocol}
                      <div className="text-[11px] font-sans text-slate-400 font-normal" title="Data da Reclamação">
                        {item.data_reclamacao ? new Date(item.data_reclamacao + 'T00:00:00').toLocaleDateString('pt-BR') : new Date(item.criado_em).toLocaleDateString('pt-BR')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-tec-navy">{item.cliente}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.pedido_sankhya ? `Ped: ${item.pedido_sankhya}` : ''}
                        {item.nota_fiscal ? ` • NF: ${item.nota_fiscal}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.tipo_rnc && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.tipo_rnc}
                          </span>
                        )}
                        {(item.tipo_fluxo === 'financeiro' || item.devolucao_autorizada === 0) && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                            💳 Crédito
                          </span>
                        )}
                        <span className="font-semibold text-slate-800 truncate">{item.produto_descricao}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{item.motivo_reclamacao}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getFlowProgressBadge(item)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {item.current_sector === 'fiscal' ? 'COMPRAS' : item.current_sector}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getSlaBadge(item)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                          title="Ver Timeline e Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canAct && item.status !== 'concluido' && item.status !== 'cancelado' && (
                          <button
                            onClick={() => onOpenAction(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tec-orange hover:bg-tec-orange-hover text-white font-bold text-xs shadow-sm transition-all active:scale-98 cursor-pointer"
                          >
                            <span>Tratar Etapa</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
