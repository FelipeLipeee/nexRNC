import json
import shutil
from pathlib import Path
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from ..config import UPLOADS_DIR
from ..models import DEFAULT_USERS, RncStep, Sector
from ..schemas import CreateRncRequest, RncItemResponse, RncDetailResponse, RegisterUserRequest, CancelRncRequest, ReturnStepRequest
from ..services.workflow_service import WorkflowService
from ..services.file_helper import sanitize_filename, get_attachment_category
from ..database import get_connection, test_db_connection, row_to_dict, get_user_table

router = APIRouter(prefix="/api", tags=["RNC"])

DEFAULT_PASSWORDS = {
    "vendas01": "123456", "vendas02": "123456", "vendas03": "123456", "vendas04": "123456",
    "rafa": "123456", "ingrid": "123456", "fran": "123456", "claudia": "123456",
    "coord.comercial": "123456", "coord.expedicao": "123456", "coord.estoque": "123456",
    "coord.pcp": "123456", "coord.beneficiamento": "123456", "coord.kit": "123456",
    "coord.compras": "123456", "compras": "123456", "coord.processos": "123456", "p.mariano": "123456",
    "ti01": "admin123", "ti02": "admin123", "gestor": "admin123",
    "germano": "admin123", "vinicius": "admin123", "a.nogueira": "admin123",
    "e.luchesi": "admin123", "r.carvalho": "admin123", "l.reimberg": "admin123",
    "admin": "admin123",
}

class LoginPayload(BaseModel):
    username: str
    password: str

@router.get("/health")
def health_check():
    db_info = test_db_connection()
    return {"status": "ok", "app": "nexrnc", "version": "1.0.0", "database": db_info}

@router.get("/db-status")
def db_status():
    return test_db_connection()

@router.post("/admin/sync-users")
def admin_sync_users():
    from ..services.user_sync import sync_official_users
    return sync_official_users()

@router.post("/auth/register")
def register(payload: RegisterUserRequest):
    name = payload.name.strip()
    u = payload.username.strip().lower()
    sector = payload.sector.strip().lower()
    role = (payload.role or "").strip()
    pwd = payload.password.strip()

    valid_sectors = [s.value for s in Sector]
    if sector not in valid_sectors:
        raise HTTPException(
            status_code=400,
            detail=f"Setor inválido. Escolha um dos seguintes: {', '.join(valid_sectors)}"
        )

    if not role:
        default_roles = {
            "comercial": "Vendedor(a) / Comercial",
            "expedicao": "Operador(a) de Expedição",
            "producao": "Inspetor(a) Técnico(a)",
            "compras": "Comprador(a) / Analista de Compras",
            "fiscal": "Analista Fiscal / Compras",
            "sgi": "Analista de SGI / Qualidade",
            "financeiro": "Analista Financeiro(a)",
            "gestao": "Gestão / Coordenação Geral",
        }
        role = default_roles.get(sector, "Operador(a)")

    user_table = get_user_table()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(f"SELECT id FROM {user_table} WHERE username = ?", (u,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso.")
    except HTTPException:
        raise
    except Exception:
        pass

    now_iso = datetime.now().isoformat()
    try:
        cursor.execute(f"""
        INSERT INTO {user_table} (username, name, sector, role, password, ativo, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
        """, (u, name, sector, role, pwd, now_iso))
        try:
            conn.commit()
        except Exception:
            pass

        cursor.execute(f"SELECT id, username, name, sector, role FROM {user_table} WHERE username = ?", (u,))
        user_row = row_to_dict(cursor, cursor.fetchone())
        conn.close()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar usuário no banco: {e}")

    if not user_row:
        user_row = {"id": 999, "username": u, "name": name, "sector": sector, "role": role}

    return {
        "authenticated": True,
        "token": f"nexrnc_token_{u}_{datetime.now().strftime('%Y%m%d%H%M')}",
        "user": user_row
    }

@router.post("/auth/login")
def login(payload: LoginPayload):
    u = payload.username.strip().lower()
    p = payload.password.strip()

    user_table = get_user_table()
    user_row = None
    db_password = None

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT id, username, name, sector, role, password FROM {user_table} WHERE username = ?", (u,))
        row = cursor.fetchone()
        if row:
            user_row = row_to_dict(cursor, row)
            db_password = user_row.pop("password", None)
        conn.close()
    except Exception:
        pass

    if user_row:
        if db_password:
            if p != db_password:
                raise HTTPException(status_code=401, detail="Senha incorreta.")
        else:
            expected = DEFAULT_PASSWORDS.get(u, "123456")
            if p != expected:
                raise HTTPException(status_code=401, detail="Senha incorreta.")
    else:
        user_row = next((usr for usr in DEFAULT_USERS if usr["username"].lower() == u), None)
        if not user_row:
            raise HTTPException(status_code=404, detail="Usuário não cadastrado.")
        expected = DEFAULT_PASSWORDS.get(u, "admin123" if u == "gestor" else "123456")
        if p != expected:
            raise HTTPException(status_code=401, detail="Senha incorreta.")

    return {
        "authenticated": True,
        "token": f"nexrnc_token_{u}_{datetime.now().strftime('%Y%m%d%H%M')}",
        "user": user_row
    }

@router.get("/users")
def list_users():
    user_table = get_user_table()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT id, username, name, sector, role FROM {user_table} WHERE ativo = 1")
        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, r)) for r in cursor.fetchall()]
        conn.close()
        if rows:
            return rows
    except Exception:
        pass
    return DEFAULT_USERS

@router.get("/kpis")
def get_kpis():
    return WorkflowService.get_kpis()

@router.get("/rncs")
def list_rncs(sector: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    return WorkflowService.list_rncs(sector=sector, status=status, search=search)

@router.get("/rncs/{rnc_id}")
def get_rnc(rnc_id: int):
    data = WorkflowService.get_rnc_by_id(rnc_id)
    if not data:
        raise HTTPException(status_code=404, detail="RNC não encontrada")
    return data

@router.post("/rncs")
def create_rnc(payload: CreateRncRequest):
    return WorkflowService.create_rnc(payload.model_dump())

@router.post("/rncs/create-with-attachment")
def create_rnc_with_attachment(
    cliente: str = Form(...),
    nota_fiscal: Optional[str] = Form(None),
    pedido_sankhya: Optional[str] = Form(None),
    produto_descricao: Optional[str] = Form(""),
    motivo_reclamacao: str = Form(...),
    quantidade: float = Form(1.0),
    tipo_material: str = Form("perfil"),
    tipo_rnc: Optional[str] = Form("Cliente"),
    data_reclamacao: Optional[str] = Form(None),
    itens_json: Optional[str] = Form(None),
    devolucao_autorizada: bool = Form(True),
    fluxo_flexivel: bool = Form(False),
    tipo_fluxo: str = Form("padrao"),
    user_name: str = Form("Comercial"),
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None)
):
    itens = None
    if itens_json:
        try:
            itens = json.loads(itens_json)
        except Exception:
            itens = None

    rnc_payload = {
        "cliente": cliente,
        "nota_fiscal": nota_fiscal,
        "pedido_sankhya": pedido_sankhya,
        "produto_descricao": produto_descricao or "",
        "motivo_reclamacao": motivo_reclamacao,
        "quantidade": quantidade,
        "tipo_material": tipo_material,
        "tipo_rnc": tipo_rnc,
        "data_reclamacao": data_reclamacao,
        "itens": itens,
        "devolucao_autorizada": devolucao_autorizada,
        "fluxo_flexivel": fluxo_flexivel,
        "tipo_fluxo": tipo_fluxo,
        "user_name": user_name
    }
    created = WorkflowService.create_rnc(rnc_payload)
    rnc_id = created["rnc"]["id"]

    all_files: List[UploadFile] = []
    if files:
        all_files.extend(files)
    if file and file not in all_files:
        all_files.append(file)

    if all_files:
        conn = get_connection()
        cursor = conn.cursor()
        now_iso = datetime.now().isoformat()

        for idx, f in enumerate(all_files):
            if f and f.filename:
                clean_filename = f"{rnc_id}_{idx+1}_{sanitize_filename(f.filename)}"
                target_path = UPLOADS_DIR / clean_filename
                with open(target_path, "wb") as buffer:
                    shutil.copyfileobj(f.file, buffer)

                cat = get_attachment_category(f.filename)

                cursor.execute("""
                INSERT INTO rnc_attachments (rnc_id, step, file_name, file_path, category, uploaded_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (rnc_id, "step_1_abertura", f.filename, f"/uploads/{clean_filename}", cat, user_name, now_iso))

        try:
            conn.commit()
        except Exception:
            pass
        conn.close()

    return WorkflowService.get_rnc_by_id(rnc_id)

@router.post("/rncs/{rnc_id}/cancel")
def cancel_rnc(rnc_id: int, payload: CancelRncRequest):
    try:
        return WorkflowService.cancel_rnc(rnc_id, payload.motivo, payload.user_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao cancelar RNC: {e}")

@router.post("/rncs/{rnc_id}/return-step")
def return_step(rnc_id: int, payload: ReturnStepRequest):
    try:
        return WorkflowService.return_step(rnc_id, payload.motivo, payload.user_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao retornar etapa: {e}")

@router.post("/rncs/{rnc_id}/transition")
def transition_rnc(rnc_id: int, target_step: str, payload: dict, user_name: str = "Operador"):
    try:
        return WorkflowService.transition_step(rnc_id, target_step, payload, user_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/rncs/{rnc_id}/attachments")
def upload_attachment(
    rnc_id: int,
    step: str = Form(...),
    category: str = Form("foto"),
    uploaded_by: str = Form("Operador"),
    file: UploadFile = File(...)
):
    rnc = WorkflowService.get_rnc_by_id(rnc_id)
    if not rnc:
        raise HTTPException(status_code=404, detail="RNC não encontrada")

    clean_filename = f"{rnc_id}_{sanitize_filename(file.filename)}"
    target_path = UPLOADS_DIR / clean_filename
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    actual_category = get_attachment_category(file.filename, default=category or "arquivo")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO rnc_attachments (rnc_id, step, file_name, file_path, category, uploaded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (rnc_id, step, file.filename, f"/uploads/{clean_filename}", actual_category, uploaded_by, datetime.now().isoformat()))
    try:
        conn.commit()
    except Exception:
        pass
    cursor.execute("SELECT id FROM rnc_attachments WHERE rnc_id = ? AND file_path = ?", (rnc_id, f"/uploads/{clean_filename}"))
    row = cursor.fetchone()
    att_id = row[0] if row else cursor.lastrowid
    conn.close()

    return {"id": att_id, "file_name": file.filename, "url": f"/uploads/{clean_filename}", "category": actual_category}

@router.get("/production-sectors")
def get_production_sectors():
    from ..models import PRODUCTION_SECTORS
    return PRODUCTION_SECTORS

@router.get("/sectors")
def get_all_sectors():
    from ..models import Sector
    return [s.value for s in Sector]

@router.post("/alerts/check-sla")
def trigger_sla_check():
    from ..services.sla_notifier import check_and_notify_overdue_rncs
    notified = check_and_notify_overdue_rncs()
    return {"status": "ok", "alertas_enviados": len(notified), "rncs": notified}
