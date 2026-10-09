import os
import sys

# Garante path para importar app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import get_connection, detect_db_mode

def run_migration():
    print("=" * 60)
    print("  MIGRACAO DE COLUNAS - SQL SERVER / RNC")
    print("=" * 60)
    
    mode = detect_db_mode(force_refresh=True)
    print(f"Modo detectado: {mode}")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cols_to_add = [
        ("financeiro_obs", "NVARCHAR(MAX) NULL"),
        ("financeiro_data", "DATETIME2 NULL"),
        ("comercial_fechamento_obs", "NVARCHAR(MAX) NULL"),
        ("comercial_concluido_por", "VARCHAR(100) NULL"),
    ]
    
    tables = ["rncs", "dbo.rncs", "rnc.ocorrencia"]
    
    for tbl in tables:
        try:
            print(f"\nVerificando tabela: {tbl}...")
            for col_name, col_type in cols_to_add:
                sql = f"""
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('{tbl}') AND name = '{col_name}')
                BEGIN
                    ALTER TABLE {tbl} ADD {col_name} {col_type};
                    PRINT 'Coluna {col_name} adicionada em {tbl}';
                END
                ELSE
                BEGIN
                    PRINT 'Coluna {col_name} ja existe em {tbl}';
                END
                """
                cursor.execute(sql)
                conn.commit()
                print(f"  [OK] {col_name}")
        except Exception as e:
            print(f"  [AVISO] {tbl}: {e}")
            
    conn.close()
    print("\n" + "=" * 60)
    print("  MIGRACAO CONCLUIDA COM SUCESSO!")
    print("=" * 60)

if __name__ == "__main__":
    run_migration()
