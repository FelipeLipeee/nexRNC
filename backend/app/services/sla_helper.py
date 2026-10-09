from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from ..database import row_to_dict
from ..models import RncStep, STEP_SLA_HOURS

def calculate_sla_deadline(step: Any) -> str:
    step_val = getattr(step, "value", str(step))
    hours = STEP_SLA_HOURS.get(step_val, 12)
    deadline = datetime.now() + timedelta(hours=hours)
    return deadline.isoformat()

def get_sla_metrics(deadline_raw: Any, status: str, step: str = "") -> Dict[str, Any]:
    if status == "concluido":
        return {"status": "concluido", "hours_remaining": None}
    if step in (RncStep.STEP_1_ABERTURA.value, RncStep.STEP_2_EXPEDICAO.value, "step_2_3_expedicao"):
        return {"status": "aguardando_recebimento", "hours_remaining": None}
    if not deadline_raw:
        return {"status": "sem_prazo", "hours_remaining": None}
    
    try:
        if isinstance(deadline_raw, datetime):
            deadline = deadline_raw
        else:
            deadline = datetime.fromisoformat(str(deadline_raw).replace("Z", ""))
        now = datetime.now()
        diff = (deadline - now).total_seconds() / 3600.0
        if diff < 0:
            return {"status": "atrasado", "hours_remaining": round(diff, 1)}
        elif diff <= 2.0:
            return {"status": "alerta", "hours_remaining": round(diff, 1)}
        else:
            return {"status": "no_prazo", "hours_remaining": round(diff, 1)}
    except Exception:
        return {"status": "sem_prazo", "hours_remaining": None}

def generate_next_protocol(conn: Any) -> str:
    year = datetime.now().year
    prefix = f"RNC-{year}-"
    cursor = conn.cursor()
    cursor.execute("SELECT protocol FROM rncs WHERE protocol LIKE ? ORDER BY id DESC", (f"{prefix}%",))
    row = row_to_dict(cursor, cursor.fetchone())
    if row and row.get("protocol"):
        last_num = int(row["protocol"].split("-")[-1])
        next_num = last_num + 1
    else:
        next_num = 1
    return f"{prefix}{next_num:04d}"
