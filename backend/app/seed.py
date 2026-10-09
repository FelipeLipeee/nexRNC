import os
from datetime import datetime, timedelta
from .database import get_connection, init_db
from .models import RncStep, Sector

def seed_database():
    init_db()
    # Permitir base limpa para testes reais em producao (nao recriar exemplos apos reset)
    if os.getenv("SEED_SAMPLE_RNCS", "false").lower() not in ("true", "1", "yes"):
        return

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as c FROM rncs")
        row = cursor.fetchone()
        count = row[0] if isinstance(row, tuple) else (row["c"] if row else 0)
        if count > 0:
            conn.close()
            return
    except Exception as e:
        print(f"[WARN] Database seed check deferred: {e}")
        return

    now = datetime.now()
    sample_records = [
        {
            "protocol": "RNC-2026-0001",
            "current_step": RncStep.STEP_2_3_EXPEDICAO.value,
            "current_sector": Sector.EXPEDICAO.value,
            "status": "em_andamento",
            "cliente": "Distribuidora Beta de Vidros Ltda",
            "nota_fiscal": "104820",
            "pedido_sankhya": "84920",
            "produto_descricao": "Perfil Alumínio Guia Superior 6m - Branco",
            "motivo_reclamacao": "Material entregue com empenamento lateral e riscos na pintura eletrostática.",
            "quantidade": 12.0,
            "tipo_material": "perfil",
            "devolucao_autorizada": 1,
            "sla_deadline": (now + timedelta(hours=3)).isoformat(),
            "criado_por": "Mariana Costa",
            "criado_em": (now - timedelta(hours=1)).isoformat(),
            "atualizado_em": (now - timedelta(hours=1)).isoformat(),
            "history": [
                ("step_1_abertura", "comercial", "Abertura de RNC e Envio para Expedição", "Mariana Costa", "Reclamação do cliente registrada com fotos.")
            ]
        },
        {
            "protocol": "RNC-2026-0002",
            "current_step": RncStep.STEP_4_ANALISE_TECNICA.value,
            "current_sector": Sector.PRODUCAO.value,
            "status": "em_andamento",
            "cliente": "Esquadrias & Vidros Modelo ME",
            "nota_fiscal": "104711",
            "pedido_sankhya": "84815",
            "produto_descricao": "Kit Box Elegance 8mm - Preto Fosco",
            "motivo_reclamacao": "Roldana com rolamento travado e rosca espanada na presilha inferior.",
            "quantidade": 4.0,
            "tipo_material": "kit",
            "devolucao_autorizada": 1,
            "recebimento_data": (now - timedelta(hours=6)).isoformat(),
            "recebimento_volumes": 2,
            "recebimento_avaria_visivel": 0,
            "recebimento_obs": "Material recebido íntegro e encaminhado para bancada técnica de kits.",
            "sla_deadline": (now + timedelta(hours=30)).isoformat(),
            "criado_por": "Mariana Costa",
            "criado_em": (now - timedelta(hours=10)).isoformat(),
            "atualizado_em": (now - timedelta(hours=6)).isoformat(),
            "history": [
                ("step_1_abertura", "comercial", "Abertura de RNC e Envio para Expedição", "Mariana Costa", "Cliente solicitou troca imediata."),
                ("step_2_3_expedicao", "expedicao", "Recebido e direcionado para Análise Técnica", "Roberto Nogueira", "Segregado na quarentena setor B.")
            ]
        },
        {
            "protocol": "RNC-2026-0003",
            "current_step": RncStep.STEP_4_1_ESCRITURACAO.value,
            "current_sector": Sector.FISCAL.value,
            "status": "em_andamento",
            "cliente": "Alumínios e Fachadas Alvorada Ltda",
            "nota_fiscal": "104650",
            "pedido_sankhya": "84700",
            "produto_descricao": "Fechadura para Vidro Alvenaria 1520 - Cromada",
            "motivo_reclamacao": "Cilindro com folga excessiva impedindo o giro suave da chave.",
            "quantidade": 15.0,
            "tipo_material": "acessorio",
            "devolucao_autorizada": 1,
            "laudo_procedencia": "procedente",
            "laudo_defeito_tecnico": "Defeito de usinagem no miolo interno do tambor.",
            "laudo_destinacao": "devolucao_fornecedor",
            "laudo_responsavel": "André Silveira",
            "laudo_data": (now - timedelta(hours=2)).isoformat(),
            "sla_deadline": (now + timedelta(hours=2)).isoformat(),
            "criado_por": "Mariana Costa",
            "criado_em": (now - timedelta(hours=24)).isoformat(),
            "atualizado_em": (now - timedelta(hours=2)).isoformat(),
            "history": [
                ("step_1_abertura", "comercial", "Abertura de RNC", "Mariana Costa", "Reclamação em garantia."),
                ("step_2_3_expedicao", "expedicao", "Material recebido", "Roberto Nogueira", "1 caixa recebida."),
                ("step_4_analise_tecnica", "producao", "Laudo procedente", "André Silveira", "Lote com folga no miolo.")
            ]
        },
        {
            "protocol": "RNC-2026-0004",
            "current_step": RncStep.STEP_6_TRATATIVA_COMERCIAL.value,
            "current_sector": Sector.COMERCIAL.value,
            "status": "em_andamento",
            "cliente": "Comércio de Perfis Horizonte S.A.",
            "nota_fiscal": "104500",
            "pedido_sankhya": "84550",
            "produto_descricao": "Tubo Trilho Superior Redondo 3m - Inox Escovado",
            "motivo_reclamacao": "Manchas escuras no acabamento e medida 5mm menor que o pedido.",
            "quantidade": 6.0,
            "tipo_material": "perfil",
            "devolucao_autorizada": 1,
            "laudo_procedencia": "procedente",
            "laudo_defeito_tecnico": "Erro de corte na serra fita e contaminação na esteira de polimento.",
            "laudo_destinacao": "sucata",
            "fiscal_nf_devolucao": "009841",
            "sgi_causa_raiz": "Batente da serra desalinhado no corte do lote 41.",
            "sgi_acao_corretiva": "Calibração mecânica semanal obrigatória e descarte das peças avariadas.",
            "sgi_homologado_por": "Beatriz Cunha",
            "sla_deadline": (now + timedelta(hours=8)).isoformat(),
            "criado_por": "Mariana Costa",
            "criado_em": (now - timedelta(hours=36)).isoformat(),
            "atualizado_em": (now - timedelta(hours=1)).isoformat(),
            "history": [
                ("step_1_abertura", "comercial", "Abertura de RNC", "Mariana Costa", "Cliente solicitou reposição em garantia."),
                ("step_2_3_expedicao", "expedicao", "Material recebido", "Roberto Nogueira", "Descarga realizada."),
                ("step_4_analise_tecnica", "producao", "Laudo Procedente", "André Silveira", "Peças sem condições de retrabalho."),
                ("step_4_1_escrituracao", "fiscal", "NF 009841 Escriturada", "Thiago Rocha", "Entrada fiscal efetuada."),
                ("step_5_sgi_qualidade", "sgi", "Homologado pelo SGI", "Beatriz Cunha", "Ação corretiva validada.")
            ]
        }
    ]

    for r in sample_records:
        history = r.pop("history")
        cols = ", ".join(r.keys())
        placeholders = ", ".join(["?"] * len(r))
        cursor.execute(f"INSERT INTO rncs ({cols}) VALUES ({placeholders})", list(r.values()))
        
        cursor.execute("SELECT id FROM rncs WHERE protocol = ?", (r["protocol"],))
        id_row = cursor.fetchone()
        rnc_id = id_row[0] if id_row else cursor.lastrowid

        for h in history:
            cursor.execute("""
            INSERT INTO rnc_history (rnc_id, step, sector, action, user_name, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (rnc_id, h[0], h[1], h[2], h[3], h[4], r["atualizado_em"]))

    try:
        conn.commit()
    except Exception:
        pass

    conn.close()
