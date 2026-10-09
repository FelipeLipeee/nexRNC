"""
demo_router.py - Rotas da API para o Modo Demonstracao Industrial (Sandbox)
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from ..services.demo_service import DemoService

router = APIRouter(prefix="/api/demo", tags=["demo"])

class DemoResponse(BaseModel):
    success: bool
    message: str
    inserted_count: Optional[int] = None
    db_mode: Optional[str] = None

@router.get("/status")
def get_demo_status():
    """Retorna se o modo demo esta ativo e metricas de ocorrencias."""
    try:
        return DemoService.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seed", response_model=DemoResponse)
def seed_demo(clear_existing: bool = Query(True, description="Limpar dados demo anteriores antes de semear")):
    """Carrega dados industriais realistas cobrindo todas as 8 etapas e cenarios de SLA."""
    try:
        res = DemoService.seed_demo_data(clear_existing=clear_existing)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset", response_model=DemoResponse)
def reset_data(only_demo: bool = Query(False, description="Se True limpa apenas RNCs demo; se False zera todas as RNCs")):
    """Limpa ocorrencias mantendo usuarios e seguranca intactos."""
    try:
        res = DemoService.reset_data(only_demo=only_demo)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
