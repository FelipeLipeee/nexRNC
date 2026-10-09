export type SectorType = 
  | 'comercial'
  | 'expedicao'
  | 'producao'
  | 'estoque_beneficiado'
  | 'estoque_acessorios'
  | 'estoque_componentes'
  | 'kit'
  | 'pintura'
  | 'extrusao'
  | 'injetora'
  | 'anodizacao'
  | 'estoque_in_natura'
  | 'embalagem'
  | 'polimento'
  | 'usinagem'
  | 'compras'
  | 'fiscal'
  | 'sgi'
  | 'qualidade'
  | 'financeiro'
  | 'pcp'
  | 'almoxarifado'
  | 'ti'
  | 'rh'
  | 'gestao'
  | string;

export interface UserProfile {
  username: string;
  name: string;
  sector: SectorType;
  role: string;
}

export interface RncItem {
  id: number;
  protocol: string;
  current_step: string;
  current_step_label: string;
  current_sector: SectorType;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  cliente: string;
  nota_fiscal?: string;
  pedido_sankhya?: string;
  produto_descricao: string;
  motivo_reclamacao: string;
  quantidade: number;
  tipo_material: string;
  tipo_rnc?: 'Cliente' | 'Fornecedor' | 'Auditoria' | 'Inspeção de produto' | string;
  devolucao_autorizada?: number;
  recebimento_data?: string;
  recebimento_volumes?: number;
  recebimento_avaria_visivel?: number;
  recebimento_obs?: string;
  setor_encaminhado?: string;
  laudo_procedencia?: string;
  laudo_defeito_tecnico?: string;
  laudo_destinacao?: string;
  laudo_responsavel?: string;
  laudo_data?: string;
  producao_itens_json?: string;
  fiscal_nf_devolucao?: string;
  fiscal_data_escrituracao?: string;
  compras_nf_devolucao?: string;
  compras_data?: string;
  sgi_causa_raiz?: string;
  sgi_acao_corretiva?: string;
  sgi_homologado_por?: string;
  sgi_liberado?: number | boolean;
  sgi_observacoes?: string;
  comercial_tratativa?: string;
  comercial_detalhes?: string;
  financeiro_tipo_operacao?: string;
  financeiro_valor?: number;
  financeiro_concluido_por?: string;
  financeiro_obs?: string;
  financeiro_data?: string;
  comercial_fechamento_obs?: string;
  comercial_concluido_por?: string;
  sla_deadline?: string;
  sla_status: 'no_prazo' | 'alerta' | 'atrasado' | 'concluido' | 'sem_prazo' | 'aguardando_recebimento' | 'indeterminado';
  sla_hours_remaining?: number;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  fluxo_flexivel?: number | boolean;
  tipo_fluxo?: 'padrao' | 'financeiro';
  motivo_cancelamento?: string;
  data_reclamacao?: string;
  itens?: RncSubItem[];
}

export interface RncSubItem {
  id?: number;
  rnc_id?: number;
  tipo_material: string;
  produto_descricao: string;
  quantidade: number;
  unidade_medida?: string;
}

export interface DefeitoItem {
  id?: string;
  defeito: string;
  quantidade: number;
}

export interface ProducaoSubItem {
  id: string;
  produto_descricao: string;
  quantidade: number;
  unidade_medida: string;
  defeitos: (string | DefeitoItem)[];
  disposicao?: string;
}

export interface HistoryEntry {
  id: number;
  step: string;
  step_label: string;
  sector: SectorType;
  action: string;
  user_name: string;
  notes?: string;
  created_at: string;
}

export interface AttachmentEntry {
  id: number;
  step: string;
  file_name: string;
  file_path: string;
  category: string;
  uploaded_by: string;
  created_at: string;
}

export interface RncDetail {
  rnc: RncItem;
  history: HistoryEntry[];
  attachments: AttachmentEntry[];
  itens?: RncSubItem[];
}

export interface KpiSummary {
  total_ativas: number;
  total_concluidas: number;
  total_canceladas?: number;
  total_atrasadas: number;
  por_setor: Record<string, number>;
}

export function isEstoqueRnc(sector?: string, setorEncaminhado?: string): boolean {
  return (
    sector === 'estoque' ||
    sector === 'estoque_beneficiado' ||
    sector === 'estoque_acessorios' ||
    sector === 'estoque_componentes' ||
    Boolean(setorEncaminhado && setorEncaminhado.startsWith('estoque'))
  );
}

export function isRncInUserSector(currentUser: UserProfile, r: RncItem): boolean {
  if (currentUser.sector === 'gestao' || currentUser.sector === 'ti' || currentUser.sector === 'diretoria' || currentUser.sector === 'gerencia') {
    return true;
  }
  if (currentUser.sector === 'estoque') {
    return isEstoqueRnc(r.current_sector, r.setor_encaminhado);
  }
  if (currentUser.sector === 'producao') {
    if (isEstoqueRnc(r.current_sector, r.setor_encaminhado)) return false;
    return (
      r.current_sector === 'producao' ||
      r.current_step === 'step_3_producao' ||
      r.current_step === 'step_4_analise_tecnica'
    );
  }
  if (currentUser.sector === 'financeiro') {
    return r.current_sector === 'financeiro' || r.current_step === 'step_7_financeiro';
  }
  if (currentUser.sector === 'comercial') {
    return (
      r.current_sector === 'comercial' ||
      r.current_step === 'step_1_abertura' ||
      r.current_step === 'step_6_comercial' ||
      r.current_step === 'step_6_tratativa_comercial' ||
      r.current_step === 'step_8_comercial' ||
      r.current_step === 'step_8_encerramento'
    );
  }
  return r.current_sector === currentUser.sector;
}

export function canUserActOnRnc(currentUser: UserProfile, rnc: RncItem): boolean {
  if (currentUser.sector === 'gestao' || currentUser.sector === 'diretoria' || currentUser.sector === 'gerencia' || currentUser.sector === 'ti') return true;
  if (currentUser.sector === rnc.current_sector) return true;

  const isEstoque = isEstoqueRnc(rnc.current_sector, rnc.setor_encaminhado);

  if (currentUser.sector === 'estoque' && isEstoque) {
    return true;
  }

  if (
    currentUser.sector === 'producao' &&
    (rnc.current_step === 'step_3_producao' || rnc.current_step === 'step_4_analise_tecnica')
  ) {
    if (isEstoque) return false;
    return true;
  }

  if (
    (currentUser.sector === 'compras' && (rnc.current_sector === 'fiscal' || rnc.current_step === 'step_4_compras' || rnc.current_step === 'step_4_1_escrituracao')) ||
    (currentUser.sector === 'fiscal' && (rnc.current_sector === 'compras' || rnc.current_step === 'step_4_compras' || rnc.current_step === 'step_4_1_escrituracao'))
  ) {
    return true;
  }

  if (
    currentUser.sector === 'financeiro' &&
    (rnc.current_step === 'step_7_financeiro' || rnc.current_sector === 'financeiro')
  ) {
    return true;
  }

  if (
    currentUser.sector === 'comercial' &&
    (rnc.current_step === 'step_6_comercial' ||
      rnc.current_step === 'step_6_tratativa_comercial' ||
      rnc.current_step === 'step_8_comercial' ||
      rnc.current_step === 'step_8_encerramento' ||
      rnc.current_sector === 'comercial')
  ) {
    return true;
  }

  return false;
}

export interface BiSummary {
  total_rncs: number;
  em_andamento: number;
  concluidas: number;
  canceladas: number;
  custo_total_perdas: number;
  lead_time_medio_dias: number;
  sla_taxa_cumprimento: number;
  total_credito: number;
  total_fisico: number;
  pct_credito: number;
  pct_fisico: number;
}

export interface BiBottleneck {
  sector: string;
  label: string;
  count: number;
  pct: number;
  avg_hours: number;
  avg_days: number;
}

export interface BiTopClient {
  cliente: string;
  count: number;
  valor: number;
}

export interface BiCriticalAlert {
  id: number;
  protocol: string;
  cliente: string;
  current_step: string;
  current_step_label: string;
  current_sector: string;
  valor: number;
  is_delayed: boolean;
  hours_delay: number;
  days_delay: number;
  tipo_fluxo: 'padrao' | 'financeiro';
  criado_em: string;
}

export interface BiMetricsResponse {
  summary: BiSummary;
  bottlenecks: BiBottleneck[];
  quality: {
    procedencia: {
      procedente: number;
      improcedente: number;
      pendente: number;
      pct_procedente: number;
    };
    destinacao: { label: string; count: number }[];
    materiais: { label: string; count: number }[];
  };
  top_clientes: BiTopClient[];
  critical_alerts: BiCriticalAlert[];
}

export interface BiFilterParams {
  start_date?: string;
  end_date?: string;
  tipo_fluxo?: string;
  sector?: string;
}

export function isExecutiveUser(user: UserProfile | null): boolean {
  if (!user) return false;
  const sec = (user.sector || '').toLowerCase();
  const role = (user.role || '').toLowerCase();
  const uname = (user.username || '').toLowerCase();

  // Coordenadores NÃO têm acesso ao BI
  if (uname.startsWith('coord.') || uname.startsWith('coord') || role.includes('coord')) {
    return false;
  }

  // BI restrito exclusivamente para Admin, TI, Gerência e Diretoria
  return (
    sec === 'gestao' ||
    sec === 'diretoria' ||
    sec === 'gerencia' ||
    sec === 'ti' ||
    role.includes('diretor') ||
    role.includes('gerente') ||
    role.includes('admin') ||
    uname === 'gestor' ||
    uname === 'admin' ||
    uname.startsWith('ti')
  );
}

export function canCreateRnc(user: UserProfile | null): boolean {
  if (!user) return false;
  const sec = (user.sector || '').toLowerCase();
  const role = (user.role || '').toLowerCase();
  const uname = (user.username || '').toLowerCase();

  // Setor Comercial sempre pode abrir RNC
  if (sec === 'comercial') return true;

  // Apenas Administradores (TI, Gestao Central, Diretoria ou perfil admin)
  return (
    sec === 'ti' ||
    sec === 'gestao' ||
    sec === 'diretoria' ||
    role.includes('admin') ||
    uname === 'admin' ||
    uname === 'gestor' ||
    uname.startsWith('ti')
  );
}

