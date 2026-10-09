"""
user_sync.py - Sincronizacao automatica de usuarios corporativos do Grupo Tec
Garante que todos os operadores setoriais, vendedores e gestores existam no SQL Server.
"""

from typing import List, Dict, Any
from datetime import datetime
from ..database import get_connection, get_user_table

OFFICIAL_USERS: List[Dict[str, Any]] = [
    # 1. Comercial / Vendas
    {"username": "vendas01", "name": "Rafaela Pacheco", "sector": "comercial", "role": "Vendedora Comercial", "password": "123456"},
    {"username": "vendas02", "name": "Ingrid (Vendas 02)", "sector": "comercial", "role": "Vendedora Comercial", "password": "123456"},
    {"username": "vendas03", "name": "Fran (Vendas 03)", "sector": "comercial", "role": "Vendedora Comercial", "password": "123456"},
    {"username": "vendas04", "name": "Claudia (Vendas 04)", "sector": "comercial", "role": "Vendedora Comercial", "password": "123456"},
    {"username": "coord.comercial", "name": "Caroline Miranda", "sector": "comercial", "role": "Coordenador Comercial", "password": "123456"},

    # 2. Expedição
    {"username": "coord.expedicao", "name": "Carlos Marques", "sector": "expedicao", "role": "Coordenador de Expedição", "password": "123456"},

    # 3. Estoque
    {"username": "coord.estoque", "name": "Fabricio Felix", "sector": "estoque", "role": "Coordenador de Estoque", "password": "123456"},

    # 4. Produção / PCP / Fábrica
    {"username": "coord.pcp", "name": "Daniela Fernandes", "sector": "producao", "role": "Coordenador PCP", "password": "123456"},
    {"username": "coord.beneficiamento", "name": "Talles Andrade", "sector": "producao", "role": "Coordenador Beneficiamento", "password": "123456"},
    {"username": "coord.kit", "name": "Sueli Leite", "sector": "producao", "role": "Coordenador de Kits", "password": "123456"},

    # 5. Compras / Suprimentos
    {"username": "coord.compras", "name": "Lucas Velame", "sector": "compras", "role": "Coordenador de Compras", "password": "123456"},
    {"username": "compras", "name": "Rosiane Maciel", "sector": "compras", "role": "Comprador / Devoluções", "password": "123456"},

    # 6. SGI / Qualidade
    {"username": "coord.processos", "name": "Ricardo Vacilloto", "sector": "sgi", "role": "Coordenadora de SGI e Qualidade", "password": "123456"},

    # 7. Financeiro
    {"username": "p.mariano", "name": "Priscila Mariano", "sector": "financeiro", "role": "Gerência Financeira", "password": "123456"},

    # 8. Gestão, TI e Diretoria
    {"username": "ti01", "name": "Felipe Albuquerque", "sector": "ti", "role": "Analista de Sistemas / TI", "password": "admin123"},
    {"username": "ti02", "name": "Felipe Pinete", "sector": "ti", "role": "Analista de Sistemas / TI", "password": "admin123"},
    {"username": "gestor", "name": "Administração Central", "sector": "gestao", "role": "Gestão Geral / TI", "password": "admin123"},
    {"username": "germano", "name": "Germano", "sector": "diretoria", "role": "Diretor", "password": "admin123"},
    {"username": "vinicius", "name": "Vinicius", "sector": "diretoria", "role": "Diretor", "password": "admin123"},
    {"username": "a.nogueira", "name": "Andre Nogueira", "sector": "gerencia", "role": "Gerente de Operações", "password": "admin123"},
    {"username": "e.luchesi", "name": "Evaldo Luchesi", "sector": "gerencia", "role": "Gerente Industrial", "password": "admin123"},
    {"username": "r.carvalho", "name": "Rodrigo Carvalho", "sector": "gerencia", "role": "Gerente Comercial", "password": "admin123"},
    {"username": "l.reimberg", "name": "Laura Reimberg", "sector": "gerencia", "role": "Gerente Administrativo", "password": "admin123"},
]

def sync_official_users() -> Dict[str, int]:
    """Garante de forma idempotente que todos os usuarios corporativos existam no banco."""
    user_table = get_user_table()
    inserted = 0
    updated = 0
    now_iso = datetime.now().isoformat()

    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        for u in OFFICIAL_USERS:
            uname = u["username"].strip().lower()
            cursor.execute(f"SELECT id, password FROM {user_table} WHERE username = ?", (uname,))
            row = cursor.fetchone()
            
            if not row:
                cursor.execute(f"""
                INSERT INTO {user_table} (username, name, sector, role, password, ativo, created_at)
                VALUES (?, ?, ?, ?, ?, 1, ?)
                """, (uname, u["name"], u["sector"], u["role"], u["password"], now_iso))
                inserted += 1
            else:
                curr_pwd = row[1] if len(row) > 1 else None
                new_pwd = curr_pwd or u["password"]
                cursor.execute(f"""
                UPDATE {user_table} 
                SET name = ?, sector = ?, role = ?, password = ?, ativo = 1
                WHERE username = ?
                """, (u["name"], u["sector"], u["role"], new_pwd, uname))
                updated += 1

        try:
            conn.commit()
        except Exception:
            pass
        conn.close()
        print(f"[NEXRNC USUARIOS] Sincronizacao concluida: {inserted} inseridos, {updated} atualizados.")
        return {"inserted": inserted, "updated": updated, "total": len(OFFICIAL_USERS)}
    except Exception as e:
        print(f"[NEXRNC ALERTA] Falha na sincronizacao de usuarios: {e}")
        return {"error": str(e), "inserted": inserted, "updated": updated}
