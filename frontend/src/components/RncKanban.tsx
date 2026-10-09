import React from 'react';
import { Clock, AlertCircle, ArrowRight, Eye } from 'lucide-react';
import { canUserActOnRnc, type RncItem, type UserProfile } from '../types';

interface RncKanbanProps {
  rncs: RncItem[];
  currentUser: UserProfile;
  onOpenDetail: (rnc: RncItem) => void;
  onOpenAction: (rnc: RncItem) => void;
}

interface ColumnDef {
  key: string;
  stepKeys: string[];
  title: string;
  sector: string;
  sla: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'expedicao', stepKeys: ['step_2_expedicao', 'step_2_3_expedicao'], title: '2. Expedição', sector: 'Expedição', sla: 'Aguardando Peça' },
  { key: 'producao', stepKeys: ['step_3_producao', 'step_4_analise_tecnica'], title: '3. Produção', sector: 'Produção', sla: '36h SLA' },
  { key: 'compras', stepKeys: ['step_4_compras', 'step_4_1_escrituracao'], title: '4. Compras / NF', sector: 'Compras', sla: '4h SLA' },
  { key: 'sgi', stepKeys: ['step_5_sgi', 'step_5_sgi_qualidade'], title: '5. SGI (Conclusão)', sector: 'SGI', sla: '12h SLA' },
  { key: 'comercial_tratativa', stepKeys: ['step_6_comercial', 'step_6_tratativa_comercial'], title: '6. Comercial (Tratativa)', sector: 'Comercial', sla: '12h SLA' },
  { key: 'financeiro', stepKeys: ['step_7_financeiro'], title: '7. Financeiro (Tratativa)', sector: 'Financeiro', sla: '12h SLA' },
  { key: 'comercial_final', stepKeys: ['step_8_comercial', 'step_8_encerramento'], title: '8. Comercial (Fechamento)', sector: 'Comercial', sla: '12h SLA' },
];

export const RncKanban: React.FC<RncKanbanProps> = ({ rncs, currentUser, onOpenDetail, onOpenAction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnRncs = rncs.filter((r) => col.stepKeys.includes(r.current_step) && r.status !== 'concluido' && r.status !== 'cancelado');

        return (
          <div key={col.key} className="bg-slate-100/80 border border-slate-200 rounded-xl flex flex-col min-w-[240px] shadow-sm">
            {/* Column Header in Tec Navy */}
            <div className="p-3 bg-tec-navy text-white rounded-t-xl flex items-center justify-between shadow-sm">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">{col.title}</h3>
                <span className="text-[10px] text-tec-orange font-bold uppercase">{col.sla}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-tec-navy-dark text-slate-200 border border-tec-navy-light px-2 py-0.5 rounded-full">
                {columnRncs.length}
              </span>
            </div>

            {/* Column Cards in Crisp White */}
            <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)]">
              {columnRncs.length === 0 ? (
                <div className="py-8 text-center text-[11px] text-slate-400 font-medium">
                  Nenhuma nesta etapa
                </div>
              ) : (
                columnRncs.map((item) => {
                  const canAct = canUserActOnRnc(currentUser, item);

                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenDetail(item)}
                      className="bg-white border border-slate-200 hover:border-tec-orange rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-tec-orange">{item.protocol}</span>
                          {(item.tipo_fluxo === 'financeiro' || item.devolucao_autorizada === 0) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              💳 Crédito
                            </span>
                          )}
                        </div>
                        {item.sla_status === 'atrasado' ? (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> Atrasado
                          </span>
                        ) : item.sla_status === 'aguardando_recebimento' ? (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" /> Aguardando Peça
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium">
                            <Clock className="w-3 h-3 text-tec-orange" /> {item.sla_hours_remaining}h
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-tec-navy truncate mb-0.5">{item.cliente}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-tight">
                        {item.produto_descricao}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Ver
                        </button>

                        {canAct && (
                          <button
                            onClick={() => onOpenAction(item)}
                            className="text-[11px] font-bold text-tec-orange hover:text-tec-orange-hover flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            Tratar <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
