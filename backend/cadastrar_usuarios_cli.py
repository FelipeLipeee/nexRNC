"""
cadastrar_usuarios_cli.py - Script executavel para cadastrar usuarios no SQL Server
"""
import sys
from pathlib import Path

# Adiciona backend ao sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services.user_sync import sync_official_users

if __name__ == "__main__":
    print("=" * 70)
    print("   CADASTRO DE USUARIOS CORPORATIVOS - nexRNC (SQL SERVER 10.1.1.8)")
    print("=" * 70)
    res = sync_official_users()
    print("Resultado da operacao:")
    for k, v in res.items():
        print(f"  - {k}: {v}")
    print("=" * 70)
