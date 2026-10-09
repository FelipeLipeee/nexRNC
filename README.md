# nexRNC — Enterprise Quality Workflow & Non-Conformance Platform

> **Esteira Operacional Inteligente para Gestão de Não Conformidades (RNC), Rastreabilidade Industrial e Controle de SLA Setorial.**

O **nexRNC** é uma plataforma corporativa B2B projetada para indústrias e empresas de manufatura que precisam eliminar o atrito entre **Vendas, Expedição, Chão de Fábrica, Qualidade (SGI/ISO 9001) e Financeiro**.

Substitui planilhas de Excel desatualizadas, trocas de e-mail desordenadas e módulos burocráticos de ERP por uma esteira visual ágil, auditável e orientada a prazos rigorosos.

---

## Principais Capacidades do Produto

### 1. Esteira Operacional Setorial (Handoff Seguro)
- **Visão por Papéis (RBAC):** Cada operador enxerga as RNCs que exigem sua ação imediata, reduzindo ruído e sobrecarga cognitiva.
- **Workflow em 8 Etapas:** Da abertura comercial à conferência física na expedição, laudo técnico pericial na fábrica, análise de causa-raiz (5 Porquês / 5W2H) no SGI e liquidação financeira.
- **Fluxo Reversível Auditado (Botão Voltar Etapa):** Qualquer setor pode devolver a ocorrência com justificativa obrigatória registrada no histórico e notificação automática de retorno.
- **Fluxo Paralelo de Crédito:** Tratativa ágil para concessões comerciais ou avarias que dispensam retorno físico de material à fábrica.

### 2. SLA em Tempo Real & Escalação Automática
- Cronômetro regressivo por etapa com indicadores visuais de urgência (*No Prazo*, *Alerta* e *Estourado*).
- Isenção inteligente de prazo para mercadorias aguardando chegada física do cliente.
- Disparo automático de e-mails para os líderes setoriais ao atingir limites críticos de SLA.

### 3. Galeria Forense de Evidências
- Upload simultâneo de fotos, vídeos e laudos técnicos em PDF.
- Visualizador de fotos em alta resolução embutido (`ImageViewerModal`) e player de vídeo nativo.
- Sanitização automática de nomes de arquivo (fotos de WhatsApp com espaços e parênteses) com segurança contra *Path Traversal*.

### 4. BI Executivo & Análise de Qualidade (Diretoria / C-Level)
- Visão panorâmica dos gargalos da fábrica em tempo real.
- Filtro temporal customizado (7 dias, 30 dias, 90 dias ou intervalos de datas).
- Análise de Pareto dos clientes com maior índice de reincidência.
- Gráficos de destinação técnica (Sucata vs. Retrabalho vs. Improcedente).

### 5. Arquitetura Híbrida & White-Label
- **Backend:** FastAPI (Python 3.12), Pydantic v2, suporte nativo a SQLite (contingência/standalone) e Microsoft SQL Server / PostgreSQL.
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite, blindado com `ErrorBoundary` e zero dependências pesadas.
- **Deploy Autossuficiente:** Roda em porta única (3010) com frontend estático embutido, dispensando Node.js no servidor de produção.

---

## Início Rápido (Execução Local)

### Pré-requisitos
- Python 3.12+ instalado.
- Node.js 18+ (apenas se for recompilar o frontend).

### 1. Clonar e Configurar Ambiente
```bash
git clone https://github.com/FelipeLipeee/nexRNC.git
cd nexRNC

# Copiar variáveis de ambiente
copy backend\.env.example backend\.env
```

### 2. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 3. Iniciar a Aplicação
Execute o inicializador automático:
```bash
iniciar_local.bat
```
Ou manualmente via terminal:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 3010
```

Acesse no navegador: **`http://localhost:3010`**  
- **Login Inicial:** `admin` | **Senha:** `admin123`

---

## Estrutura do Repositório

```
nexRNC/
├── backend/
│   ├── app/
│   │   ├── routers/          # Endpoints REST (rnc, bi, auth)
│   │   ├── services/         # Regras de transicao, SLA e e-mails
│   │   ├── database.py       # Adaptador multiconexao resiliente
│   │   ├── models.py         # Modelagem relacional
│   │   └── schemas.py        # Validacao estrita Pydantic v2
│   ├── sql/                  # Scripts DDL e seeds iniciais
│   ├── static/               # Build compilado do frontend React
│   └── main.py               # Ponto de entrada FastAPI
├── frontend/
│   ├── src/
│   │   ├── components/       # Modais, Kanban, Tabelas e visualizadores
│   │   ├── components/bi/    # Painel executivo de graficos e KPIs
│   │   └── services/api.ts   # Cliente HTTP tipado
│   └── package.json
├── iniciar_local.bat         # Launcher rapido para desenvolvimento
├── requirements.txt          # Dependencias Python
└── README.md
```

---

## Licença e Comercialização
Desenvolvido por **Felipe Pinete**. Todos os direitos reservados.  
Para licenciamento corporativo, implantação industrial dedicada ou parcerias comerciais, entre em contato.
