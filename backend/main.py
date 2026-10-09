from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import UPLOADS_DIR
from app.database import init_db
from app.seed import seed_database
from app.routers.rnc_router import router as rnc_router
from app.routers.bi_router import router as bi_router

app = FastAPI(
    title="nexrnc - Gestão e Esteira de RNCs Tecvidro",
    description="Motor de workflow setorial com rastreabilidade ponta a ponta e controle de SLA",
    version="1.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import urllib.parse

@app.get("/uploads/{filename:path}")
async def serve_upload(filename: str):
    """
    Serve uploaded files with automatic URL-decoding (spaces, parentheses, UTF-8).
    Prevents 404s when browsers encode filenames (e.g. WhatsApp images).
    """
    decoded_name = urllib.parse.unquote(filename).strip()
    resolved_dir = UPLOADS_DIR.resolve()
    target = (resolved_dir / decoded_name).resolve()

    # Security: Directory traversal protection
    if not str(target).startswith(str(resolved_dir)):
        raise HTTPException(status_code=403, detail="Acesso negado")

    # 1. Direct match with unquoted name
    if target.is_file():
        return FileResponse(str(target))

    # 2. Match with raw filename (fallback)
    raw_target = (resolved_dir / filename).resolve()
    if raw_target.is_file() and str(raw_target).startswith(str(resolved_dir)):
        return FileResponse(str(raw_target))

    # 3. Match with space <-> underscore variants
    alt1 = (resolved_dir / decoded_name.replace(" ", "_")).resolve()
    if alt1.is_file() and str(alt1).startswith(str(resolved_dir)):
        return FileResponse(str(alt1))

    alt2 = (resolved_dir / decoded_name.replace("_", " ")).resolve()
    if alt2.is_file() and str(alt2).startswith(str(resolved_dir)):
        return FileResponse(str(alt2))

    # 4. Case-insensitive lookup (if filesystem differences occur)
    if resolved_dir.is_dir():
        lower_decoded = decoded_name.lower()
        for child in resolved_dir.iterdir():
            if child.is_file() and child.name.lower() == lower_decoded:
                return FileResponse(str(child))

    raise HTTPException(status_code=404, detail="Arquivo não encontrado no servidor")

app.include_router(rnc_router)
app.include_router(bi_router)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()
    try:
        from app.services.user_sync import sync_official_users
        sync_official_users()
    except Exception as e:
        print(f"[USER SYNC ERROR] Falha ao sincronizar usuarios: {e}")
    try:
        from app.services.sla_notifier import start_sla_alert_worker
        start_sla_alert_worker()
    except Exception as e:
        print(f"[SLA STARTUP ERROR] Falha ao iniciar worker de SLA: {e}")

# Mount static frontend for unified single-port deployment (port 3010)
static_dist = Path(__file__).resolve().parent / "static"
if not static_dist.exists():
    static_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if static_dist.exists() and (static_dist / "index.html").exists():
    assets_dir = static_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(str(static_dist / "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = static_dist / full_path
        if candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(static_dist / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3010, reload=True)
