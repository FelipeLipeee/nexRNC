from typing import Optional
from fastapi import APIRouter
from ..services.bi_service import BiService

router = APIRouter(prefix="/api/bi", tags=["BI & Analytics"])

@router.get("/metrics")
def get_bi_metrics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    tipo_fluxo: Optional[str] = None,
    sector: Optional[str] = None
):
    return BiService.get_executive_metrics(
        start_date=start_date,
        end_date=end_date,
        tipo_fluxo=tipo_fluxo,
        sector=sector
    )
