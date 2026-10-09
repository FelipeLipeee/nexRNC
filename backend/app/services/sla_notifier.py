"""
sla_notifier.py - Monitoramento e Disparo de Alertas de SLA Estourado
Verifica periodicamente as RNCs em andamento cujo prazo estourou e dispara
e-mail de alerta exclusivamente para o setor responsavel no momento.
Utiliza rnc_history para garantir idempotencia diaria (evita spam).
"""

import time
import threading
from datetime import datetime
from typing import List, Dict, Any
from ..database import get_connection, rows_to_dicts
from .sla_helper import get_sla_metrics
from .email_service import EmailNotificationService

def check_and_notify_overdue_rncs() -> List[Dict[str, Any]]:
    """
    Varre todas as RNCs em andamento. Caso o SLA esteja atrasado,
    dispara alerta por e-mail unicamente para o setor que esta com a RNC.
    Garante que nao ocorra reenvio no mesmo dia para a mesma etapa.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rncs WHERE status = 'em_andamento'")
    active_rncs = rows_to_dicts(cursor, cursor.fetchall())
    conn.close()

    notified = []
    now = datetime.now()
    today_prefix = now.strftime("%Y-%m-%d")

    for rnc in active_rncs:
        current_step = str(rnc.get("current_step") or "")
        if current_step in ("step_1_abertura", "step_2_expedicao", "step_2_3_expedicao"):
            continue
        deadline = rnc.get("sla_deadline")
        status = rnc.get("status", "")
        sla_info = get_sla_metrics(deadline, status, current_step)

        if sla_info.get("status") == "atrasado":
            rnc_id = rnc["id"]
            current_step = rnc.get("current_step", "")
            current_sector = rnc.get("current_sector", "")

            conn_h = get_connection()
            cur_h = conn_h.cursor()
            cur_h.execute("""
            SELECT COUNT(*) FROM rnc_history
            WHERE rnc_id = ? AND action LIKE 'Alerta de SLA%' AND step = ? AND created_at LIKE ?
            """, (rnc_id, current_step, f"{today_prefix}%"))
            row = cur_h.fetchone()
            already_notified = (row[0] > 0) if row else False

            if not already_notified:
                now_iso = now.isoformat()
                hours_late = sla_info.get("hours_remaining", 0)
                cur_h.execute("""
                INSERT INTO rnc_history (rnc_id, step, sector, action, user_name, notes, created_at)
                VALUES (?, ?, ?, 'Alerta de SLA Expirado', 'Sistema nexRNC', ?, ?)
                """, (
                    rnc_id, current_step, current_sector,
                    f"Alerta automático de SLA estourado ({hours_late}h) enviado para setor {current_sector}",
                    now_iso
                ))
                try:
                    conn_h.commit()
                except Exception:
                    pass

                # Dispara o email assincrono apenas para o setor atual
                try:
                    EmailNotificationService.notify_sla_overdue(rnc, hours_late)
                    notified.append({
                        "id": rnc_id,
                        "protocol": rnc.get("protocol"),
                        "current_sector": current_sector,
                        "hours_remaining": hours_late
                    })
                    print(f"[SLA ALERTA] Notificado setor '{current_sector}' para RNC {rnc.get('protocol')} ({hours_late}h)")
                except Exception as e:
                    print(f"[SLA ERROR] Falha ao enviar alerta de RNC {rnc_id}: {e}")

            conn_h.close()

    return notified

def _sla_worker_loop(interval_seconds: int = 1800):
    """Loop continuo executado em thread daemon a cada 30 minutos."""
    time.sleep(15)  # Aguarda startup da aplicacao e conexao ao banco
    while True:
        try:
            check_and_notify_overdue_rncs()
        except Exception as e:
            print(f"[SLA WORKER] Erro na varredura periódica: {e}")
        time.sleep(interval_seconds)

def start_sla_alert_worker():
    """Inicia o daemon de monitoramento continuo de prazos de SLA."""
    t = threading.Thread(target=_sla_worker_loop, daemon=True, name="nexrnc-sla-monitor")
    t.start()
