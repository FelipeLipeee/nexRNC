import os
from pathlib import Path

import shutil

BASE_DIR = Path(__file__).resolve().parent.parent

# Carrega .env se existir
env_path = BASE_DIR / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k_clean = k.strip()
                if k_clean not in os.environ:
                    os.environ[k_clean] = v.strip().strip("'\"")

DATA_DIR = BASE_DIR / "data"

# Diretorio desacoplado de uploads (persiste mesmo ao substituir o pacote do servidor)
# 1. Prioridade: Variavel de ambiente ou .env
# 2. Servidor de Producao: C:\nexrnc_dados\uploads
# 3. Fallback: backend/uploads
env_upload = os.getenv("UPLOADS_DIR")
if env_upload:
    UPLOADS_DIR = Path(env_upload)
elif Path(r"C:\nexrnc_dados\uploads").exists() or Path(r"C:\nexrnc_dados").exists():
    UPLOADS_DIR = Path(r"C:\nexrnc_dados\uploads")
else:
    UPLOADS_DIR = BASE_DIR / "uploads"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)



DATABASE_PATH = DATA_DIR / "nexrnc.db"
API_HOST = "0.0.0.0"
API_PORT = 8001
CORS_ORIGINS = ["*"]

# Parametros corporativos SQL Server
DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_DATABASE = os.getenv("DB_DATABASE", "TEC_DESK")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_PORT = os.getenv("DB_PORT", "1433")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
USE_SQL_SERVER = os.getenv("USE_SQL_SERVER", "true").lower() in ("true", "1", "yes")
ALLOW_SQLITE_FALLBACK = os.getenv("ALLOW_SQLITE_FALLBACK", "false").lower() in ("true", "1", "yes")
