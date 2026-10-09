"""
demo_data.py - Catalogo de Ocorrencias Industriais Realistas para o Modo Demonstracao
Contem cenarios padronizados cobrindo todas as etapas e casos de uso do SGI / ISO 9001.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any

def get_demo_occurrences() -> List[Dict[str, Any]]:
    now = datetime.now()
    t_minus_5d = (now - timedelta(days=5)).isoformat()
    t_minus_4d = (now - timedelta(days=4)).isoformat()
    t_minus_3d = (now - timedelta(days=3)).isoformat()
    t_minus_2d = (now - timedelta(days=2)).isoformat()
    t_minus_1d = (now - timedelta(days=1)).isoformat()
    t_now = now.isoformat()
    t_plus_24h = (now + timedelta(hours=24)).isoformat()
    t_plus_36h = (now + timedelta(hours=36)).isoformat()
    t_overdue = (now - timedelta(hours=14)).isoformat()

    return [
        # 1. CICLO COMPLETO CONCLUÍDO (ISO 9001 Homologado)
        {
            "protocol": "RNC-DEMO-0001",
            "current_step": "concluido",
            "current_sector": "concluido",
            "status": "concluido",
            "cliente": "Alfa Indústria de Autopeças S/A",
            "nota_fiscal": "NF-58201",
            "pedido_sankhya": "PED-9012",
            "produto_descricao": "Mancal Bipartido Usinado em Alumínio 6061-T6",
            "motivo_reclamacao": "Furo roscado M8 com profundidade insuficiente de 12mm em vez de 18mm conforme desenho de engenharia ENG-402.",
            "quantidade": 45.0,
            "tipo_material": "componente",
            "devolucao_autorizada": 1,
            "recebimento_data": t_minus_4d,
            "recebimento_volumes": 2,
            "recebimento_avaria_visivel": 0,
            "recebimento_obs": "Volumes íntegros conferidos na doca de recebimento. Embalagem original preservada.",
            "laudo_procedencia": "procedente",
            "laudo_defeito_tecnico": "Desgaste excessivo do macho de roscar na estação CNC-04 gerando rosca incompleta nos últimos 45 mancais do lote.",
            "laudo_destinacao": "retrabalho",
            "laudo_responsavel": "Supervisão de Usinagem",
            "laudo_data": t_minus_3d,
            "sgi_causa_raiz": "Ausência de controle estatístico de vida útil para ferramentas de usinagem com pastilha e macho.",
            "sgi_acao_corretiva": "Implantado plano de troca preventiva do macho a cada 400 ciclos com parada obrigatória do centro de usinagem.",
            "sgi_homologado_por": "Beatriz Cunha (SGI)",
            "sgi_liberado": 1,
            "sgi_observacoes": "Ação corretiva validada conforme requisito 8.7 e 10.2 da ISO 9001:2015.",
            "comercial_tratativa": "Retrabalho prioritário finalizado em 24h e entregue com laudo dimensional anexo.",
            "comercial_detalhes": "Cliente homologou a solução técnica e manteve o cronograma de montagem.",
            "comercial_concluido_por": "Mariana Costa",
            "comercial_fechamento_obs": "Cliente satisfeito com a resposta rápida e rastreabilidade total.",
            "financeiro_tipo_operacao": "Ressarcimento de Frete",
            "financeiro_valor": 380.0,
            "financeiro_concluido_por": "Gustavo Mendes",
            "financeiro_obs": "Crédito de frete compensado na duplicata 58201-B.",
            "financeiro_data": t_minus_1d,
            "sla_deadline": t_plus_36h,
            "criado_por": "Mariana Costa (Comercial)",
            "criado_em": t_minus_5d,
            "atualizado_em": t_minus_1d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Mancal Bipartido Usinado em Alumínio 6061-T6", "tipo_material": "componente", "quantidade": 45.0, "unidade_medida": "UN"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Mariana Costa", "created_at": t_minus_5d},
                {"step": "step_2_expedicao", "sector": "expedicao", "action": "Recebimento concluído (2 volumes). Encaminhado para a fila de USINAGEM.", "user_name": "Roberto Nogueira", "created_at": t_minus_4d},
                {"step": "step_3_producao", "sector": "producao", "action": "Laudo Técnico Concluído: PROCEDENTE (Retrabalho).", "user_name": "Andre Silveira", "created_at": t_minus_3d},
                {"step": "step_5_sgi", "sector": "sgi", "action": "Conclusão Técnica SGI Homologada com Ação Corretiva.", "user_name": "Beatriz Cunha", "created_at": t_minus_2d},
                {"step": "step_6_comercial", "sector": "comercial", "action": "Tratativa Comercial e Acordo com Cliente Aprovado.", "user_name": "Mariana Costa", "created_at": t_minus_2d},
                {"step": "step_7_financeiro", "sector": "financeiro", "action": "Tratativa Financeira Concluída. Valor: R$ 380.00.", "user_name": "Gustavo Mendes", "created_at": t_minus_1d},
                {"step": "step_8_encerramento", "sector": "comercial", "action": "RNC Encerrada e Baixada com Sucesso pelo Comercial.", "user_name": "Mariana Costa", "created_at": t_minus_1d}
            ]
        },

        # 2. PRODUÇÃO: ANÁLISE TÉCNICA E LAUDO EM ANDAMENTO
        {
            "protocol": "RNC-DEMO-0002",
            "current_step": "step_3_producao",
            "current_sector": "pintura",
            "status": "em_andamento",
            "cliente": "Vanguard Engenharia de Fachadas",
            "nota_fiscal": "NF-58340",
            "pedido_sankhya": "PED-9145",
            "produto_descricao": "Perfis de Alumínio Pintura Eletrostática Preto Fosco RAL 9005",
            "motivo_reclamacao": "Descascamento prematuro de camada de tinta e microbolhas após teste de corte em grade.",
            "quantidade": 120.0,
            "tipo_material": "perfil",
            "devolucao_autorizada": 1,
            "recebimento_data": t_minus_1d,
            "recebimento_volumes": 4,
            "recebimento_avaria_visivel": 0,
            "recebimento_obs": "Material descarregado na doca 2. Amarrados conferidos e sem danos externos de frete.",
            "setor_encaminhado": "pintura",
            "sla_deadline": t_plus_24h,
            "criado_por": "Analista Comercial",
            "criado_em": t_minus_2d,
            "atualizado_em": t_minus_1d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=2)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Perfil Alumínio Estrutural Preto Fosco 6.0m", "tipo_material": "perfil", "quantidade": 120.0, "unidade_medida": "M"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Analista Comercial", "created_at": t_minus_2d},
                {"step": "step_2_expedicao", "sector": "expedicao", "action": "Recebimento concluído (4 volumes). Encaminhado para PINTURA.", "user_name": "Roberto Nogueira", "created_at": t_minus_1d}
            ]
        },

        # 3. PRODUÇÃO: SLA ATRASADO (ALERTA VERMELHO CRÍTICO NO BI)
        {
            "protocol": "RNC-DEMO-0003",
            "current_step": "step_3_producao",
            "current_sector": "estoque_beneficiado",
            "status": "em_andamento",
            "cliente": "Construtora Monte Sião Ltda",
            "nota_fiscal": "NF-57990",
            "pedido_sankhya": "PED-8890",
            "produto_descricao": "Vidros Temperados Incolores 10mm Lapidação Reta 1200x800mm",
            "motivo_reclamacao": "Empeno térmico acima da tolerância da norma NBR 14698 impedindo encaixe no caixilho.",
            "quantidade": 18.0,
            "tipo_material": "perfil",
            "devolucao_autorizada": 1,
            "recebimento_data": t_minus_3d,
            "recebimento_volumes": 1,
            "recebimento_avaria_visivel": 0,
            "recebimento_obs": "Cavalete de vidro descarregado com integridade física preservada.",
            "setor_encaminhado": "estoque_beneficiado",
            "sla_deadline": t_overdue,
            "criado_por": "Mariana Costa",
            "criado_em": t_minus_4d,
            "atualizado_em": t_minus_3d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=4)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Vidro Temperado Incolor 10mm Lapidado", "tipo_material": "perfil", "quantidade": 18.0, "unidade_medida": "PC"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Mariana Costa", "created_at": t_minus_4d},
                {"step": "step_2_expedicao", "sector": "expedicao", "action": "Recebimento concluído (1 volume). Encaminhado para ESTOQUE BENEFICIADO.", "user_name": "Roberto Nogueira", "created_at": t_minus_3d}
            ]
        },

        # 4. COMPRAS: FLUXO DE FORNECEDOR / CRÉDITO
        {
            "protocol": "RNC-DEMO-0004",
            "current_step": "step_4_compras",
            "current_sector": "compras",
            "status": "em_andamento",
            "cliente": "Nexus Indústria Metalúrgica",
            "nota_fiscal": "NF-58410",
            "pedido_sankhya": "PED-9180",
            "produto_descricao": "Tarugos de Zamac Injetado Liga 5",
            "motivo_reclamacao": "Porosidade interna excessiva constatada durante etapa de usinagem e fragilidade mecânica.",
            "quantidade": 500.0,
            "tipo_material": "componente",
            "devolucao_autorizada": 0,
            "tipo_fluxo": "financeiro",
            "tipo_rnc": "Fornecedor",
            "sla_deadline": t_plus_36h,
            "criado_por": "Analista Comercial",
            "criado_em": t_minus_2d,
            "atualizado_em": t_minus_2d,
            "data_reclamacao": (now - timedelta(days=2)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Tarugos de Zamac Injetado Liga 5", "tipo_material": "componente", "quantidade": 500.0, "unidade_medida": "KG"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC (Fluxo de Crédito / Fornecedor) - Encaminhada para Compras", "user_name": "Analista Comercial", "created_at": t_minus_2d}
            ]
        },

        # 5. SGI: ANÁLISE DE CAUSA RAIZ E 5 PORQUÊS
        {
            "protocol": "RNC-DEMO-0005",
            "current_step": "step_5_sgi",
            "current_sector": "sgi",
            "status": "em_andamento",
            "cliente": "Delta Esquadrias & Vidros",
            "nota_fiscal": "NF-58455",
            "pedido_sankhya": "PED-9220",
            "produto_descricao": "Conjunto Roldana Dupla Blindada em Aço Inox",
            "motivo_reclamacao": "Travamento irregular da roldana sob carga dinâmica de 60kg em ensaio mecânico.",
            "quantidade": 80.0,
            "tipo_material": "acessorio",
            "devolucao_autorizada": 1,
            "recebimento_data": t_minus_3d,
            "recebimento_volumes": 3,
            "recebimento_avaria_visivel": 0,
            "recebimento_obs": "3 caixas lacradas recebidas sem avarias de transporte.",
            "laudo_procedencia": "procedente",
            "laudo_defeito_tecnico": "Prensagem do rolamento com folga axial reduzida causando fricção interna nas esferas.",
            "laudo_destinacao": "sucata",
            "laudo_responsavel": "Andre Silveira (Produção)",
            "laudo_data": t_minus_1d,
            "sla_deadline": t_plus_24h,
            "criado_por": "Mariana Costa",
            "criado_em": t_minus_4d,
            "atualizado_em": t_minus_1d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=4)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Roldana Dupla Blindada Aço Inox 40mm", "tipo_material": "acessorio", "quantidade": 80.0, "unidade_medida": "CJ"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Mariana Costa", "created_at": t_minus_4d},
                {"step": "step_2_expedicao", "sector": "expedicao", "action": "Recebimento concluído (3 volumes). Encaminhado para ESTOQUE ACESSÓRIOS.", "user_name": "Roberto Nogueira", "created_at": t_minus_3d},
                {"step": "step_3_producao", "sector": "producao", "action": "Laudo Técnico Concluído: PROCEDENTE (Sucata).", "user_name": "Andre Silveira", "created_at": t_minus_1d}
            ]
        },

        # 6. COMERCIAL: VALIDAÇÃO DE PROPOSTA COM CLIENTE
        {
            "protocol": "RNC-DEMO-0006",
            "current_step": "step_6_comercial",
            "current_sector": "comercial",
            "status": "em_andamento",
            "cliente": "Orion Estruturas Modulares",
            "nota_fiscal": "NF-58500",
            "pedido_sankhya": "PED-9304",
            "produto_descricao": "Braços Articulados em Aço Inox 304 Escovado",
            "motivo_reclamacao": "Manchas superficiais após instalação em ambiente litorâneo.",
            "quantidade": 25.0,
            "tipo_material": "acessorio",
            "devolucao_autorizada": 1,
            "recebimento_data": t_minus_3d,
            "recebimento_volumes": 1,
            "recebimento_avaria_visivel": 0,
            "recebimento_obs": "Recebido e conferido sem danos de frete.",
            "laudo_procedencia": "procedente",
            "laudo_defeito_tecnico": "Contaminação por fagulhas ferrosas no processo de polimento anterior.",
            "laudo_destinacao": "retrabalho",
            "laudo_responsavel": "Supervisão Industrial",
            "laudo_data": t_minus_2d,
            "sgi_causa_raiz": "Armazenamento provisório adjacente à célula de corte de aço carbono.",
            "sgi_acao_corretiva": "Segregação física da bancada de polimento de inox.",
            "sgi_homologado_por": "Beatriz Cunha",
            "sgi_liberado": 1,
            "sla_deadline": t_plus_36h,
            "criado_por": "Coordenação Comercial",
            "criado_em": t_minus_4d,
            "atualizado_em": t_minus_1d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=4)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Braço Articulado Aço Inox 304 Escovado", "tipo_material": "acessorio", "quantidade": 25.0, "unidade_medida": "UN"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Coordenação Comercial", "created_at": t_minus_4d},
                {"step": "step_2_expedicao", "sector": "expedicao", "action": "Recebimento concluído (1 volume). Encaminhado para POLIMENTO.", "user_name": "Roberto Nogueira", "created_at": t_minus_3d},
                {"step": "step_3_producao", "sector": "producao", "action": "Laudo Técnico Concluído: PROCEDENTE (Retrabalho).", "user_name": "Supervisão Industrial", "created_at": t_minus_2d},
                {"step": "step_5_sgi", "sector": "sgi", "action": "Conclusão Técnica SGI Homologada.", "user_name": "Beatriz Cunha", "created_at": t_minus_1d}
            ]
        },

        # 7. FINANCEIRO: AGUARDANDO EMISSÃO DE CRÉDITO
        {
            "protocol": "RNC-DEMO-0007",
            "current_step": "step_7_financeiro",
            "current_sector": "financeiro",
            "status": "em_andamento",
            "cliente": "Prime Glass Arquitetura & Interiores",
            "nota_fiscal": "NF-58190",
            "pedido_sankhya": "PED-8980",
            "produto_descricao": "Perfis Tubulares Anodizado Bronze 1002",
            "motivo_reclamacao": "Divergência de tonalidade anódica entre perfis do mesmo lote.",
            "quantidade": 36.0,
            "tipo_material": "perfil",
            "devolucao_autorizada": 1,
            "recebimento_data": t_minus_4d,
            "recebimento_volumes": 2,
            "recebimento_avaria_visivel": 0,
            "laudo_procedencia": "procedente",
            "laudo_defeito_tecnico": "Tempo insuficiente de imersão no tanque de coloração eletrolítica.",
            "laudo_destinacao": "sucata",
            "laudo_responsavel": "Andre Silveira",
            "laudo_data": t_minus_3d,
            "sgi_causa_raiz": "Variação na densidade de corrente durante o turno noturno.",
            "sgi_acao_corretiva": "Instalação de sensor de telemetria contínua no retificador anódico.",
            "sgi_homologado_por": "Beatriz Cunha",
            "sgi_liberado": 1,
            "comercial_tratativa": "Devolução total autorizada com nota de crédito integral ao cliente.",
            "comercial_detalhes": "Cliente aceitou crédito para utilização no próximo pedido com faturamento em 30 dias.",
            "financeiro_valor": 4250.0,
            "sla_deadline": t_plus_24h,
            "criado_por": "Mariana Costa",
            "criado_em": t_minus_5d,
            "atualizado_em": t_minus_1d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Tubo Retangular Anodizado Bronze 1002 6m", "tipo_material": "perfil", "quantidade": 36.0, "unidade_medida": "M"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Mariana Costa", "created_at": t_minus_5d},
                {"step": "step_2_expedicao", "sector": "expedicao", "action": "Recebimento concluído (2 volumes).", "user_name": "Roberto Nogueira", "created_at": t_minus_4d},
                {"step": "step_3_producao", "sector": "producao", "action": "Laudo Técnico Concluído: PROCEDENTE (Sucata).", "user_name": "Andre Silveira", "created_at": t_minus_3d},
                {"step": "step_5_sgi", "sector": "sgi", "action": "Conclusão Técnica SGI Homologada.", "user_name": "Beatriz Cunha", "created_at": t_minus_2d},
                {"step": "step_6_comercial", "sector": "comercial", "action": "Acordo Comercial com Cliente: Devolução Total com Crédito.", "user_name": "Mariana Costa", "created_at": t_minus_1d}
            ]
        },

        # 8. EXPEDIÇÃO: AGUARDANDO TRIAGEM FÍSICA
        {
            "protocol": "RNC-DEMO-0008",
            "current_step": "step_2_expedicao",
            "current_sector": "expedicao",
            "status": "em_andamento",
            "cliente": "Kronos Montagens Industriais",
            "nota_fiscal": "NF-58610",
            "pedido_sankhya": "PED-9450",
            "produto_descricao": "Chapas Dobradas de Aço Carbono com Furação a Laser",
            "motivo_reclamacao": "Divergência de coordenadas nos furos oblongos em relação ao desenho de projeto.",
            "quantidade": 60.0,
            "tipo_material": "componente",
            "devolucao_autorizada": 1,
            "sla_deadline": t_plus_36h,
            "criado_por": "Analista Comercial",
            "criado_em": t_minus_1d,
            "atualizado_em": t_minus_1d,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Chapa Dobrada Aço Carbono 3mm Perfurada", "tipo_material": "componente", "quantidade": 60.0, "unidade_medida": "UN"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de RNC e Envio para Expedição", "user_name": "Analista Comercial", "created_at": t_minus_1d}
            ]
        },

        # 9. ABERTURA: TRIAGEM COMERCIAL INICIAL
        {
            "protocol": "RNC-DEMO-0009",
            "current_step": "step_1_abertura",
            "current_sector": "comercial",
            "status": "em_andamento",
            "cliente": "Soluções Térmicas Brasil Ltda",
            "nota_fiscal": "NF-58670",
            "pedido_sankhya": "PED-9510",
            "produto_descricao": "Guarnições de EPDM Preto para Vedação de Fachadas",
            "motivo_reclamacao": "Dureza Shore A divergente da especificação (especificado 70 Shore, entregue 55 Shore).",
            "quantidade": 200.0,
            "tipo_material": "acessorio",
            "devolucao_autorizada": 1,
            "sla_deadline": t_plus_36h,
            "criado_por": "Mariana Costa",
            "criado_em": t_now,
            "atualizado_em": t_now,
            "tipo_fluxo": "padrao",
            "tipo_rnc": "Cliente",
            "data_reclamacao": now.strftime("%Y-%m-%d"),
            "itens": [
                {"produto_descricao": "Perfil Vedação Borracha EPDM 200m", "tipo_material": "acessorio", "quantidade": 200.0, "unidade_medida": "M"}
            ],
            "history": [
                {"step": "step_1_abertura", "sector": "comercial", "action": "Abertura de Ocorrência Técnica pelo Comercial", "user_name": "Mariana Costa", "created_at": t_now}
            ]
        }
    ]
