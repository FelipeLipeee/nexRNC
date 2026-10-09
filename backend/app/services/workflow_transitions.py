import json
from datetime import datetime
from typing import Dict, Any, Tuple
from ..models import RncStep, Sector
from .sla_helper import calculate_sla_deadline

def execute_step_transition(
    current: Dict[str, Any],
    payload: Dict[str, Any],
    user_name: str,
    now: str
) -> Tuple[Dict[str, Any], str, str, str]:
    """
    Executa a regra de negócio da transição de etapa do SGI.
    Retorna: (fields_to_update, next_step, next_sector, action_desc)
    """
    fields_to_update: Dict[str, Any] = {"atualizado_em": now}
    current_step = current["current_step"]
    is_flex = bool(current.get("fluxo_flexivel"))
    notes = payload.get("notes", "")

    # ETAPA 1: Comercial (Revisão / Reencaminhamento após retorno)
    if current_step in (RncStep.STEP_1_ABERTURA.value, "step_1_comercial"):
        is_financeiro = (current.get("tipo_fluxo") == "financeiro") or (not current.get("devolucao_autorizada", True))
        obs_revisao = payload.get("observacoes") or payload.get("obs_comercial_revisao") or "RNC revisada e reencaminhada pelo Comercial."
        if payload.get("motivo_reclamacao"):
            fields_to_update["motivo_reclamacao"] = payload["motivo_reclamacao"]
        if is_financeiro:
            next_step = RncStep.STEP_4_COMPRAS.value
            next_sector = Sector.COMPRAS.value
            fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_4_COMPRAS.value)
            action_desc = f"RNC revisada e reencaminhada para Compras (Fluxo de Crédito). Obs: {obs_revisao}"
        else:
            next_step = RncStep.STEP_2_EXPEDICAO.value
            next_sector = Sector.EXPEDICAO.value
            fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_2_EXPEDICAO.value)
            action_desc = f"RNC revisada e reencaminhada para Expedição. Obs: {obs_revisao}"

    # ETAPA 2: Expedicao -> Encaminha para o subsetor de Producao
    elif current_step in (RncStep.STEP_2_EXPEDICAO.value, "step_2_3_expedicao"):
        vols = payload.get("recebimento_volumes") or payload.get("volumes") or 1
        avaria = 1 if (payload.get("recebimento_avaria_visivel") or payload.get("avaria_frete")) else 0
        default_obs = "Dispensado recebimento físico (Trâmite flexível)" if is_flex else ""
        obs = payload.get("recebimento_obs") or payload.get("obs_expedicao") or payload.get("notes") or default_obs
        
        # Setor fabril de destino (Pintura, Kit, Estoque Beneficiado, etc.)
        setor_enc = payload.get("setor_encaminhado") or "estoque_beneficiado"
        
        fields_to_update["recebimento_data"] = now
        fields_to_update["recebimento_volumes"] = int(vols)
        fields_to_update["recebimento_avaria_visivel"] = avaria
        fields_to_update["recebimento_obs"] = obs
        fields_to_update["setor_encaminhado"] = setor_enc
        
        next_step = RncStep.STEP_3_PRODUCAO.value
        next_sector = setor_enc
        fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_3_PRODUCAO.value)
        action_desc = f"Recebimento concluído ({vols} volumes). Encaminhado para a fila de {setor_enc.upper()}."

    # ETAPA 3: Producao -> Inspecao com multiplos defeitos + Causa Raiz e Acao Corretiva
    elif current_step in (RncStep.STEP_3_PRODUCAO.value, "step_4_analise_tecnica"):
        proc = "procedente" if payload.get("procedente", True) else "improcedente"
        def_tec = payload.get("laudo_defeito_tecnico") or payload.get("defeito_tecnico") or ""
        dest = payload.get("laudo_destinacao") or payload.get("destinacao") or "retrabalho"
        
        itens_insp = payload.get("itens_inspecionados") or []
        causa_r = payload.get("causa_raiz") or payload.get("sgi_causa_raiz") or ""
        acao_c = payload.get("acao_corretiva") or payload.get("sgi_acao_corretiva") or ""
        
        fields_to_update["laudo_procedencia"] = proc
        fields_to_update["laudo_defeito_tecnico"] = def_tec
        fields_to_update["laudo_destinacao"] = dest
        fields_to_update["laudo_responsavel"] = user_name
        fields_to_update["laudo_data"] = now
        fields_to_update["producao_itens_json"] = json.dumps(itens_insp)
        fields_to_update["sgi_causa_raiz"] = causa_r
        fields_to_update["sgi_acao_corretiva"] = acao_c
        
        next_step = RncStep.STEP_4_COMPRAS.value
        next_sector = Sector.COMPRAS.value
        fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_4_COMPRAS.value)
        action_desc = f"Análise técnica e causa raiz registradas pela produção. Encaminhado para Compras."

    # ETAPA 4: Compras (Antigo Fiscal) -> Emissao da Devolucao
    elif current_step in (RncStep.STEP_4_COMPRAS.value, "step_4_1_escrituracao"):
        nf_dev = payload.get("compras_nf_devolucao") or payload.get("nf_devolucao") or payload.get("fiscal_nf_devolucao") or "Pendente"
        obs_compras = payload.get("observacoes") or ""
        fields_to_update["compras_nf_devolucao"] = nf_dev
        fields_to_update["fiscal_nf_devolucao"] = nf_dev
        fields_to_update["compras_data"] = now
        
        is_financeiro = (current.get("tipo_fluxo") == "financeiro") or (not current.get("devolucao_autorizada", True))
        if is_financeiro:
            next_step = RncStep.STEP_7_FINANCEIRO.value
            next_sector = Sector.FINANCEIRO.value
            fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_7_FINANCEIRO.value)
            action_desc = f"Devolução/Ajuste processado por Compras (NF/Ref: {nf_dev}). Encaminhado diretamente ao Financeiro (Fluxo de Crédito)."
        else:
            next_step = RncStep.STEP_5_SGI.value
            next_sector = Sector.SGI.value
            fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_5_SGI.value)
            action_desc = f"Devolução processada por Compras (NF {nf_dev}). Encaminhado ao SGI para conclusão técnica."

    # ETAPA 5: SGI -> Conclusao Tecnica e Liberacao
    elif current_step in (RncStep.STEP_5_SGI.value, "step_5_sgi_qualidade"):
        liberado = 1 if payload.get("liberado", True) else 0
        obs_sgi = payload.get("observacoes") or payload.get("sgi_observacoes") or ""
        fields_to_update["sgi_liberado"] = liberado
        fields_to_update["sgi_observacoes"] = obs_sgi
        fields_to_update["sgi_homologado_por"] = user_name
        
        next_step = RncStep.STEP_6_COMERCIAL.value
        next_sector = Sector.COMERCIAL.value
        fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_6_COMERCIAL.value)
        status_txt = "Liberado" if liberado else "Com Ressalvas"
        action_desc = f"Parecer e Conclusão Técnica do SGI ({status_txt}). Encaminhado ao Comercial para tratativa final."

    # ETAPA 6: Comercial -> Tratativa Final com Cliente
    elif current_step in (RncStep.STEP_6_COMERCIAL.value, "step_6_tratativa_comercial"):
        trat = payload.get("comercial_tratativa") or payload.get("tratativa") or "sem_custo"
        det = payload.get("comercial_detalhes") or payload.get("detalhes_acordo") or ""
        fields_to_update["comercial_tratativa"] = trat
        fields_to_update["comercial_detalhes"] = det
        
        # Toda RNC tratada pelo Comercial segue obrigatoriamente para a Etapa 7: Financeiro (Priscila Mariano)
        next_step = RncStep.STEP_7_FINANCEIRO.value
        next_sector = Sector.FINANCEIRO.value
        fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_7_FINANCEIRO.value)
        action_desc = f"Tratativa comercial definida ({trat}). Encaminhado ao Financeiro (Priscila Mariano) para tratativa financeira."

    # ETAPA 7: Financeiro -> Tratativa Financeira e Retorno ao Comercial
    elif current_step == RncStep.STEP_7_FINANCEIRO.value:
        t_op = payload.get("financeiro_tipo_operacao") or payload.get("tipo_operacao") or "credito_futuro"
        val = float(payload.get("financeiro_valor") or payload.get("valor") or 0.0)
        obs_fin = payload.get("financeiro_obs") or payload.get("observacoes") or ""
        
        fields_to_update["financeiro_tipo_operacao"] = t_op
        fields_to_update["financeiro_valor"] = val
        fields_to_update["financeiro_obs"] = obs_fin
        fields_to_update["financeiro_concluido_por"] = user_name
        fields_to_update["financeiro_data"] = now
        
        # O Financeiro trata a ocorrência e devolve ao Comercial para a conferência e fechamento final
        next_step = RncStep.STEP_8_COMERCIAL.value
        next_sector = Sector.COMERCIAL.value
        fields_to_update["sla_deadline"] = calculate_sla_deadline(RncStep.STEP_8_COMERCIAL.value)
        action_desc = f"Tratativa financeira formalizada ({t_op} - R$ {val:.2f}). Devolvido ao Comercial para validação final e encerramento."

    # ETAPA 8: Comercial -> Validação Final e Encerramento Definitivo
    elif current_step in (RncStep.STEP_8_COMERCIAL.value, "step_8_encerramento"):
        fechamento_obs = payload.get("comercial_fechamento_obs") or payload.get("observacoes") or "Tratativa final formalizada com o cliente."
        fields_to_update["comercial_fechamento_obs"] = fechamento_obs
        fields_to_update["comercial_concluido_por"] = user_name
        fields_to_update["status"] = "concluido"
        next_step = RncStep.CONCLUIDO.value
        next_sector = Sector.COMERCIAL.value
        action_desc = f"RNC validada e encerrada definitivamente pelo Comercial ({user_name}). Processo Concluído."

    else:
        next_step = current_step
        next_sector = current["current_sector"]
        action_desc = "Atualização de dados operacionais"

    return fields_to_update, next_step, next_sector, action_desc

PREVIOUS_STEP_MAP: Dict[str, Tuple[str, str]] = {
    "step_2_expedicao": ("step_1_abertura", "comercial"),
    "step_2_3_expedicao": ("step_1_abertura", "comercial"),
    "step_3_producao": ("step_2_expedicao", "expedicao"),
    "step_4_analise_tecnica": ("step_2_expedicao", "expedicao"),
    "step_4_compras": ("step_3_producao", "producao"),
    "step_4_1_escrituracao": ("step_3_producao", "producao"),
    "step_5_sgi": ("step_4_compras", "compras"),
    "step_5_sgi_qualidade": ("step_4_compras", "compras"),
    "step_6_comercial": ("step_5_sgi", "sgi"),
    "step_6_tratativa_comercial": ("step_5_sgi", "sgi"),
    "step_7_financeiro": ("step_6_comercial", "comercial"),
    "step_8_comercial": ("step_7_financeiro", "financeiro"),
    "step_8_encerramento": ("step_7_financeiro", "financeiro"),
}

def execute_return_step(
    current: Dict[str, Any],
    motivo: str,
    user_name: str,
    now: str
) -> Tuple[Dict[str, Any], str, str, str]:
    """
    Executa a regra de negócio de retorno de etapa.
    Retorna: (fields_to_update, prev_step, prev_sector, action_desc)
    """
    current_step = current["current_step"]
    is_fin = (current.get("tipo_fluxo") == "financeiro") or (not current.get("devolucao_autorizada", True))

    if current_step in ("step_1_abertura", "step_1_comercial"):
        raise ValueError("Não é possível retornar a etapa inicial de Abertura.")

    if is_fin and current_step == "step_4_compras":
        prev_step, prev_sector = "step_1_abertura", "comercial"
    elif is_fin and current_step == "step_7_financeiro":
        prev_step, prev_sector = "step_4_compras", "compras"
    elif current_step in PREVIOUS_STEP_MAP:
        prev_step, prev_sector = PREVIOUS_STEP_MAP[current_step]
    else:
        raise ValueError(f"Etapa {current_step} não suporta retorno.")

    # Se retornou para a producao, restaura o subsetor original caso exista
    if prev_step == "step_3_producao" and current.get("setor_encaminhado"):
        prev_sector = current["setor_encaminhado"]

    fields_to_update: Dict[str, Any] = {
        "atualizado_em": now,
        "sla_deadline": calculate_sla_deadline(prev_step),
    }

    action_desc = f"Retorno de Etapa: Devolvido para {prev_sector.upper()}. Motivo: {motivo}"
    return fields_to_update, prev_step, prev_sector, action_desc
