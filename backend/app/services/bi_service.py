from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict
from ..database import get_connection, rows_to_dicts
from ..models import STEP_LABELS

class BiService:
    @staticmethod
    def get_executive_metrics(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        tipo_fluxo: Optional[str] = None,
        sector: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gera o dataset analítico e executivo consolidado para a Diretoria e Gerência.
        Compatível com SQL Server (dbo.rncs) e contingência local.
        """
        conn = get_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM rncs WHERE 1=1"
        params: List[Any] = []

        if start_date:
            query += " AND (criado_em >= ? OR data_reclamacao >= ?)"
            params.extend([f"{start_date}T00:00:00", start_date])
        if end_date:
            query += " AND (criado_em <= ? OR data_reclamacao <= ?)"
            params.extend([f"{end_date}T23:59:59", end_date])
        if tipo_fluxo and tipo_fluxo != "todos":
            query += " AND tipo_fluxo = ?"
            params.append(tipo_fluxo)
        if sector and sector != "todos":
            query += " AND current_sector = ?"
            params.append(sector)

        query += " ORDER BY id DESC"
        cursor.execute(query, params)
        rows = rows_to_dicts(cursor, cursor.fetchall())
        conn.close()

        now = datetime.now()
        total = len(rows)

        # 1. Sumário Executivo
        em_andamento = [r for r in rows if r.get("status") == "em_andamento"]
        concluidas = [r for r in rows if r.get("status") == "concluido"]
        canceladas = [r for r in rows if r.get("status") == "cancelado"]

        total_valor = sum(float(r.get("financeiro_valor") or 0.0) for r in rows)
        total_credito = sum(1 for r in rows if r.get("tipo_fluxo") == "financeiro")
        total_fisico = total - total_credito

        # Lead Time Médio (apenas RNCs concluídas)
        lead_times_days: List[float] = []
        for r in concluidas:
            try:
                c_str = str(r.get("criado_em") or "").replace("Z", "")
                f_str = str(r.get("atualizado_em") or "").replace("Z", "")
                if c_str and f_str:
                    d_start = datetime.fromisoformat(c_str[:19])
                    d_end = datetime.fromisoformat(f_str[:19])
                    lead_times_days.append(max(0.1, (d_end - d_start).total_seconds() / 86400.0))
            except Exception:
                pass
        lead_time_medio = round(sum(lead_times_days) / len(lead_times_days), 1) if lead_times_days else 0.0

        # Taxa de Cumprimento de SLA Global
        sla_avaliados = 0
        sla_no_prazo = 0
        for r in rows:
            dead_raw = r.get("sla_deadline")
            if not dead_raw:
                continue
            try:
                deadline = datetime.fromisoformat(str(dead_raw).replace("Z", "")[:19])
                sla_avaliados += 1
                if r.get("status") == "concluido":
                    f_str = str(r.get("atualizado_em") or "").replace("Z", "")
                    end_dt = datetime.fromisoformat(f_str[:19]) if f_str else now
                    if end_dt <= deadline:
                        sla_no_prazo += 1
                else:
                    if now <= deadline:
                        sla_no_prazo += 1
            except Exception:
                pass
        sla_taxa = round((sla_no_prazo / sla_avaliados * 100), 1) if sla_avaliados > 0 else 100.0

        # 2. Gargalos Operacionais por Setor (Onde estão paradas as ativas)
        sector_counts: Dict[str, int] = defaultdict(int)
        sector_hours: Dict[str, List[float]] = defaultdict(list)
        for r in em_andamento:
            sec = str(r.get("current_sector") or "comercial").lower()
            sector_counts[sec] += 1
            try:
                up_str = str(r.get("atualizado_em") or r.get("criado_em") or "").replace("Z", "")
                if up_str:
                    up_dt = datetime.fromisoformat(up_str[:19])
                    sector_hours[sec].append(max(0.5, (now - up_dt).total_seconds() / 3600.0))
            except Exception:
                pass

        sectors_order = [
            ("comercial", "Comercial"),
            ("expedicao", "Expedição"),
            ("producao", "Produção"),
            ("compras", "Compras"),
            ("sgi", "SGI / Qualidade"),
            ("financeiro", "Financeiro")
        ]
        bottlenecks = []
        for sec_id, sec_label in sectors_order:
            cnt = sector_counts.get(sec_id, 0)
            hrs_list = sector_hours.get(sec_id, [])
            avg_h = round(sum(hrs_list) / len(hrs_list), 1) if hrs_list else 0.0
            bottlenecks.append({
                "sector": sec_id,
                "label": sec_label,
                "count": cnt,
                "pct": round((cnt / len(em_andamento) * 100), 1) if len(em_andamento) > 0 else 0.0,
                "avg_hours": avg_h,
                "avg_days": round(avg_h / 24.0, 1)
            })

        # 3. Qualidade & Análise Técnica
        procedentes = sum(1 for r in rows if str(r.get("laudo_procedencia") or "").lower() == "procedente")
        improcedentes = sum(1 for r in rows if str(r.get("laudo_procedencia") or "").lower() == "improcedente")
        pendentes_laudo = total - procedentes - improcedentes

        destinacao_counts = defaultdict(int)
        for r in rows:
            dest = str(r.get("laudo_destinacao") or "").strip().lower()
            if dest:
                destinacao_counts[dest] += 1

        material_counts = defaultdict(int)
        for r in rows:
            mat = str(r.get("tipo_material") or "perfil").lower()
            material_counts[mat] += 1

        # 4. Top Clientes (Ranking Pareto)
        client_stats = defaultdict(lambda: {"count": 0, "valor": 0.0})
        for r in rows:
            cli = str(r.get("cliente") or "Não Informado").strip()
            client_stats[cli]["count"] += 1
            client_stats[cli]["valor"] += float(r.get("financeiro_valor") or 0.0)

        sorted_clients = sorted(
            [{"cliente": k, "count": v["count"], "valor": round(v["valor"], 2)} for k, v in client_stats.items()],
            key=lambda x: (x["count"], x["valor"]),
            reverse=True
        )[:6]

        # 5. Alertas Críticos para a Diretoria (Atrasadas ou com Alto Valor)
        critical_alerts = []
        for r in em_andamento:
            step = str(r.get("current_step") or "")
            if step in ("step_1_abertura", "step_2_expedicao", "step_2_3_expedicao"):
                continue
            dead_raw = r.get("sla_deadline")
            is_delayed = False
            hours_delay = 0.0
            if dead_raw:
                try:
                    deadline = datetime.fromisoformat(str(dead_raw).replace("Z", "")[:19])
                    diff_h = (deadline - now).total_seconds() / 3600.0
                    if diff_h < 0:
                        is_delayed = True
                        hours_delay = abs(round(diff_h, 1))
                except Exception:
                    pass

            val = float(r.get("financeiro_valor") or 0.0)
            if is_delayed or val > 1000.0:
                c_str = str(r.get("criado_em") or "")[:10]
                critical_alerts.append({
                    "id": r["id"],
                    "protocol": r.get("protocol"),
                    "cliente": r.get("cliente"),
                    "current_step": r.get("current_step"),
                    "current_step_label": STEP_LABELS.get(r.get("current_step", ""), r.get("current_step")),
                    "current_sector": r.get("current_sector"),
                    "valor": val,
                    "is_delayed": is_delayed,
                    "hours_delay": hours_delay,
                    "days_delay": round(hours_delay / 24.0, 1),
                    "tipo_fluxo": r.get("tipo_fluxo", "padrao"),
                    "criado_em": c_str
                })

        critical_alerts.sort(key=lambda x: (x["is_delayed"], x["hours_delay"], x["valor"]), reverse=True)
        critical_alerts = critical_alerts[:8]

        return {
            "summary": {
                "total_rncs": total,
                "em_andamento": len(em_andamento),
                "concluidas": len(concluidas),
                "canceladas": len(canceladas),
                "custo_total_perdas": round(total_valor, 2),
                "lead_time_medio_dias": lead_time_medio,
                "sla_taxa_cumprimento": sla_taxa,
                "total_credito": total_credito,
                "total_fisico": total_fisico,
                "pct_credito": round((total_credito / total * 100), 1) if total > 0 else 0.0,
                "pct_fisico": round((total_fisico / total * 100), 1) if total > 0 else 0.0
            },
            "bottlenecks": bottlenecks,
            "quality": {
                "procedencia": {
                    "procedente": procedentes,
                    "improcedente": improcedentes,
                    "pendente": pendentes_laudo,
                    "pct_procedente": round((procedentes / (procedentes + improcedentes) * 100), 1) if (procedentes + improcedentes) > 0 else 0.0
                },
                "destinacao": [
                    {"label": "Sucata", "count": destinacao_counts.get("sucata", 0)},
                    {"label": "Retrabalho", "count": destinacao_counts.get("retrabalho", 0)},
                    {"label": "Devolução Fornecedor", "count": destinacao_counts.get("devolucao_fornecedor", 0)},
                ],
                "materiais": [
                    {"label": "Perfis", "count": material_counts.get("perfil", 0)},
                    {"label": "Kits", "count": material_counts.get("kit", 0)},
                    {"label": "Acessórios", "count": material_counts.get("acessorio", 0)},
                    {"label": "Múltiplos / Outros", "count": material_counts.get("multiplo", 0) + material_counts.get("geral", 0)}
                ]
            },
            "top_clientes": sorted_clients,
            "critical_alerts": critical_alerts
        }
