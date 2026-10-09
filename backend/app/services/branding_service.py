import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import UploadFile
from app.config import UPLOADS_DIR
from app.database import get_connection, row_to_dict

DEFAULT_BRANDING = {
    "id": 1,
    "company_name": "nexRNC Enterprise",
    "system_title": "Sistema de Gestão de Não Conformidades",
    "logo_url": None,
    "logo_dark_url": None,
    "primary_color": "#13273e",
    "accent_color": "#e35210",
    "custom_footer": "Esteira Digital de Gestão e Tratativa de Relatórios de Não Conformidade",
    "updated_at": datetime.now().isoformat()
}

def ensure_branding_table():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS rnc_branding (
            id INT PRIMARY KEY,
            company_name VARCHAR(150) NOT NULL,
            system_title VARCHAR(200) NOT NULL,
            logo_url VARCHAR(500) NULL,
            logo_dark_url VARCHAR(500) NULL,
            primary_color VARCHAR(20) DEFAULT '#13273e',
            accent_color VARCHAR(20) DEFAULT '#e35210',
            custom_footer VARCHAR(500) NULL,
            updated_at VARCHAR(50) NULL
        )
        """)
        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()

def get_branding() -> Dict[str, Any]:
    ensure_branding_table()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM rnc_branding WHERE id = 1")
        row = cursor.fetchone()
        if row:
            data = row_to_dict(cursor, row)
            return {**DEFAULT_BRANDING, **{k: v for k, v in data.items() if v is not None}}
        return DEFAULT_BRANDING
    except Exception:
        return DEFAULT_BRANDING
    finally:
        conn.close()

def update_branding(payload: Dict[str, Any]) -> Dict[str, Any]:
    ensure_branding_table()
    current = get_branding()
    updated = {**current, **{k: v for k, v in payload.items() if v is not None}}
    updated["updated_at"] = datetime.now().isoformat()

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM rnc_branding WHERE id = 1")
        exists = cursor.fetchone()
        if exists:
            cursor.execute("""
            UPDATE rnc_branding SET
                company_name = ?,
                system_title = ?,
                logo_url = ?,
                logo_dark_url = ?,
                primary_color = ?,
                accent_color = ?,
                custom_footer = ?,
                updated_at = ?
            WHERE id = 1
            """, (
                updated["company_name"],
                updated["system_title"],
                updated["logo_url"],
                updated["logo_dark_url"],
                updated["primary_color"],
                updated["accent_color"],
                updated["custom_footer"],
                updated["updated_at"]
            ))
        else:
            cursor.execute("""
            INSERT INTO rnc_branding (
                id, company_name, system_title, logo_url, logo_dark_url,
                primary_color, accent_color, custom_footer, updated_at
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                updated["company_name"],
                updated["system_title"],
                updated["logo_url"],
                updated["logo_dark_url"],
                updated["primary_color"],
                updated["accent_color"],
                updated["custom_footer"],
                updated["updated_at"]
            ))
        conn.commit()
        return updated
    finally:
        conn.close()

def save_logo_file(file: UploadFile) -> str:
    branding_dir = UPLOADS_DIR / "branding"
    branding_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix or ".png"
    safe_name = f"company_logo_{int(datetime.now().timestamp())}{ext}"
    dest_path = branding_dir / safe_name

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/branding/{safe_name}"
