from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import BrandingSettings, BrandingSettingsUpdate
from app.services.branding_service import get_branding, update_branding, save_logo_file

router = APIRouter(prefix="/api/settings/branding", tags=["Branding & White-Label"])

@router.get("", response_model=BrandingSettings)
def read_branding():
    """
    Retorna as configuracoes de identidade visual e white-label da empresa atual.
    Endpoint publico para renderizacao da tela de login e cabeçalho.
    """
    data = get_branding()
    return BrandingSettings(**data)

@router.put("", response_model=BrandingSettings)
def modify_branding(payload: BrandingSettingsUpdate):
    """
    Atualiza dados de identidade visual (nome da empresa, cores institucionais e titulos).
    """
    updated = update_branding(payload.model_dump(exclude_unset=True))
    return BrandingSettings(**updated)

@router.post("/logo", response_model=BrandingSettings)
async def upload_logo(file: UploadFile = File(...)):
    """
    Faz upload de logomarca institucional e atualiza a URL do branding.
    """
    content_type = file.content_type or ""
    if not (content_type.startswith("image/") or file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".svg", ".webp"))):
        raise HTTPException(status_code=400, detail="Formato invalido. Envie um arquivo de imagem (PNG, JPG, SVG ou WebP).")

    logo_url = save_logo_file(file)
    updated = update_branding({"logo_url": logo_url})
    return BrandingSettings(**updated)
