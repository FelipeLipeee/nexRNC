from enum import Enum
from typing import Dict, List

class Sector(str, Enum):
    COMERCIAL = "comercial"
    EXPEDICAO = "expedicao"
    PRODUCAO = "producao"
    # Subsetores Fabris da Producao
    ESTOQUE_BENEFICIADO = "estoque_beneficiado"
    ESTOQUE_ACESSORIOS = "estoque_acessorios"
    ESTOQUE_COMPONENTES = "estoque_componentes"
    KIT = "kit"
    PINTURA = "pintura"
    EXTRUSAO = "extrusao"
    INJETORA = "injetora"
    ANODIZACAO = "anodizacao"
    ESTOQUE_IN_NATURA = "estoque_in_natura"
    EMBALAGEM = "embalagem"
    POLIMENTO = "polimento"
    USINAGEM = "usinagem"
    # Setores Corporativos / Apoio
    COMPRAS = "compras"
    FISCAL = "fiscal"
    SGI = "sgi"
    QUALIDADE = "qualidade"
    FINANCEIRO = "financeiro"
    PCP = "pcp"
    ALMOXARIFADO = "almoxarifado"
    TI = "ti"
    RH = "rh"
    GESTAO = "gestao"
    GERENCIA = "gerencia"
    DIRETORIA = "diretoria"

PRODUCTION_SECTORS: List[Dict[str, str]] = [
    {"id": "estoque_beneficiado", "name": "Perfil Beneficiado (Estoque Beneficiado)", "material": "perfil"},
    {"id": "estoque_acessorios", "name": "Estoque de Acessórios", "material": "acessorio"},
    {"id": "estoque_componentes", "name": "Estoque de Componentes", "material": "componente"},
    {"id": "kit", "name": "Kit", "material": "kit"},
    {"id": "pintura", "name": "Pintura", "material": "perfil"},
    {"id": "extrusao", "name": "Extrusão", "material": "perfil"},
    {"id": "injetora", "name": "Injetora", "material": "acessorio"},
    {"id": "anodizacao", "name": "Anodização", "material": "perfil"},
    {"id": "estoque_in_natura", "name": "Estoque In Natura", "material": "perfil"},
    {"id": "embalagem", "name": "Embalagem", "material": "geral"},
    {"id": "polimento", "name": "Polimento", "material": "perfil"},
    {"id": "usinagem", "name": "Usinagem", "material": "componente"},
]

class RncStep(str, Enum):
    STEP_1_ABERTURA = "step_1_abertura"
    STEP_2_EXPEDICAO = "step_2_expedicao"
    STEP_3_PRODUCAO = "step_3_producao"
    STEP_4_COMPRAS = "step_4_compras"
    STEP_5_SGI = "step_5_sgi"
    STEP_6_COMERCIAL = "step_6_comercial"
    STEP_7_FINANCEIRO = "step_7_financeiro"
    STEP_8_COMERCIAL = "step_8_comercial"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"

STEP_LABELS: Dict[str, str] = {
    "step_1_abertura": "1. Abertura e Triagem Comercial",
    "step_2_expedicao": "2. Recebimento e Encaminhamento (Expedição)",
    "step_2_3_expedicao": "2. Recebimento e Encaminhamento (Expedição)",
    "step_3_producao": "3. Análise Técnica e Causa Raiz (Produção)",
    "step_4_analise_tecnica": "3. Análise Técnica e Causa Raiz (Produção)",
    "step_4_compras": "4. Emissão de Devolução (Compras)",
    "step_4_1_escrituracao": "4. Emissão de Devolução (Compras)",
    "step_5_sgi": "5. Conclusão Técnica e Liberação (SGI)",
    "step_5_sgi_qualidade": "5. Conclusão Técnica e Liberação (SGI)",
    "step_6_comercial": "6. Tratativa Comercial com Cliente",
    "step_6_tratativa_comercial": "6. Tratativa Comercial com Cliente",
    "step_7_financeiro": "7. Tratativa Financeira",
    "step_8_comercial": "8. Validação e Encerramento (Comercial)",
    "step_8_encerramento": "8. Validação e Encerramento (Comercial)",
    "concluido": "Concluído",
    "cancelado": "Cancelado",
}

STEP_SECTOR_MAP: Dict[str, str] = {
    "step_1_abertura": Sector.COMERCIAL.value,
    "step_2_expedicao": Sector.EXPEDICAO.value,
    "step_2_3_expedicao": Sector.EXPEDICAO.value,
    "step_3_producao": Sector.PRODUCAO.value,
    "step_4_analise_tecnica": Sector.PRODUCAO.value,
    "step_4_compras": Sector.COMPRAS.value,
    "step_4_1_escrituracao": Sector.COMPRAS.value,
    "step_5_sgi": Sector.SGI.value,
    "step_5_sgi_qualidade": Sector.SGI.value,
    "step_6_comercial": Sector.COMERCIAL.value,
    "step_6_tratativa_comercial": Sector.COMERCIAL.value,
    "step_7_financeiro": Sector.FINANCEIRO.value,
    "step_8_comercial": Sector.COMERCIAL.value,
    "step_8_encerramento": Sector.COMERCIAL.value,
}

STEP_SLA_HOURS: Dict[str, int] = {
    "step_1_abertura": 12,
    "step_2_expedicao": 4,
    "step_2_3_expedicao": 4,
    "step_3_producao": 36,
    "step_4_analise_tecnica": 36,
    "step_4_compras": 8,
    "step_4_1_escrituracao": 8,
    "step_5_sgi": 12,
    "step_5_sgi_qualidade": 12,
    "step_6_comercial": 12,
    "step_6_tratativa_comercial": 12,
    "step_7_financeiro": 12,
    "step_8_comercial": 12,
    "step_8_encerramento": 12,
}

DEFAULT_USERS = [
    {"username": "vendas01", "name": "Rafaela Pacheco", "sector": Sector.COMERCIAL.value, "role": "Vendedora Comercial"},
    {"username": "vendas02", "name": "Ingrid (Vendas 02)", "sector": Sector.COMERCIAL.value, "role": "Vendedora Comercial"},
    {"username": "vendas03", "name": "Fran (Vendas 03)", "sector": Sector.COMERCIAL.value, "role": "Vendedora Comercial"},
    {"username": "vendas04", "name": "Claudia (Vendas 04)", "sector": Sector.COMERCIAL.value, "role": "Vendedora Comercial"},
    {"username": "coord.comercial", "name": "Caroline Miranda", "sector": Sector.COMERCIAL.value, "role": "Coordenador Comercial"},
    {"username": "coord.expedicao", "name": "Carlos Marques", "sector": Sector.EXPEDICAO.value, "role": "Coordenador de Expedição"},
    {"username": "coord.estoque", "name": "Fabricio Felix", "sector": Sector.ESTOQUE_BENEFICIADO.value, "role": "Coordenador de Estoque"},
    {"username": "coord.pcp", "name": "Daniela Fernandes", "sector": Sector.PRODUCAO.value, "role": "Coordenador PCP"},
    {"username": "coord.beneficiamento", "name": "Talles Andrade", "sector": Sector.PRODUCAO.value, "role": "Coordenador Beneficiamento"},
    {"username": "coord.kit", "name": "Sueli Leite", "sector": Sector.PRODUCAO.value, "role": "Coordenador de Kits"},
    {"username": "coord.compras", "name": "Lucas Velame", "sector": Sector.COMPRAS.value, "role": "Coordenador de Compras"},
    {"username": "compras", "name": "Rosiane Maciel", "sector": Sector.COMPRAS.value, "role": "Comprador / Devoluções"},
    {"username": "coord.processos", "name": "Ricardo Vacilloto", "sector": Sector.SGI.value, "role": "Coordenadora de SGI e Qualidade"},
    {"username": "p.mariano", "name": "Priscila Mariano", "sector": Sector.FINANCEIRO.value, "role": "Gerência Financeira"},
    {"username": "ti01", "name": "Felipe Albuquerque", "sector": Sector.TI.value, "role": "Analista de Sistemas / TI"},
    {"username": "ti02", "name": "Felipe Pinete", "sector": Sector.TI.value, "role": "Analista de Sistemas / TI"},
    {"username": "gestor", "name": "Administração Central", "sector": Sector.GESTAO.value, "role": "Gestão Geral / TI"},
    {"username": "germano", "name": "Germano", "sector": Sector.DIRETORIA.value, "role": "Diretor"},
    {"username": "vinicius", "name": "Vinicius", "sector": Sector.DIRETORIA.value, "role": "Diretor"},
    {"username": "a.nogueira", "name": "Andre Nogueira", "sector": Sector.GERENCIA.value, "role": "Gerente de Operações"},
    {"username": "e.luchesi", "name": "Evaldo Luchesi", "sector": Sector.GERENCIA.value, "role": "Gerente Industrial"},
    {"username": "r.carvalho", "name": "Rodrigo Carvalho", "sector": Sector.GERENCIA.value, "role": "Gerente Comercial"},
    {"username": "l.reimberg", "name": "Laura Reimberg", "sector": Sector.GERENCIA.value, "role": "Gerente Administrativo"},
]

