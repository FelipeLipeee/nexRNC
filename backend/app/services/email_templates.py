"""
email_templates.py - Renderizacao visual dos e-mails institucionais do nexRNC
Gera HTML corporativo responsivo e padronizado com a marca do Grupo Tec.
"""

def render_email_template(
    app_base_url: str,
    title: str,
    protocol: str,
    badge_text: str,
    sector_name: str,
    cliente: str,
    produto: str,
    nota_fiscal: str,
    details_html: str,
    cta_text: str = "Acessar RNC no Sistema"
) -> str:
    """Gera um e-mail HTML executivo com identidade visual institucional do Grupo Tec."""
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <style>
        body {{ margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }}
        .wrapper {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ background-color: #0f172a; padding: 24px; color: #ffffff; border-bottom: 4px solid #ea580c; }}
        .brand-title {{ font-size: 18px; font-weight: bold; letter-spacing: -0.5px; margin: 0; }}
        .brand-sub {{ font-size: 12px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }}
        .body {{ padding: 28px 24px; }}
        .badge {{ display: inline-block; padding: 6px 12px; background-color: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }}
        .protocol-box {{ background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 14px 18px; margin: 16px 0 24px 0; border-radius: 0 8px 8px 0; }}
        .protocol-number {{ font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; font-family: monospace; }}
        .table-info {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
        .table-info td {{ padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }}
        .table-info td.label {{ color: #64748b; font-weight: 600; width: 35%; }}
        .table-info td.val {{ color: #0f172a; font-weight: 500; }}
        .cta-btn {{ display: inline-block; background-color: #ea580c; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; text-align: center; margin: 10px 0; }}
        .footer {{ background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand-title">nexRNC • Grupo Tec</div>
          <div class="brand-sub">Sistema de Gestão de Não Conformidades & SGI</div>
        </div>
        <div class="body">
          <div class="badge">{badge_text}</div>
          <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 8px 0;">{title}</h2>
          <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">
            A ocorrência abaixo foi encaminhada para a fila de ação do setor <strong>{sector_name}</strong>.
          </p>

          <div class="protocol-box">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Protocolo de Rastreabilidade:</div>
            <div class="protocol-number">{protocol}</div>
          </div>

          <table class="table-info">
            <tr><td class="label">Cliente / Razão Social:</td><td class="val">{cliente or 'Não informado'}</td></tr>
            <tr><td class="label">Produto / Material:</td><td class="val">{produto or 'Não informado'}</td></tr>
            <tr><td class="label">Nota Fiscal:</td><td class="val">{nota_fiscal or 'Não informada'}</td></tr>
          </table>

          {details_html}

          <div style="text-align: center; margin-top: 24px;">
            <a href="{app_base_url}" class="cta-btn">{cta_text}</a>
          </div>
        </div>
        <div class="footer">
          Mensagem automática enviada pelo sistema nexRNC • Hospedado em {app_base_url}<br>
          Grupo Tecvidro • Sistema de Gestão Integrada (ISO 9001)
        </div>
      </div>
    </body>
    </html>
    """
