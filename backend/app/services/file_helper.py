import os
import re
import unicodedata
from pathlib import Path

def sanitize_filename(filename: str) -> str:
    """
    Sanitiza nomes de arquivos para armazenamento seguro no disco e compatibilidade HTTP,
    removendo acentos, espacos e caracteres especiais, preservando a extensao.
    """
    raw = Path(filename).name
    stem = Path(raw).stem
    ext = Path(raw).suffix.lower()
    
    # Normaliza remocao de acentos (ex: acao -> acao)
    normalized = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode("ascii")
    # Substitui espacos, parenteses e caracteres especiais por underscore
    safe_stem = re.sub(r"[^\w\.-]", "_", normalized)
    safe_stem = re.sub(r"_+", "_", safe_stem).strip("_")
    if not safe_stem:
        safe_stem = "anexo"
    return f"{safe_stem}{ext}"

def get_attachment_category(filename: str, default: str = "arquivo") -> str:
    """Detecta categoria do arquivo com base na extensao."""
    ext = Path(filename).suffix.lower()
    if ext in [".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"]:
        return "video"
    if ext == ".pdf":
        return "pdf"
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]:
        return "foto"
    return default
