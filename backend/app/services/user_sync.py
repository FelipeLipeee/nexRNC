"""
user_sync.py - Sincronizacao automatica de usuarios corporativos padrao do nexRNC
Garante que os operadores setoriais e gestores padrao existam no banco de dados.
"""

from typing import List, Dict, Any
from datetime import datetime
from ..database import get_connection, get_user_table

DEFAULT_SYSTEM_USERS: List[Dict[str, Any]] = [
    # 1. Administracao e Gestao
    {"username": "admin", "name": "Administrador do Sistema", "sector": "ti", "role": "Administrador / TI", "password": "admin123"},
    {"username": "diretoria", "name": "Diretoria Geral", "sector": "diretoria", "role": "Diretor Executivo", "password": "123456"},
    {"username": "gestor", "name": "Gestão Operacional", "sector": "gestao", "role": "Gestor Geral", "password": "123456"},

    # 2. Comercial
    {"username": "comercial", "name": "Coordenação Comercial", "sector": "comercial", "role": "Coordenador de Vendas", "password": "123456"},
    {"username": "vendas01", "name": "Analista Comercial", "sector": "comercial", "role": "Vendedor Técnico", "password": "123456"},

    # 3. Expedição e Logística
    {"username": "expedicao", "name": "Coordenação de Expedição", "sector": "expedicao", "role": "Coordenador Logístico", "password": "123456"},
    {"username": "estoque", "name": "Almoxarifado & Estoque", "sector": "estoque", "role": "Conferente de Entrada", "password": "123456"},

    # 4. Produção e Chão de Fábrica
    {"username": "producao", "name": "Supervisão Industrial", "sector": "producao", "role": "Supervisor de Fábrica", "password": "123456"},
    {"username": "pcp", "name": "Planejamento (PCP)", "sector": "producao", "role": "Analista de PCP", "password": "123456"},

    # 5. Qualidade e SGI
    {"username": "qualidade", "name": "Engenharia de Qualidade", "sector": "sgi", "role": "Coordenador de Qualidade / SGI", "password": "123456"},

    # 6. Compras e Suprimentos
    {"username": "compras", "name": "Suprimentos e Devoluções", "sector": "compras", "role": "Comprador Técnico", "password": "123456"},

    # 7. Financeiro
    {"username": "financeiro", "name": "Controladoria Financeira", "sector": "financeiro", "role": "Analista Financeiro", "password": "123456"},
]

def sync_official_users() -> Dict[str, int]:
    """Garante de forma idempotente que os usuarios padrao existam no banco."""
    user_table = get_user_table()
    inserted = 0
    updated = 0
    now_iso = datetime.now().isoformat()

    try:
        conn = get_connection()
        cursor = conn.cursor()

        for u in DEFAULT_SYSTEM_USERS:
            cursor.execute(f"SELECT id FROM {user_table} WHERE username = ?", (u["username"],))
            row = cursor.fetchone()

            if row:
                cursor.execute(
                    f"UPDATE {user_table} SET name = ?, sector = ?, role = ? WHERE username = ?",
                    (u["name"], u["sector"], u["role"], u["username"])
                )
                updated += 1
            else:
                cursor.execute(
                    f"INSERT INTO {user_table} (username, name, sector, role, password, ativo, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
                    (u["username"], u["name"], u["sector"], u["role"], u.get("password", "123456"), now_iso)
                )
                inserted += 1

        conn.commit()
        conn.close()
        return {"inserted": inserted, "updated": updated, "total": len(DEFAULT_SYSTEM_USERS)}
    except Exception as e:
        print(f"[USER SYNC ERROR] Falha ao sincronizar usuarios: {e}")
        return {"error": str(e), "inserted": 0, "updated": 0}
