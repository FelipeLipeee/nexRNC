import os
import sqlite3
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path
from .config import (
    DATABASE_PATH, DB_SERVER, DB_DATABASE, DB_USER,
    DB_PASSWORD, DB_PORT, DB_DRIVER, USE_SQL_SERVER,
    ALLOW_SQLITE_FALLBACK
)

def get_available_driver() -> str:
    configured = DB_DRIVER
    try:
        import pyodbc
        installed = pyodbc.drivers()
        if configured in installed:
            return configured
        for cand in [
            "ODBC Driver 18 for SQL Server",
            "ODBC Driver 17 for SQL Server",
            "ODBC Driver 13 for SQL Server",
            "ODBC Driver 11 for SQL Server",
            "SQL Server Native Client 11.0",
            "SQL Server",
        ]:
            if cand in installed:
                return cand
    except Exception:
        pass
    return configured

def get_sql_conn_string() -> str:
    driver = get_available_driver()
    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={DB_SERVER},{DB_PORT};"
        f"DATABASE={DB_DATABASE};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )
    if "18" in driver:
        conn_str += "Encrypt=no;"
    return conn_str

_cached_mode = None
_last_error = None

def detect_db_mode(force_refresh: bool = False) -> str:
    global _cached_mode, _last_error
    if not USE_SQL_SERVER:
        _cached_mode = "sqlite"
        return "sqlite"
    
    if _cached_mode and not force_refresh:
        return _cached_mode

    try:
        import pyodbc
        conn_str = get_sql_conn_string()
        conn = pyodbc.connect(conn_str, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'rnc' AND TABLE_NAME = 'ocorrencia'")
        row = cursor.fetchone()
        conn.close()
        if row:
            _cached_mode = "sql_server"
            _last_error = None
            print(f"[NEXRNC] Conexao com SQL Server {DB_SERVER} ({DB_DATABASE}) estabelecida com sucesso!")
            return "sql_server"
        else:
            _last_error = f"Tabela rnc.ocorrencia nao encontrada no banco {DB_DATABASE}. Execute criar_schema_e_tabelas_rnc.sql no SSMS."
            if ALLOW_SQLITE_FALLBACK:
                _cached_mode = "sqlite"
                print(f"[NEXRNC ALERTA - CONTINGENCIA] {_last_error} Usando SQLite local.")
                return "sqlite"
            _cached_mode = "error"
            print(f"[NEXRNC ERRO CRITICO] {_last_error}")
            return "error"
    except Exception as e:
        _last_error = str(e)
        if ALLOW_SQLITE_FALLBACK:
            _cached_mode = "sqlite"
            print(f"[NEXRNC ALERTA - CONTINGENCIA] Falha SQL Server {DB_SERVER} ({e}). Usando SQLite local.")
            return "sqlite"
        _cached_mode = "error"
        print(f"[NEXRNC ERRO CRITICO] Falha ao conectar no SQL Server {DB_SERVER}: {e}")
        return "error"

def serialize_val(v: Any) -> Any:
    if isinstance(v, datetime):
        return v.isoformat()
    return v

def row_to_dict(cursor, row) -> Optional[Dict[str, Any]]:
    if not row:
        return None
    if isinstance(row, sqlite3.Row):
        return {k: serialize_val(row[k]) for k in row.keys()}
    columns = [col[0] for col in cursor.description]
    return {k: serialize_val(v) for k, v in zip(columns, row)}

def rows_to_dicts(cursor, rows) -> list:
    if not rows:
        return []
    if len(rows) > 0 and isinstance(rows[0], sqlite3.Row):
        return [{k: serialize_val(r[k]) for k in r.keys()} for r in rows]
    columns = [col[0] for col in cursor.description]
    return [{k: serialize_val(v) for k, v in zip(columns, r)} for r in rows]

def get_connection():
    mode = detect_db_mode()
    if mode == "sql_server":
        try:
            import pyodbc
            return pyodbc.connect(get_sql_conn_string(), timeout=10)
        except Exception as e:
            raise RuntimeError(f"Erro ao conectar com SQL Server {DB_SERVER}: {e}")

    if mode == "error":
        raise RuntimeError(
            f"FALHA CRITICA DE BANCO DE DADOS: O sistema opera no SQL Server {DB_SERVER} ({DB_DATABASE}), "
            f"mas a conexao ou schema falhou ({_last_error}). "
            f"O fallback para SQLite esta desativado para garantir a integridade dos dados."
        )

    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def test_db_connection() -> Dict[str, Any]:
    mode = detect_db_mode(force_refresh=True)
    if mode == "sql_server":
        try:
            import pyodbc
            conn = pyodbc.connect(get_sql_conn_string(), timeout=5)
            cursor = conn.cursor()
            cursor.execute("SELECT @@VERSION as ver, DB_NAME() as db")
            row = cursor.fetchone()
            conn.close()
            return {
                "engine": "Microsoft SQL Server",
                "database": row[1] if row else DB_DATABASE,
                "server": DB_SERVER,
                "status": "online",
                "schema": "rnc"
            }
        except Exception as e:
            return {
                "engine": "Microsoft SQL Server (Falha)",
                "status": "offline",
                "detail": str(e)
            }
    
    if mode == "error":
        return {
            "engine": "Microsoft SQL Server (Inacessivel)",
            "database": DB_DATABASE,
            "server": DB_SERVER,
            "status": "offline",
            "schema": "rnc",
            "detail": _last_error or "Tabela rnc.ocorrencia ausente ou porta 1433 inacessivel.",
            "solucao": f"Execute o script 'backend/sql/criar_schema_e_tabelas_rnc.sql' no SSMS ou verifique conectividade com {DB_SERVER}."
        }

    return {
        "engine": "SQLite 3 (Contingencia)",
        "database": str(DATABASE_PATH),
        "status": "online",
        "schema": "local",
        "motivo_sqlite": _last_error or "Fallback acionado manualmente"
    }

def get_user_table() -> str:
    return "dbo.rnc_usuario" if detect_db_mode() == "sql_server" else "rnc_usuario"

def get_item_table() -> str:
    return "rnc.item" if detect_db_mode() == "sql_server" else "rnc_itens"

def get_rnc_table() -> str:
    return "dbo.rncs" if detect_db_mode() == "sql_server" else "rncs"

def get_history_table() -> str:
    return "dbo.rnc_history" if detect_db_mode() == "sql_server" else "rnc_history"

def init_db():
    mode = detect_db_mode()
    if mode == "sql_server":
        try:
            import pyodbc
            conn = pyodbc.connect(get_sql_conn_string(), timeout=10)
            cursor = conn.cursor()
            cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'rnc')
                EXEC('CREATE SCHEMA rnc AUTHORIZATION dbo;');
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario' AND schema_id = SCHEMA_ID('rnc'))
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.usuario') AND name = 'password')
                    ALTER TABLE rnc.usuario ADD password VARCHAR(255) NULL;
            END
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ocorrencia' AND schema_id = SCHEMA_ID('rnc'))
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'tipo_fluxo')
                    ALTER TABLE rnc.ocorrencia ADD tipo_fluxo VARCHAR(50) DEFAULT 'padrao';
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'tipo_rnc')
                    ALTER TABLE rnc.ocorrencia ADD tipo_rnc VARCHAR(50) DEFAULT 'Cliente';
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'data_reclamacao')
                    ALTER TABLE rnc.ocorrencia ADD data_reclamacao DATE NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'fluxo_flexivel')
                    ALTER TABLE rnc.ocorrencia ADD fluxo_flexivel BIT DEFAULT 0;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'setor_encaminhado')
                    ALTER TABLE rnc.ocorrencia ADD setor_encaminhado VARCHAR(50) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'producao_itens_json')
                    ALTER TABLE rnc.ocorrencia ADD producao_itens_json NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'compras_nf_devolucao')
                    ALTER TABLE rnc.ocorrencia ADD compras_nf_devolucao VARCHAR(40) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'compras_data')
                    ALTER TABLE rnc.ocorrencia ADD compras_data DATETIME2 NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'sgi_liberado')
                    ALTER TABLE rnc.ocorrencia ADD sgi_liberado BIT DEFAULT 0;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'sgi_observacoes')
                    ALTER TABLE rnc.ocorrencia ADD sgi_observacoes NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'financeiro_obs')
                    ALTER TABLE rnc.ocorrencia ADD financeiro_obs NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'financeiro_data')
                    ALTER TABLE rnc.ocorrencia ADD financeiro_data DATETIME2 NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'comercial_fechamento_obs')
                    ALTER TABLE rnc.ocorrencia ADD comercial_fechamento_obs NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'comercial_concluido_por')
                    ALTER TABLE rnc.ocorrencia ADD comercial_concluido_por VARCHAR(100) NULL;
            END
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'rncs')
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rncs') AND name = 'financeiro_obs')
                    ALTER TABLE rncs ADD financeiro_obs NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rncs') AND name = 'financeiro_data')
                    ALTER TABLE rncs ADD financeiro_data DATETIME2 NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rncs') AND name = 'comercial_fechamento_obs')
                    ALTER TABLE rncs ADD comercial_fechamento_obs NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rncs') AND name = 'comercial_concluido_por')
                    ALTER TABLE rncs ADD comercial_concluido_por VARCHAR(100) NULL;
            END
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'item' AND schema_id = SCHEMA_ID('rnc'))
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.item') AND name = 'unidade_medida')
                    ALTER TABLE rnc.item ADD unidade_medida VARCHAR(20) DEFAULT 'UN';
            END
            """)
            conn.commit()
            conn.close()
            print("[NEXRNC] Schema SQL Server verificado e sincronizado.")
        except Exception as e:
            print(f"[NEXRNC ALERTA] Erro na sincronizacao inicial do schema SQL Server: {e}")
        return

    if mode == "error":
        print("[NEXRNC ERRO CRITICO] O servidor nao iniciou em SQLite porque ALLOW_SQLITE_FALLBACK=false.")
        print(f"[NEXRNC ERRO CRITICO] Execute criar_schema_e_tabelas_rnc.sql no SSMS ({DB_SERVER} - {DB_DATABASE}).")
        return

    # Inicializa SQLite local apenas se autorizado expressamente
    conn = sqlite3.connect(DATABASE_PATH)
    with conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS rnc_usuario (
            id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL, sector TEXT NOT NULL, role TEXT NOT NULL,
            password TEXT, ativo INTEGER DEFAULT 1, created_at TEXT NOT NULL
        )
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS rncs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, protocol TEXT UNIQUE NOT NULL,
            current_step TEXT NOT NULL, current_sector TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'em_andamento', cliente TEXT NOT NULL,
            nota_fiscal TEXT, pedido_sankhya TEXT, produto_descricao TEXT NOT NULL,
            motivo_reclamacao TEXT NOT NULL, quantidade REAL DEFAULT 1,
            tipo_material TEXT DEFAULT 'perfil', devolucao_autorizada INTEGER DEFAULT 1,
            recebimento_data TEXT, recebimento_volumes INTEGER, recebimento_avaria_visivel INTEGER,
            recebimento_obs TEXT, laudo_procedencia TEXT, laudo_defeito_tecnico TEXT,
            laudo_destinacao TEXT, laudo_responsavel TEXT, laudo_data TEXT,
            fiscal_nf_devolucao TEXT, fiscal_data_escrituracao TEXT, sgi_causa_raiz TEXT,
            sgi_acao_corretiva TEXT, sgi_homologado_por TEXT, comercial_tratativa TEXT,
            comercial_detalhes TEXT, financeiro_tipo_operacao TEXT, financeiro_valor REAL DEFAULT 0,
            financeiro_concluido_por TEXT, financeiro_obs TEXT, financeiro_data TEXT,
            comercial_fechamento_obs TEXT, comercial_concluido_por TEXT,
            sla_deadline TEXT, criado_por TEXT NOT NULL,
            criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL, fluxo_flexivel INTEGER DEFAULT 0,
            tipo_fluxo TEXT DEFAULT 'padrao', tipo_rnc TEXT DEFAULT 'Cliente',
            setor_encaminhado TEXT, producao_itens_json TEXT, sgi_liberado INTEGER DEFAULT 0,
            sgi_observacoes TEXT, compras_nf_devolucao TEXT, compras_data TEXT,
            data_reclamacao TEXT, motivo_cancelamento TEXT
        )
        """)
        # Safe alter columns for existing SQLite tables
        for col_def in [
            "financeiro_obs TEXT",
            "financeiro_data TEXT",
            "comercial_fechamento_obs TEXT",
            "comercial_concluido_por TEXT"
        ]:
            try:
                conn.execute(f"ALTER TABLE rncs ADD COLUMN {col_def}")
            except Exception:
                pass
        conn.execute("""
        CREATE TABLE IF NOT EXISTS rnc_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT, rnc_id INTEGER NOT NULL,
            tipo_material TEXT NOT NULL, produto_descricao TEXT NOT NULL,
            quantidade REAL NOT NULL DEFAULT 1, unidade_medida TEXT DEFAULT 'UN',
            FOREIGN KEY (rnc_id) REFERENCES rncs(id) ON DELETE CASCADE
        )
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS rnc_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT, rnc_id INTEGER NOT NULL,
            step TEXT NOT NULL, sector TEXT NOT NULL, action TEXT NOT NULL,
            user_name TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL,
            FOREIGN KEY (rnc_id) REFERENCES rncs(id) ON DELETE CASCADE
        )
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS rnc_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT, rnc_id INTEGER NOT NULL,
            step TEXT NOT NULL, file_name TEXT NOT NULL, file_path TEXT NOT NULL,
            category TEXT NOT NULL, uploaded_by TEXT NOT NULL, created_at TEXT NOT NULL,
            FOREIGN KEY (rnc_id) REFERENCES rncs(id) ON DELETE CASCADE
        )
        """)
    conn.close()
