import os
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import DB_SERVER, DB_DATABASE, DB_USER, DB_PORT
from app.database import get_available_driver, get_sql_conn_string

def run_diagnostics():
    print("=" * 70)
    print("   DIAGNOSTICO DE CONEXAO nexRNC COM SQL SERVER (10.1.1.8)")
    print("=" * 70)
    print(f"Servidor Alvo:  {DB_SERVER}:{DB_PORT}")
    print(f"Base de Dados:  {DB_DATABASE}")
    print(f"Usuario:        {DB_USER}")
    
    # 1. ODBC Drivers
    try:
        import pyodbc
        drivers = pyodbc.drivers()
        print(f"\n[1] Drivers ODBC instalados no sistema ({len(drivers)}):")
        for d in drivers:
            print(f"    - {d}")
        best_driver = get_available_driver()
        print(f"    --> Driver selecionado para conexao: '{best_driver}'")
    except Exception as e:
        print(f"\n[ERRO CRITICO] Modulo pyodbc nao disponivel no Python: {e}")
        return 1

    # 2. Teste de Conexao de Rede e Autenticacao
    print(f"\n[2] Testando socket e autenticacao com {DB_SERVER} ({DB_DATABASE})...")
    conn_str = get_sql_conn_string()
    try:
        conn = pyodbc.connect(conn_str, timeout=6)
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION, DB_NAME()")
        row = cursor.fetchone()
        version_line = row[0].split("\n")[0] if row else "Desconhecido"
        dbname = row[1] if row else DB_DATABASE
        print("    [SUCESSO] Conectado ao SQL Server com sucesso!")
        print(f"    - Base ativa:     {dbname}")
        print(f"    - Versao SGBD:    {version_line}")
    except Exception as e:
        print(f"\n[FALHA DE CONEXAO] Erro ao conectar ao SQL Server 10.1.1.8:")
        print(f"Detalhes: {e}")
        print("\nPossiveis causas:")
        print("1. Falta de rota/permissao de rede entre este computador e 10.1.1.8:1433.")
        print("2. A porta 1433 do SQL Server nao esta liberada no firewall do servidor.")
        print("3. O usuario configurado ou a senha estao incorretos.")
        print("=" * 70)
        return 1

    # 3. Validacao do Schema e Tabelas
    print("\n[3] Validando estrutura do schema 'rnc' no TEC_DESK:")
    cursor.execute("""
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'rnc'
    """)
    tables = [r[0].lower() for r in cursor.fetchall()]
    print(f"    - Tabelas encontradas no schema 'rnc': {tables}")

    required_tables = ["ocorrencia", "item", "historico", "anexo", "usuario"]
    missing_tables = [t for t in required_tables if t not in tables]

    if missing_tables:
        print(f"\n    [ATENCAO] As seguintes tabelas estao faltando: {missing_tables}")
        print("    -> EXECUTE O SCRIPT: backend\\sql\\criar_schema_e_tabelas_rnc.sql no SSMS!")
    else:
        print("    [OK] Todas as 5 tabelas do schema 'rnc' estao presentes!")

    # 4. Validacao de Colunas Criticas em rnc.ocorrencia
    if "ocorrencia" in tables:
        print("\n[4] Validando colunas em rnc.ocorrencia:")
        cursor.execute("""
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'rnc' AND TABLE_NAME = 'ocorrencia'
        """)
        cols = [r[0].lower() for r in cursor.fetchall()]
        
        check_cols = ["tipo_fluxo", "tipo_rnc", "fluxo_flexivel", "data_reclamacao", "setor_encaminhado", "compras_nf_devolucao"]
        missing_cols = [c for c in check_cols if c not in cols]
        if missing_cols:
            print(f"    [ATENCAO] Colunas ausentes em rnc.ocorrencia: {missing_cols}")
            print("    -> Reexecute o script backend\\sql\\criar_schema_e_tabelas_rnc.sql no SSMS para adiciona-las.")
        else:
            print(f"    [OK] Todas as colunas do novo fluxo (tipo_fluxo, tipo_rnc, etc.) estao presentes!")

        cursor.execute("SELECT COUNT(*) FROM rnc.ocorrencia")
        count_rnc = cursor.fetchone()[0]
        print(f"    - Total de RNCs cadastradas no SQL Server: {count_rnc:,}")

    # 5. Validacao de Sinonimos dbo.*
    print("\n[5] Validando sinonimos publicos (dbo.rncs, dbo.rnc_history):")
    cursor.execute("""
    SELECT name FROM sys.synonyms 
    WHERE name IN ('rncs', 'rnc_history', 'rnc_attachments', 'rnc_usuario')
    """)
    synonyms = [r[0] for r in cursor.fetchall()]
    print(f"    - Sinonimos encontrados: {synonyms}")
    if len(synonyms) < 4:
        print("    [ALERTA] Alguns sinonimos nao existem. O script SQL no SSMS cria-os automaticamente.")
    else:
        print("    [OK] Todos os sinonimos estao operacionais.")

    cursor.close()
    conn.close()

    print("\n" + "=" * 70)
    if not missing_tables and not (missing_cols if "ocorrencia" in tables else True):
        print("   [SUCESSO] SISTEMA PRONTO PARA PRODUCAO 100% NO SQL SERVER!")
        print("=" * 70)
        return 0
    else:
        print("   [PENDENCIA] Execute backend\\sql\\criar_schema_e_tabelas_rnc.sql no SSMS.")
        print("=" * 70)
        return 2

if __name__ == "__main__":
    sys.exit(run_diagnostics())
