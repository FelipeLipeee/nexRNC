from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RegisterUserRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Nome completo do operador")
    username: str = Field(..., min_length=2, description="Login / usuário único")
    sector: str = Field(..., description="Setor: comercial, expedicao, producao, fiscal, sgi, financeiro, gestao")
    role: Optional[str] = Field(None, description="Cargo ou função no setor")
    password: str = Field(..., min_length=3, description="Senha de acesso")

class RncSubItemPayload(BaseModel):
    tipo_material: str = Field("perfil", description="perfil, kit, acessorio, outro")
    produto_descricao: str = Field(..., min_length=2, description="Descrição do material/item")
    quantidade: float = Field(1.0, gt=0, description="Quantidade do item")
    unidade_medida: Optional[str] = Field("UN", description="UN, PT, KG")

class CreateRncRequest(BaseModel):
    cliente: str = Field(..., min_length=2, description="Nome ou Razão Social do cliente")
    nota_fiscal: Optional[str] = Field(None, description="Número da NF de saída original")
    pedido_sankhya: Optional[str] = Field(None, description="Número do pedido Sankhya")
    produto_descricao: Optional[str] = Field(None, description="Descrição do vidro/perfil/kit (opcional se itens enviados)")
    motivo_reclamacao: str = Field(..., min_length=5, description="Descrição detalhada da não conformidade")
    quantidade: Optional[float] = Field(1.0, description="Quantidade de peças/metros avariados")
    tipo_material: Optional[str] = Field("perfil", description="perfil, kit, acessorio, vidro, outro")
    tipo_rnc: Optional[str] = Field("Cliente", description="Cliente, Fornecedor, Auditoria, Inspeção de produto")
    data_reclamacao: Optional[str] = Field(None, description="Data da reclamação formalizada pelo cliente (YYYY-MM-DD)")
    itens: Optional[List[RncSubItemPayload]] = Field(None, description="Lista de múltiplos itens/materiais avariados")
    devolucao_autorizada: bool = Field(True, description="Se requer retorno físico da mercadoria")
    fluxo_flexivel: bool = Field(False, description="Dispensar obrigatoriedade de preenchimento dos campos nas próximas etapas")
    tipo_fluxo: Optional[str] = Field("padrao", description="padrao (com devolucao fisica) ou financeiro (apenas credito)")
    user_name: str = Field("Comercial", description="Operador(a) responsável pela abertura da RNC")

class Step2ExpedicaoPayload(BaseModel):
    volumes_recebidos: int = Field(..., ge=1, description="Quantidade de volumes/peças descarregadas")
    avaria_visivel_transporte: bool = Field(False, description="Se há dano causado pela transportadora")
    tipo_material_confirmado: str = Field(..., description="perfil, kit, acessorio, vidro")
    setor_encaminhado: Optional[str] = Field("estoque_beneficiado", description="Setor fabril para onde encaminhar a RNC")
    observacoes: Optional[str] = Field(None, description="Observações do recebimento e quarentena")
    user_name: str = Field(..., description="Operador(a) responsável pelo recebimento na expedição")

class ProducaoItemDefeitoPayload(BaseModel):
    produto_descricao: str = Field(..., description="Descrição do item inspecionado")
    quantidade: float = Field(1.0, description="Quantidade")
    unidade_medida: str = Field("UN", description="UN, PT, KG")
    defeitos: List[str] = Field(default_factory=list, description="Lista de defeitos encontrados no item")
    disposicao: Optional[str] = Field("retrabalho", description="retrabalho, sucata, devolucao_fornecedor, liberado_concessao")

class Step3ProducaoPayload(BaseModel):
    procedente: bool = Field(..., description="Se a reclamação procede tecnicamente")
    defeito_tecnico: Optional[str] = Field(None, description="Classificação geral do defeito ou falha técnica")
    destinacao: Optional[str] = Field("retrabalho", description="sucata, retrabalho, devolucao_fornecedor, sem_defeito")
    itens_inspecionados: Optional[List[ProducaoItemDefeitoPayload]] = Field(None, description="Lista de itens e seus defeitos")
    causa_raiz: Optional[str] = Field(None, description="Análise de causa raiz da fábrica (5 Porquês)")
    acao_corretiva: Optional[str] = Field(None, description="Ação corretiva/preventiva da produção")
    observacoes: Optional[str] = Field(None, description="Laudo técnico detalhado")
    user_name: str = Field(..., description="Inspetor(a) técnico(a) da produção")

# Alias retrocompatível
Step4ProducaoPayload = Step3ProducaoPayload

class Step4ComprasPayload(BaseModel):
    nf_devolucao: str = Field(..., min_length=1, description="Número da NF de devolução / emissão compras")
    observacoes: Optional[str] = Field(None, description="Detalhes de compras / tratativa com fornecedor")
    user_name: str = Field(..., description="Comprador(a) responsável")

# Alias retrocompatível
Step41FiscalPayload = Step4ComprasPayload

class Step5SgiPayload(BaseModel):
    liberado: bool = Field(True, description="Conclusão técnica liberada pelo SGI")
    observacoes: Optional[str] = Field(None, description="Observações / ressalvas da qualidade/SGI")
    causa_raiz: Optional[str] = Field(None, description="Causa raiz adicional")
    acao_corretiva: Optional[str] = Field(None, description="Ação preventiva adicional")
    homologado: Optional[bool] = Field(True, description="Homologação final da qualidade")
    user_name: str = Field(..., description="Analista/Coordenador(a) de SGI / Qualidade")

class Step6ComercialPayload(BaseModel):
    tratativa: str = Field(..., description="reposicao, credito, desconto, improcedente")
    detalhes_acordo: str = Field(..., min_length=3, description="Acordo formalizado com o cliente")
    solicitar_financeiro: bool = Field(True, description="Se demanda execução pelo financeiro")
    user_name: str = Field(..., description="Vendedor(a) ou operador(a) comercial")

class Step7FinanceiroPayload(BaseModel):
    tipo_operacao: str = Field(..., description="credito_em_conta, abatimento_duplicata, estorno")
    valor: float = Field(..., ge=0, description="Valor final da operação financeira em R$")
    observacoes: Optional[str] = Field(None, description="Comprovante ou número do título liquidado")
    user_name: str = Field(..., description="Analista financeiro(a)")

class Step8ComercialPayload(BaseModel):
    comercial_fechamento_obs: Optional[str] = Field(None, description="Parecer final e comunicação com o cliente")
    concluido: bool = Field(True, description="Confirmação de encerramento da RNC")
    user_name: str = Field(..., description="Operador(a) comercial responsável pelo encerramento")

class CancelRncRequest(BaseModel):
    motivo: str = Field(..., min_length=5, description="Justificativa obrigatória do cancelamento")
    user_name: str = Field("Comercial", description="Usuário que solicitou o cancelamento")

class RncItemResponse(BaseModel):
    id: int
    protocol: str
    current_step: str
    current_step_label: str
    current_sector: str
    status: str
    cliente: str
    nota_fiscal: Optional[str] = None
    pedido_sankhya: Optional[str] = None
    produto_descricao: str
    motivo_reclamacao: str
    quantidade: float
    tipo_material: str
    devolucao_autorizada: Optional[bool] = True
    fluxo_flexivel: Optional[bool] = False
    tipo_fluxo: Optional[str] = "padrao"
    motivo_cancelamento: Optional[str] = None
    data_reclamacao: Optional[str] = None
    sla_deadline: Optional[str] = None
    sla_status: str
    sla_hours_remaining: Optional[float] = None
    tipo_rnc: Optional[str] = "Cliente"
    setor_encaminhado: Optional[str] = None
    sgi_liberado: Optional[bool] = False
    sgi_observacoes: Optional[str] = None
    compras_nf_devolucao: Optional[str] = None
    comercial_tratativa: Optional[str] = None
    comercial_detalhes: Optional[str] = None
    financeiro_tipo_operacao: Optional[str] = None
    financeiro_valor: Optional[float] = None
    financeiro_obs: Optional[str] = None
    financeiro_concluido_por: Optional[str] = None
    comercial_fechamento_obs: Optional[str] = None
    comercial_concluido_por: Optional[str] = None
    criado_por: str
    criado_em: str
    atualizado_em: str

class HistoryEntry(BaseModel):
    id: int
    step: str
    step_label: str
    sector: str
    action: str
    user_name: str
    notes: Optional[str]
    created_at: str

class AttachmentEntry(BaseModel):
    id: int
    step: str
    file_name: str
    file_path: str
    category: str
    uploaded_by: str
    created_at: str

class RncDetailResponse(BaseModel):
    rnc: dict
    history: List[HistoryEntry]
    attachments: List[AttachmentEntry]
    itens: Optional[List[dict]] = None

class ReturnStepRequest(BaseModel):
    motivo: str = Field(..., min_length=5, description="Justificativa obrigatória do retorno da etapa")
    user_name: str = Field("Operador", description="Nome do operador que solicitou o retorno")
