"""
demo_service.py - Servico de Gerenciamento do Modo Demonstracao Industrial (Sandbox)
Permite semear 1-clique com ocorrencias industriais realistas cobrindo todas as etapas
e limpar a base com seguranca mantendo os usuarios operacionais intactos.
"""

import json
from typing import Dict, Any, List
from ..database import (
    get_connection,
    detect_db_mode,
    get_rnc_table,
    get_item_table,
    get_history_table,
    row_to_dict,
    init_db
)
from .demo_data import get_demo_occurrences
from .user_sync import sync_official_users

class DemoService:
    @staticmethod
    def get_status() -> Dict[str, Any]:
        """Retorna o status atual dos dados no banco (total de RNCs e contagem de demo)."""
        init_db()
        conn = get_connection()
        cursor = conn.cursor()
        rnc_table = get_rnc_table()
        
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {rnc_table}")
            row = cursor.fetchone()
            total = row[0] if row else 0
            
            cursor.execute(f"SELECT COUNT(*) FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%'")
            row_demo = cursor.fetchone()
            demo_count = row_demo[0] if row_demo else 0
            
            return {
                "total_rncs": total,
                "demo_rncs": demo_count,
                "is_demo_active": demo_count > 0,
                "db_mode": detect_db_mode()
            }
        finally:
            conn.close()

    @staticmethod
    def seed_demo_data(clear_existing: bool = True) -> Dict[str, Any]:
        """Semeia o banco com o catalogo industrial de demonstracao."""
        init_db()
        # Garante que os usuarios do sistema estejam presentes
        sync_official_users()

        conn = get_connection()
        cursor = conn.cursor()
        rnc_table = get_rnc_table()
        item_table = get_item_table()
        history_table = get_history_table()
        db_mode = detect_db_mode()

        try:
            if clear_existing:
                # Remove registros de demo anteriores ou limpa base
                cursor.execute(f"DELETE FROM {item_table} WHERE rnc_id IN (SELECT id FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%')")
                cursor.execute(f"DELETE FROM {history_table} WHERE rnc_id IN (SELECT id FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%')")
                cursor.execute(f"DELETE FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%'")

            demos = get_demo_occurrences()
            inserted_count = 0

            for d in demos:
                # 1. Insercao na tabela principal de ocorrencias
                cursor.execute(f"""
                INSERT INTO {rnc_table} (
                    protocol, current_step, current_sector, status, cliente,
                    nota_fiscal, pedido_sankhya, produto_descricao, motivo_reclamacao,
                    quantidade, tipo_material, devolucao_autorizada, recebimento_data,
                    recebimento_volumes, recebimento_avaria_visivel, recebimento_obs,
                    laudo_procedencia, laudo_defeito_tecnico, laudo_destinacao,
                    laudo_responsavel, laudo_data, sgi_causa_raiz, sgi_acao_corretiva,
                    sgi_homologado_por, sgi_liberado, sgi_observacoes, comercial_tratativa,
                    comercial_detalhes, comercial_concluido_por, comercial_fechamento_obs,
                    financeiro_tipo_operacao, financeiro_valor, financeiro_concluido_por,
                    financeiro_obs, financeiro_data, sla_deadline, criado_por,
                    criado_em, atualizado_em, tipo_fluxo, tipo_rnc, data_reclamacao,
                    setor_encaminhado
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?
                )
                """, (
                    d["protocol"], d["current_step"], d["current_sector"], d["status"], d["cliente"],
                    d.get("nota_fiscal"), d.get("pedido_sankhya"), d["produto_descricao"], d["motivo_reclamacao"],
                    d["quantidade"], d.get("tipo_material", "perfil"), d.get("devolucao_autorizada", 1), d.get("recebimento_data"),
                    d.get("recebimento_volumes"), d.get("recebimento_avaria_visivel"), d.get("recebimento_obs"),
                    d.get("laudo_procedencia"), d.get("laudo_defeito_tecnico"), d.get("laudo_destinacao"),
                    d.get("laudo_responsavel"), d.get("laudo_data"), d.get("sgi_causa_raiz"), d.get("sgi_acao_corretiva"),
                    d.get("sgi_homologado_por"), d.get("sgi_liberado", 0), d.get("sgi_observacoes"), d.get("comercial_tratativa"),
                    d.get("comercial_detalhes"), d.get("comercial_concluido_por"), d.get("comercial_fechamento_obs"),
                    d.get("financeiro_tipo_operacao"), d.get("financeiro_valor", 0.0), d.get("financeiro_concluido_por"),
                    d.get("financeiro_obs"), d.get("financeiro_data"), d.get("sla_deadline"), d["criado_por"],
                    d["criado_em"], d["atualizado_em"], d.get("tipo_fluxo", "padrao"), d.get("tipo_rnc", "Cliente"), d.get("data_reclamacao"),
                    d.get("setor_encaminhado")
                ))

                # Obtem o ID gerado
                cursor.execute(f"SELECT id FROM {rnc_table} WHERE protocol = ?", (d["protocol"],))
                id_row = row_to_dict(cursor, cursor.fetchone())
                rnc_id = id_row["id"] if id_row else cursor.lastrowid

                # 2. Insercao de itens
                for it in d.get("itens", []):
                    cursor.execute(f"""
                    INSERT INTO {item_table} (rnc_id, tipo_material, produto_descricao, quantidade, unidade_medida)
                    VALUES (?, ?, ?, ?, ?)
                    """, (
                        rnc_id, it["tipo_material"], it["produto_descricao"],
                        it["quantidade"], it.get("unidade_medida", "UN")
                    ))

                # 3. Insercao do historico de auditoria
                for h in d.get("history", []):
                    cursor.execute(f"""
                    INSERT INTO {history_table} (rnc_id, step, sector, action, user_name, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        rnc_id, h["step"], h["sector"], h["action"],
                        h["user_name"], h["created_at"]
                    ))

                inserted_count += 1

            conn.commit()
            return {
                "success": True,
                "message": f"Demonstração Industrial semeada com sucesso! {inserted_count} ocorrências carregadas.",
                "inserted_count": inserted_count,
                "db_mode": db_mode
            }
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Falha ao semear dados de demonstracao: {e}")
        finally:
            conn.close()

    @staticmethod
    def reset_data(only_demo: bool = False) -> Dict[str, Any]:
        """
        Limpa as ocorrencias do banco preservando usuarios e configuracoes.
        Se only_demo=True, limpa apenas os protocolos comecados em RNC-DEMO-.
        Se only_demo=False, zera todas as ocorrencias para deixar a base pronta para producao.
        """
        init_db()
        conn = get_connection()
        cursor = conn.cursor()
        rnc_table = get_rnc_table()
        item_table = get_item_table()
        history_table = get_history_table()
        db_mode = detect_db_mode()

        try:
            if only_demo:
                cursor.execute(f"DELETE FROM {item_table} WHERE rnc_id IN (SELECT id FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%')")
                cursor.execute(f"DELETE FROM {history_table} WHERE rnc_id IN (SELECT id FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%')")
                cursor.execute(f"DELETE FROM {rnc_table} WHERE protocol LIKE 'RNC-DEMO-%'")
                msg = "Ocorrências de demonstração removidas com sucesso."
            else:
                cursor.execute(f"DELETE FROM {item_table}")
                cursor.execute(f"DELETE FROM {history_table}")
                cursor.execute(f"DELETE FROM {rnc_table}")
                if db_mode == "sqlite":
                    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('rncs', 'rnc_itens', 'rnc_history')")
                msg = "Todas as ocorrências foram limpas e os contadores reiniciados. Usuários preservados."

            conn.commit()
            return {
                "success": True,
                "message": msg,
                "db_mode": db_mode
            }
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Falha ao resetar ocorrencias: {e}")
        finally:
            conn.close()
