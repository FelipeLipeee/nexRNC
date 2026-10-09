from datetime import datetime
from typing import List, Dict, Any, Optional
from ..database import get_connection, row_to_dict, rows_to_dicts, get_item_table
from ..models import RncStep, Sector, STEP_LABELS, STEP_SECTOR_MAP, STEP_SLA_HOURS
from .sla_helper import calculate_sla_deadline, get_sla_metrics, generate_next_protocol
from .workflow_transitions import execute_step_transition, execute_return_step

class WorkflowService:
    @staticmethod
    def create_rnc(data: Dict[str, Any]) -> Dict[str, Any]:
        conn = get_connection()
        now = datetime.now().isoformat()
        next_step = RncStep.STEP_2_EXPEDICAO.value
        next_sector = Sector.EXPEDICAO.value
        deadline = calculate_sla_deadline(RncStep.STEP_2_EXPEDICAO.value)

        # Parse items list or fallback to single product fields
        raw_items = data.get("itens") or []
        parsed_items = []
        if isinstance(raw_items, list) and len(raw_items) > 0:
            for it in raw_items:
                if isinstance(it, dict):
                    desc = it.get("produto_descricao") or it.get("descricao") or ""
                    mat = it.get("tipo_material") or "perfil"
                    qtd = float(it.get("quantidade") or 1.0)
                    unid = it.get("unidade_medida") or "UN"
                    if str(desc).strip():
                        parsed_items.append({
                            "tipo_material": mat,
                            "produto_descricao": str(desc).strip(),
                            "quantidade": qtd,
                            "unidade_medida": unid
                        })

        if parsed_items:
            tot_qtd = sum(it["quantidade"] for it in parsed_items)
            descriptions = [it["produto_descricao"] for it in parsed_items]
            main_desc = ", ".join(descriptions)
            if len(main_desc) > 250:
                main_desc = f"{descriptions[0]} (+{len(descriptions)-1} itens)"
            all_types = set(it["tipo_material"] for it in parsed_items)
            main_type = parsed_items[0]["tipo_material"] if len(all_types) == 1 else "multiplo"
        else:
            main_desc = data.get("produto_descricao") or "Material não especificado"
            main_type = data.get("tipo_material", "perfil")
            tot_qtd = float(data.get("quantidade") or 1.0)
            parsed_items = [{
                "tipo_material": main_type,
                "produto_descricao": main_desc,
                "quantidade": tot_qtd,
                "unidade_medida": "UN"
            }]

        data_reclamacao = data.get("data_reclamacao") or datetime.now().strftime("%Y-%m-%d")
        tipo_rnc = data.get("tipo_rnc") or "Cliente"
        tipo_fluxo = data.get("tipo_fluxo") or "padrao"
        is_financeiro = (tipo_fluxo == "financeiro") or (not data.get("devolucao_autorizada", True))

        if is_financeiro:
            tipo_fluxo = "financeiro"
            next_step = RncStep.STEP_4_COMPRAS.value
            next_sector = Sector.COMPRAS.value
            deadline = calculate_sla_deadline(RncStep.STEP_4_COMPRAS.value)
            action_name = "Abertura de RNC (Fluxo de Crédito / Sem Peça Física) - Encaminhada para Compras"
            action_notes = f"Cliente: {data['cliente']} | Trâmite de crédito sem retorno físico de mercadoria | Itens: {len(parsed_items)} item(ns) ({main_desc})"
        else:
            tipo_fluxo = "padrao"
            next_step = RncStep.STEP_2_EXPEDICAO.value
            next_sector = Sector.EXPEDICAO.value
            deadline = calculate_sla_deadline(RncStep.STEP_2_EXPEDICAO.value)
            action_name = "Abertura de RNC e Envio para Expedição"
            action_notes = f"Cliente: {data['cliente']} | Itens: {len(parsed_items)} item(ns) ({main_desc})"

        protocol = generate_next_protocol(conn)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO rncs (
            protocol, current_step, current_sector, status, cliente, nota_fiscal,
            pedido_sankhya, produto_descricao, motivo_reclamacao, quantidade,
            tipo_material, devolucao_autorizada, sla_deadline, criado_por,
            criado_em, atualizado_em, fluxo_flexivel, data_reclamacao, tipo_rnc, tipo_fluxo
        ) VALUES (?, ?, ?, 'em_andamento', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            protocol, next_step, next_sector, data["cliente"], data.get("nota_fiscal"),
            data.get("pedido_sankhya"), main_desc, data["motivo_reclamacao"],
            tot_qtd, main_type,
            0 if is_financeiro else (1 if data.get("devolucao_autorizada", True) else 0), deadline,
            data.get("user_name", "Comercial"), now, now,
            1 if data.get("fluxo_flexivel") else 0,
            data_reclamacao, tipo_rnc, tipo_fluxo
        ))
        
        cursor.execute("SELECT id FROM rncs WHERE protocol = ?", (protocol,))
        id_row = row_to_dict(cursor, cursor.fetchone())
        rnc_id = id_row["id"] if id_row else cursor.lastrowid

        # Salva itens na tabela dedicada com unidade de medida
        item_table = get_item_table()
        for item in parsed_items:
            try:
                cursor.execute(f"""
                INSERT INTO {item_table} (rnc_id, tipo_material, produto_descricao, quantidade, unidade_medida)
                VALUES (?, ?, ?, ?, ?)
                """, (rnc_id, item["tipo_material"], item["produto_descricao"], item["quantidade"], item.get("unidade_medida", "UN")))
            except Exception:
                pass

        cursor.execute("""
        INSERT INTO rnc_history (rnc_id, step, sector, action, user_name, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            rnc_id, RncStep.STEP_1_ABERTURA.value, Sector.COMERCIAL.value,
            action_name, data.get("user_name", "Comercial"),
            action_notes, now
        ))

        try:
            conn.commit()
        except Exception:
            pass
        conn.close()

        created_rnc = WorkflowService.get_rnc_by_id(rnc_id)
        if created_rnc and created_rnc.get("rnc"):
            try:
                from .email_service import EmailNotificationService
                EmailNotificationService.notify_rnc_created(created_rnc["rnc"])
            except Exception as e:
                print(f"[EMAIL ERROR] Falha no hook de criacao: {e}")
        return created_rnc

    @staticmethod
    def list_rncs(sector: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM rncs WHERE 1=1"
        params = []

        if sector and sector != "gestao":
            query += " AND current_sector = ?"
            params.append(sector)
        if status:
            query += " AND status = ?"
            params.append(status)
        if search:
            query += " AND (protocol LIKE ? OR cliente LIKE ? OR produto_descricao LIKE ? OR nota_fiscal LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term, term])

        query += " ORDER BY id DESC"
        cursor.execute(query, params)
        rows = rows_to_dicts(cursor, cursor.fetchall())
        conn.close()

        result = []
        for item in rows:
            step_val = str(item.get("current_step") or "")
            sla_info = get_sla_metrics(item.get("sla_deadline"), item.get("status", ""), step_val)
            item["current_step_label"] = STEP_LABELS.get(step_val, step_val)
            item["sla_status"] = sla_info["status"]
            item["sla_hours_remaining"] = sla_info["hours_remaining"]
            result.append(item)
        return result

    @staticmethod
    def get_rnc_by_id(rnc_id: int) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM rncs WHERE id = ?", (rnc_id,))
        rnc_dict = row_to_dict(cursor, cursor.fetchone())
        if not rnc_dict:
            conn.close()
            return None

        cursor.execute("SELECT * FROM rnc_history WHERE rnc_id = ? ORDER BY id ASC", (rnc_id,))
        history = rows_to_dicts(cursor, cursor.fetchall())
        for h in history:
            h_step = str(h.get("step") or "")
            h["step_label"] = STEP_LABELS.get(h_step, h_step)

        cursor.execute("SELECT * FROM rnc_attachments WHERE rnc_id = ? ORDER BY id DESC", (rnc_id,))
        attachments = rows_to_dicts(cursor, cursor.fetchall())

        item_table = get_item_table()
        try:
            cursor.execute(f"SELECT id, rnc_id, tipo_material, produto_descricao, quantidade, unidade_medida FROM {item_table} WHERE rnc_id = ? ORDER BY id ASC", (rnc_id,))
            itens = rows_to_dicts(cursor, cursor.fetchall())
        except Exception:
            itens = []

        conn.close()

        if not itens and rnc_dict.get("produto_descricao"):
            itens = [{
                "id": 1,
                "rnc_id": rnc_id,
                "tipo_material": rnc_dict.get("tipo_material", "perfil"),
                "produto_descricao": rnc_dict.get("produto_descricao", ""),
                "quantidade": rnc_dict.get("quantidade", 1.0),
                "unidade_medida": "UN"
            }]

        step_val = str(rnc_dict.get("current_step") or "")
        sla_info = get_sla_metrics(rnc_dict.get("sla_deadline"), rnc_dict.get("status", ""), step_val)
        rnc_dict["current_step_label"] = STEP_LABELS.get(step_val, step_val)
        rnc_dict["sla_status"] = sla_info["status"]
        rnc_dict["sla_hours_remaining"] = sla_info["hours_remaining"]

        return {"rnc": rnc_dict, "history": history, "attachments": attachments, "itens": itens}

    @staticmethod
    def transition_step(rnc_id: int, target_step: str, payload: Dict[str, Any], user_name: str) -> Dict[str, Any]:
        rnc_data = WorkflowService.get_rnc_by_id(rnc_id)
        if not rnc_data:
            raise ValueError(f"RNC {rnc_id} não encontrada.")
        
        current = rnc_data["rnc"]
        now = datetime.now().isoformat()
        notes = payload.get("notes", "")

        fields_to_update, next_step, next_sector, action_desc = execute_step_transition(
            current, payload, user_name, now
        )

        fields_to_update["current_step"] = next_step
        fields_to_update["current_sector"] = next_sector

        conn = get_connection()
        cursor = conn.cursor()

        # Blindagem dinâmica de schema: detecta colunas existentes fisicamente na tabela rncs
        try:
            cursor.execute("SELECT TOP 0 * FROM rncs" if "sql_server" in str(type(conn)).lower() or hasattr(conn, "getinfo") else "SELECT * FROM rncs LIMIT 0")
            existing_cols = {col[0].lower() for col in cursor.description}
        except Exception:
            existing_cols = None

        if existing_cols:
            for k in list(fields_to_update.keys()):
                if k.lower() not in existing_cols:
                    col_created = False
                    try:
                        col_type = "NVARCHAR(MAX)" if "obs" in k else "DATETIME2" if "data" in k else "VARCHAR(100)"
                        cursor.execute(f"ALTER TABLE rncs ADD {k} {col_type} NULL")
                        conn.commit()
                        existing_cols.add(k.lower())
                        col_created = True
                        print(f"[AUTO-MIGRATE] Coluna {k} criada com sucesso na tabela rncs.")
                    except Exception as e:
                        print(f"[AUTO-MIGRATE ALERTA] Nao foi possivel criar coluna {k}: {e}")

                    if not col_created:
                        val = fields_to_update.pop(k)
                        notes = f"{notes} | {k}: {val}" if notes else f"{k}: {val}"

        set_clause = ", ".join([f"{k} = ?" for k in fields_to_update.keys()])
        cursor.execute(f"UPDATE rncs SET {set_clause} WHERE id = ?", list(fields_to_update.values()) + [rnc_id])
        cursor.execute("""
        INSERT INTO rnc_history (rnc_id, step, sector, action, user_name, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (rnc_id, next_step, next_sector, action_desc, user_name, notes, now))
        try:
            conn.commit()
        except Exception:
            pass
        conn.close()

        updated_rnc = WorkflowService.get_rnc_by_id(rnc_id)
        if updated_rnc and updated_rnc.get("rnc"):
            try:
                from .email_service import EmailNotificationService
                EmailNotificationService.notify_step_transition(
                    updated_rnc["rnc"],
                    current.get("current_step", ""),
                    next_step,
                    notes,
                    user_name
                )
            except Exception as e:
                print(f"[EMAIL ERROR] Falha no hook de transicao: {e}")
        return updated_rnc

    @staticmethod
    def cancel_rnc(rnc_id: int, motivo: str, user_name: str) -> Dict[str, Any]:
        rnc_data = WorkflowService.get_rnc_by_id(rnc_id)
        if not rnc_data:
            raise ValueError(f"RNC {rnc_id} não encontrada.")
        
        current = rnc_data["rnc"]
        if current.get("status") == "concluido":
            raise ValueError("Não é possível cancelar uma RNC já concluída.")
        if current.get("status") == "cancelado":
            raise ValueError("Esta RNC já se encontra cancelada.")

        # Seguranca: Apenas gestores ou o criador da RNC podem cancelar
        criador = str(current.get("criado_por") or "").strip().lower()
        solicitante = str(user_name or "").strip().lower()
        is_creator = (solicitante == criador)
        is_manager = any(role in solicitante for role in ["gestor", "gerente", "diretor", "admin", "ti"])

        if not is_creator and not is_manager:
            try:
                conn_u = get_connection()
                cur_u = conn_u.cursor()
                user_tbl = get_user_table()
                cur_u.execute(f"SELECT sector, role FROM {user_tbl} WHERE LOWER(name) = ? OR LOWER(username) = ?", (solicitante, solicitante))
                u_row = cur_u.fetchone()
                conn_u.close()
                if u_row:
                    u_sec = str(u_row[0] or "").lower()
                    u_rol = str(u_row[1] or "").lower()
                    if u_sec in ("gestao", "gerencia", "diretoria", "ti") or any(r in u_rol for r in ["gestor", "gerente", "diretor", "admin"]):
                        is_manager = True
            except Exception:
                pass

        if not is_creator and not is_manager:
            raise ValueError(f"Permissão negada: Apenas gestores ou o criador ({current.get('criado_por')}) podem cancelar esta RNC.")

        now = datetime.now().isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE rncs 
        SET status = 'cancelado', current_step = 'cancelado', motivo_cancelamento = ?, atualizado_em = ?
        WHERE id = ?
        """, (motivo, now, rnc_id))

        cursor.execute("""
        INSERT INTO rnc_history (rnc_id, step, sector, action, user_name, notes, created_at)
        VALUES (?, 'cancelado', ?, 'RNC Cancelada', ?, ?, ?)
        """, (rnc_id, current["current_sector"], user_name, f"Justificativa: {motivo}", now))

        try:
            conn.commit()
        except Exception:
            pass
        conn.close()

        cancelled_rnc = WorkflowService.get_rnc_by_id(rnc_id)
        if cancelled_rnc and cancelled_rnc.get("rnc"):
            try:
                from .email_service import EmailNotificationService
                EmailNotificationService.notify_rnc_cancelled(cancelled_rnc["rnc"], motivo, user_name)
            except Exception as e:
                print(f"[EMAIL ERROR] Falha no hook de cancelamento: {e}")
        return cancelled_rnc

    @staticmethod
    def return_step(rnc_id: int, motivo: str, user_name: str) -> Dict[str, Any]:
        if not motivo or len(motivo.strip()) < 5:
            raise ValueError("Justificativa de retorno obrigatória (mínimo 5 caracteres).")

        rnc_data = WorkflowService.get_rnc_by_id(rnc_id)
        if not rnc_data:
            raise ValueError(f"RNC {rnc_id} não encontrada.")

        current = rnc_data["rnc"]
        if current.get("status") != "em_andamento":
            raise ValueError("Apenas RNCs em andamento podem ser retornadas.")

        now = datetime.now().isoformat()
        fields_to_update, prev_step, prev_sector, action_desc = execute_return_step(
            current, motivo.strip(), user_name, now
        )

        conn = get_connection()
        cursor = conn.cursor()
        sla_val = fields_to_update.get("sla_deadline") or current.get("sla_deadline") or calculate_sla_deadline(prev_step)
        cursor.execute("""
        UPDATE rncs 
        SET current_step = ?, current_sector = ?, sla_deadline = ?, atualizado_em = ?
        WHERE id = ?
        """, (prev_step, prev_sector, sla_val, now, rnc_id))

        cursor.execute("""
        INSERT INTO rnc_history (rnc_id, step, sector, action, user_name, notes, created_at)
        VALUES (?, ?, ?, 'Retorno de Etapa', ?, ?, ?)
        """, (rnc_id, prev_step, prev_sector, user_name, f"Devolvido para {prev_sector.upper()} por {user_name}. Motivo: {motivo.strip()}", now))

        try:
            conn.commit()
        except Exception:
            pass
        conn.close()

        updated_rnc = WorkflowService.get_rnc_by_id(rnc_id)
        if updated_rnc and updated_rnc.get("rnc"):
            try:
                from .email_service import EmailNotificationService
                EmailNotificationService.notify_step_return(updated_rnc["rnc"], prev_sector, motivo.strip(), user_name)
            except Exception as e:
                print(f"[EMAIL ERROR] Falha no hook de retorno de etapa: {e}")

        return updated_rnc

    @staticmethod
    def get_kpis() -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT status, COUNT(*) FROM rncs GROUP BY status")
        status_counts = {r[0]: r[1] for r in cursor.fetchall()}
        cursor.execute("SELECT current_sector, COUNT(*) FROM rncs WHERE status = 'em_andamento' GROUP BY current_sector")
        por_setor = {r[0]: r[1] for r in cursor.fetchall()}
        cursor.execute("SELECT * FROM rncs WHERE status = 'em_andamento'")
        all_active = rows_to_dicts(cursor, cursor.fetchall())
        atrasadas = sum(1 for r in all_active if get_sla_metrics(r.get("sla_deadline"), r.get("status", ""), str(r.get("current_step") or ""))["status"] == "atrasado")
        conn.close()

        return {
            "total_ativas": status_counts.get("em_andamento", 0),
            "total_concluidas": status_counts.get("concluido", 0),
            "total_canceladas": status_counts.get("cancelado", 0),
            "total_atrasadas": atrasadas,
            "por_setor": por_setor
        }
