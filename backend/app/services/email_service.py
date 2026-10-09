"""
email_service.py - Servico de Notificacoes por E-mail do nexRNC
Dispara e-mails corporativos em background para os setores responsaveis
a cada criacao, transicao de etapa, conclusao ou estouro de SLA.
"""

import os
import smtplib
import threading
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional
from .email_templates import render_email_template

logger = logging.getLogger("nexrnc.email")

def _get_env_bool(key: str, default: bool = False) -> bool:
    val = os.getenv(key, str(default)).strip().lower()
    return val in ("true", "1", "yes", "sim")

# Configuracoes de SMTP
SMTP_ENABLED = _get_env_bool("SMTP_ENABLED", False)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.office365.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", f"nexRNC Grupo Tec <{SMTP_USER}>" if SMTP_USER else "nexRNC <noreply@tecvidro.com.br>")
SMTP_TLS = _get_env_bool("SMTP_TLS", True)
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://10.1.1.7:3010")

# Contas e prefixos que NUNCA devem receber notificacoes (faturamento e vendedores externos)
BLOCKED_RECIPIENT_PREFIXES = ("faturamento", "g.dantas", "r.bessa")

def _sanitize_recipients(recipients: List[str]) -> List[str]:
    """Remove permanentemente destinatarios bloqueados (faturamento e vendedores externos)."""
    clean = []
    for r in recipients:
        item = r.strip()
        low = item.lower()
        if not low:
            continue
        is_blocked = any(low.startswith(b) or f"<{b}" in low or f"{b}@" in low for b in BLOCKED_RECIPIENT_PREFIXES)
        if not is_blocked and item not in clean:
            clean.append(item)
    return clean

# Mapeamento de e-mails setoriais (suporta multiplos separados por virgula)
SECTOR_EMAILS = {
    "comercial": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_COMERCIAL", "coord.comercial@grupotec.com.br").split(",") if e.strip()]),
    "expedicao": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_EXPEDICAO", "coord.expedicao@grupotec.com.br").split(",") if e.strip()]),
    "producao": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_PRODUCAO", "").split(",") if e.strip()]),
    "fiscal": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_COMPRAS", os.getenv("EMAIL_FISCAL", "compras@grupotec.com.br,coord.compras@grupotec.com.br")).split(",") if e.strip()]),
    "compras": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_COMPRAS", "compras@grupotec.com.br,coord.compras@grupotec.com.br").split(",") if e.strip()]),
    "estoque": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_ESTOQUE", "coord.estoque@grupotec.com.br").split(",") if e.strip()]),
    "estoque_beneficiado": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_ESTOQUE", "coord.estoque@grupotec.com.br").split(",") if e.strip()]),
    "estoque_acessorios": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_ESTOQUE", "coord.estoque@grupotec.com.br").split(",") if e.strip()]),
    "estoque_componentes": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_ESTOQUE", "coord.estoque@grupotec.com.br").split(",") if e.strip()]),
    "sgi": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_SGI", "coord.processos@grupotec.com.br").split(",") if e.strip()]),
    "financeiro": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_FINANCEIRO", "p.mariano@grupotec.com.br").split(",") if e.strip()]),
    "gestao": _sanitize_recipients([e.strip() for e in os.getenv("EMAIL_GESTAO", "").split(",") if e.strip()]),
}

SECTOR_NAMES = {
    "comercial": "Comercial / Vendas", "expedicao": "Expedição / Logística",
    "producao": "Produção / Inspeção Técnica", "fiscal": "Compras / Devoluções",
    "compras": "Compras / Suprimentos", "sgi": "SGI / Gestão da Qualidade",
    "financeiro": "Financeiro / Controladoria", "gestao": "Gestão e Diretoria",
    "estoque_beneficiado": "Estoque Beneficiado (Perfis)",
    "estoque_acessorios": "Estoque de Acessórios",
    "estoque_componentes": "Estoque de Componentes",
    "estoque": "Coordenação de Estoque",
}

STEP_TITLES = {
    "step_1_abertura": "Etapa 1: Abertura e Triagem",
    "step_2_expedicao": "Etapa 2: Recebimento Físico",
    "step_3_producao": "Etapa 3: Laudo Técnico",
    "step_4_compras": "Etapa 4: Devolução / Compras",
    "step_4_fiscal": "Etapa 4: Devolução / Compras",
    "step_4_1_escrituracao": "Etapa 4: Devolução / Compras",
    "step_5_sgi": "Etapa 5: Análise de Causa-Raiz (5 Porquês)",
    "step_6_comercial": "Etapa 6: Tratativa Comercial",
    "step_7_financeiro": "Etapa 7: Tratativa Financeira",
    "step_8_comercial": "Etapa 8: Encerramento Comercial",
    "step_8_encerramento": "Etapa 8: Encerramento Comercial",
    "concluido": "RNC Concluída", "cancelado": "RNC Cancelada",
}

USUARIOS_EMAIL_MAP = {
    # Vendedoras comerciais
    "vendas01": "vendas01@grupotec.com.br", "rafa": "vendas01@grupotec.com.br", "rafaela": "vendas01@grupotec.com.br", "pacheco": "vendas01@grupotec.com.br",
    "vendas02": "vendas02@grupotec.com.br", "ingrid": "vendas02@grupotec.com.br",
    "vendas03": "vendas03@grupotec.com.br", "fran": "vendas03@grupotec.com.br",
    "vendas04": "vendas04@grupotec.com.br", "claudia": "vendas04@grupotec.com.br",
    "coord.comercial": "coord.comercial@grupotec.com.br", "caroline": "coord.comercial@grupotec.com.br",
    # Administracao e TI
    "ti01": "ti01@grupotec.com.br",
    "ti02": "ti02@grupotec.com.br", "pinete": "ti02@grupotec.com.br",
    "gestor": "ti02@grupotec.com.br",
    "germano": "germano@grupotec.com.br",
    "vinicius": "vinicius@grupotec.com.br",
}

def _resolve_creator_emails(rnc_data: Dict[str, Any]) -> List[str]:
    """Retorna estritamente o e-mail de quem abriu a RNC + o coordenador do comercial."""
    criador = str(rnc_data.get("criado_por") or "").strip().lower()
    emails = []

    # 1. Coordenador Comercial SEMPRE recebe
    coord = os.getenv("EMAIL_COORD_COMERCIAL", "coord.comercial@grupotec.com.br").strip()
    if coord:
        emails.append(coord)

    # 2. Localiza o e-mail unico do criador
    creator_email = None
    for k, v in USUARIOS_EMAIL_MAP.items():
        if k in criador:
            creator_email = v
            break

    if not creator_email and "@" in criador:
        creator_email = criador

    if creator_email and creator_email not in emails:
        emails.append(creator_email)

    return _sanitize_recipients(list(dict.fromkeys(emails)))

def _send_email_thread(recipients: List[str], subject: str, html_body: str):
    """Executa o envio SMTP real ou log simulado em segundo plano (nao bloqueante)."""
    recipients = _sanitize_recipients(recipients)
    if not recipients:
        return

    if not SMTP_ENABLED or not SMTP_PASSWORD or not SMTP_SERVER:
        print(f"[EMAIL SIMULADO] Destinatarios: {', '.join(recipients)} | Assunto: {subject}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = ", ".join(recipients)
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=12)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=12)
            if SMTP_TLS:
                server.starttls()

        if SMTP_USER and SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)

        server.sendmail(SMTP_FROM, recipients, msg.as_string())
        server.quit()
        print(f"[EMAIL ENVIADO] Sucesso para: {', '.join(recipients)} | Assunto: {subject}")
    except Exception as e:
        print(f"[EMAIL ERRO] Falha ao disparar e-mail para {recipients}: {e}")

def _dispatch_async(recipients: List[str], subject: str, html_body: str):
    """Dispara o envio em thread daemon sem travar o endpoint."""
    t = threading.Thread(target=_send_email_thread, args=(recipients, subject, html_body), daemon=True)
    t.start()


class EmailNotificationService:
    @staticmethod
    def notify_rnc_created(rnc_data: Dict[str, Any]):
        """Disparado imediatamente apos a abertura de uma nova RNC."""
        protocol = rnc_data.get("protocol", "RNC")
        cliente = rnc_data.get("cliente", "")
        next_sector = rnc_data.get("current_sector", "expedicao")
        motivo = rnc_data.get("motivo_reclamacao", "")
        produto = rnc_data.get("produto_descricao", "")
        nf = rnc_data.get("nota_fiscal", "")

        sector_title = SECTOR_NAMES.get(next_sector, next_sector.upper())
        creator_emails = _resolve_creator_emails(rnc_data)

        dest_setor = SECTOR_EMAILS.get(next_sector, []) if next_sector != "comercial" else []
        recipients = list(dict.fromkeys(
            dest_setor +
            creator_emails +
            SECTOR_EMAILS.get("gestao", [])
        ))

        subject = f"[nexRNC] Nova Ocorrência Aberta: {protocol} - {cliente}"
        badge_text = "NOVA RNC REGISTRADA"
        title = f"Nova RNC destinada ao setor {sector_title}"

        details_html = f"""
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #92400e; font-size: 12px; text-transform: uppercase;">Motivo da Reclamação:</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #78350f;">{motivo}</p>
        </div>
        """

        html = render_email_template(
            app_base_url=APP_BASE_URL,
            title=title,
            protocol=protocol,
            badge_text=badge_text,
            sector_name=sector_title,
            cliente=cliente,
            produto=produto,
            nota_fiscal=nf,
            details_html=details_html,
            cta_text="Visualizar e Tratar RNC"
        )

        _dispatch_async(recipients, subject, html)

    @staticmethod
    def notify_step_transition(rnc_data: Dict[str, Any], prev_step: str, next_step: str, notes: str, user_name: str):
        """Disparado quando a RNC avanca de etapa para um novo setor."""
        protocol = rnc_data.get("protocol", "RNC")
        cliente = rnc_data.get("cliente", "")
        next_sector = rnc_data.get("current_sector", "")
        status = rnc_data.get("status", "em_andamento")
        produto = rnc_data.get("produto_descricao", "")
        nf = rnc_data.get("nota_fiscal", "")

        sector_title = SECTOR_NAMES.get(next_sector, next_sector.upper())
        step_title = STEP_TITLES.get(next_step, next_step)
        creator_emails = _resolve_creator_emails(rnc_data)

        if status == "concluido" or next_step == "concluido":
            recipients = list(dict.fromkeys(creator_emails + SECTOR_EMAILS.get("gestao", [])))
            subject = f"[nexRNC] Ocorrência Concluída: {protocol} - {cliente}"
            badge_text = "RNC FINALIZADA COM SUCESSO"
            title = "Processo de RNC Finalizado e Liquidado"
        else:
            dest_emails = SECTOR_EMAILS.get(next_sector, [])
            recipients = list(dict.fromkeys(dest_emails + creator_emails))
            subject = f"[nexRNC] Encaminhamento: {protocol} -> {sector_title}"
            badge_text = f"AGUARDANDO AÇÃO: {sector_title.upper()}"
            title = f"RNC avançou para {step_title}"

        details_html = f"""
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #475569; font-size: 11px; text-transform: uppercase;">Última Atualização ({user_name}):</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #0f172a;">{notes or 'Trâmite setorial registrado sem observações adicionais.'}</p>
        </div>
        """

        html = render_email_template(
            app_base_url=APP_BASE_URL,
            title=title,
            protocol=protocol,
            badge_text=badge_text,
            sector_name=sector_title,
            cliente=cliente,
            produto=produto,
            nota_fiscal=nf,
            details_html=details_html,
            cta_text="Acessar Fila do Setor"
        )

        _dispatch_async(recipients, subject, html)

    @staticmethod
    def notify_rnc_cancelled(rnc_data: Dict[str, Any], motivo: str, user_name: str):
        """Disparado quando uma RNC e cancelada."""
        protocol = rnc_data.get("protocol", "RNC")
        cliente = rnc_data.get("cliente", "")
        creator_emails = _resolve_creator_emails(rnc_data)
        recipients = list(dict.fromkeys(creator_emails + SECTOR_EMAILS.get("gestao", [])))

        subject = f"[nexRNC] Cancelamento: {protocol} - {cliente}"
        badge_text = "RNC CANCELADA"
        title = f"Ocorrência Cancelada por {user_name}"

        details_html = f"""
        <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase;">Motivo do Cancelamento:</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #7f1d1d;">{motivo}</p>
        </div>
        """

        html = render_email_template(
            app_base_url=APP_BASE_URL,
            title=title,
            protocol=protocol,
            badge_text=badge_text,
            sector_name="Comercial / Gestão",
            cliente=cliente,
            produto=rnc_data.get("produto_descricao", ""),
            nota_fiscal=rnc_data.get("nota_fiscal", ""),
            details_html=details_html,
            cta_text="Ver Histórico da RNC"
        )

        _dispatch_async(recipients, subject, html)

    @staticmethod
    def notify_step_return(rnc_data: Dict[str, Any], target_sector: str, motivo: str, user_name: str):
        """Notifica o setor destinatário quando uma RNC é devolvida para a etapa anterior."""
        protocol = rnc_data.get("protocol", "RNC")
        cliente = rnc_data.get("cliente", "")
        sector_title = SECTOR_NAMES.get(target_sector, target_sector.upper())
        recipients = list(dict.fromkeys(SECTOR_EMAILS.get(target_sector, []) + _resolve_creator_emails(rnc_data)))
        if not recipients:
            return
        subject = f"[RETORNO DE ETAPA] RNC {protocol} - Devolvida para {sector_title}: {cliente}"
        badge_text = f"RETORNO DE ETAPA • {sector_title.upper()}"
        title = f"RNC {protocol} foi devolvida ao setor {sector_title}"
        details_html = f"""<div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #92400e; font-size: 12px; text-transform: uppercase;">Devolvida por {user_name}:</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #78350f;"><strong>Motivo do Retorno:</strong> {motivo}</p>
        </div>"""
        html = render_email_template(
            app_base_url=APP_BASE_URL, title=title, protocol=protocol, badge_text=badge_text,
            sector_name=sector_title, cliente=cliente, produto=rnc_data.get("produto_descricao", ""),
            nota_fiscal=rnc_data.get("nota_fiscal", ""), details_html=details_html, cta_text="Ver Ocorrência Devolvida"
        )
        _dispatch_async(recipients, subject, html)

    @staticmethod
    def notify_sla_overdue(rnc_data: Dict[str, Any], hours_remaining: int):
        """Disparado quando a RNC estoura o SLA. Envia para o setor sob custodia e gestao."""
        protocol = rnc_data.get("protocol", "RNC")
        cliente = rnc_data.get("cliente", "")
        current_sector = rnc_data.get("current_sector", "")
        current_step = rnc_data.get("current_step", "")

        sector_title = SECTOR_NAMES.get(current_sector, current_sector.upper())
        step_title = STEP_TITLES.get(current_step, current_step)

        recipients = list(dict.fromkeys(SECTOR_EMAILS.get(current_sector, []) + SECTOR_EMAILS.get("gestao", [])))
        if not recipients:
            return

        tempo_atraso = f"{abs(hours_remaining)}h de atraso" if hours_remaining < 0 else "Prazo estourado"
        subject = f"[ALERTA DE SLA] Prazo Vencido no seu Setor: {protocol} - {cliente}"
        badge_text = f"SLA EXPIRADO • {sector_title.upper()}"
        title = f"Ocorrência {protocol} está aguardando ação do seu setor"

        details_html = f"""
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase;">Etapa em Atraso ({step_title}):</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #7f1d1d; font-weight: 600;">Situação: {tempo_atraso}</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #4b5563;">
            Esta RNC está sob custódia de <strong>{sector_title}</strong> e excedeu a meta de SLA.
            Acesse o sistema para dar o andamento necessário na esteira.
          </p>
        </div>
        """

        html = render_email_template(
            app_base_url=APP_BASE_URL,
            title=title,
            protocol=protocol,
            badge_text=badge_text,
            sector_name=sector_title,
            cliente=cliente,
            produto=rnc_data.get("produto_descricao", ""),
            nota_fiscal=rnc_data.get("nota_fiscal", ""),
            details_html=details_html,
            cta_text="Acessar Fila do Setor Agora"
        )

        _dispatch_async(recipients, subject, html)
