-- =====================================================================
-- nexRNC ENTERPRISE: SCRIPT DE IMPLANTAÇÃO DO SCHEMA E TABELAS RNC
-- SCHEMA DEDICADO: rnc.* (ISOLADO E COMPATÍVEL COM SQL SERVER 2017+)
-- BANCO DE DADOS: Parametrizável (ajuste o USE conforme seu ambiente)
-- =====================================================================

-- USE [NEXRNC_DB];
-- GO

-- 1. CRIAÇÃO DO SCHEMA ISOLADO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'rnc')
BEGIN
    PRINT 'Criando schema rnc...';
    EXEC('CREATE SCHEMA rnc AUTHORIZATION dbo;');
END
ELSE
BEGIN
    PRINT 'Schema rnc ja existe.';
END
GO

-- 2. TABELA PRINCIPAL DE OCORRÊNCIAS (rnc.ocorrencia)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ocorrencia' AND schema_id = SCHEMA_ID('rnc'))
BEGIN
    PRINT 'Criando tabela rnc.ocorrencia...';
    CREATE TABLE rnc.ocorrencia (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        protocol VARCHAR(30) UNIQUE NOT NULL, -- Ex: RNC-2026-0001
        current_step VARCHAR(60) NOT NULL, -- step_1_abertura, step_2_expedicao, step_4_compras, etc.
        current_sector VARCHAR(50) NOT NULL, -- comercial, expedicao, producao, compras, fiscal, sgi, financeiro
        status VARCHAR(30) NOT NULL DEFAULT 'em_andamento', -- em_andamento, concluido, cancelado
        cliente VARCHAR(150) NOT NULL,
        nota_fiscal VARCHAR(40) NULL,
        pedido_sankhya VARCHAR(40) NULL,
        produto_descricao VARCHAR(255) NOT NULL,
        motivo_reclamacao NVARCHAR(MAX) NOT NULL,
        quantidade DECIMAL(12,2) NOT NULL DEFAULT 1.0,
        tipo_material VARCHAR(50) DEFAULT 'perfil', -- perfil, kit, acessorio, multiplo
        devolucao_autorizada BIT DEFAULT 1,
        tipo_fluxo VARCHAR(50) DEFAULT 'padrao', -- padrao, financeiro
        tipo_rnc VARCHAR(50) DEFAULT 'Cliente', -- Cliente, Fornecedor, Interna
        
        -- Recebimento (Expedição)
        recebimento_data DATETIME2 NULL,
        recebimento_volumes INT NULL,
        recebimento_avaria_visivel BIT NULL,
        recebimento_obs NVARCHAR(MAX) NULL,
        setor_encaminhado VARCHAR(50) NULL,

        -- Laudo Técnico (Produção)
        laudo_procedencia VARCHAR(30) NULL, -- procedente, improcedente
        laudo_defeito_tecnico NVARCHAR(MAX) NULL,
        laudo_destinacao VARCHAR(50) NULL, -- sucata, retrabalho, devolucao_fornecedor
        laudo_responsavel VARCHAR(100) NULL,
        laudo_data DATETIME2 NULL,
        producao_itens_json NVARCHAR(MAX) NULL,

        -- Trâmite de Compras / Fiscal
        compras_nf_devolucao VARCHAR(40) NULL,
        compras_data DATETIME2 NULL,
        fiscal_nf_devolucao VARCHAR(40) NULL,
        fiscal_data_escrituracao DATETIME2 NULL,

        -- SGI e Qualidade
        sgi_causa_raiz NVARCHAR(MAX) NULL,
        sgi_acao_corretiva NVARCHAR(MAX) NULL,
        sgi_liberado BIT DEFAULT 0,
        sgi_observacoes NVARCHAR(MAX) NULL,
        sgi_homologado_por VARCHAR(100) NULL,

        -- Tratativa Comercial
        comercial_tratativa VARCHAR(60) NULL,
        comercial_detalhes NVARCHAR(MAX) NULL,

        -- Fechamento Financeiro
        financeiro_tipo_operacao VARCHAR(60) NULL,
        financeiro_valor DECIMAL(14,2) DEFAULT 0.0,
        financeiro_concluido_por VARCHAR(100) NULL,
        financeiro_obs NVARCHAR(MAX) NULL,
        financeiro_data DATETIME2 NULL,

        -- Encerramento Comercial Final
        comercial_fechamento_obs NVARCHAR(MAX) NULL,
        comercial_concluido_por VARCHAR(100) NULL,

        -- SLA e Auditoria
        data_reclamacao DATE NULL,
        sla_deadline DATETIME2 NOT NULL,
        criado_por VARCHAR(100) NOT NULL,
        criado_em DATETIME2 DEFAULT SYSDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSDATETIME(),
        fluxo_flexivel BIT DEFAULT 0,
        motivo_cancelamento NVARCHAR(MAX) NULL
    );

    CREATE NONCLUSTERED INDEX IX_rnc_setor_status ON rnc.ocorrencia(current_sector, status);
    CREATE NONCLUSTERED INDEX IX_rnc_protocolo ON rnc.ocorrencia(protocol);
END
ELSE
BEGIN
    PRINT 'Tabela rnc.ocorrencia ja existe. Verificando colunas necessarias...';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'fluxo_flexivel')
        ALTER TABLE rnc.ocorrencia ADD fluxo_flexivel BIT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'tipo_fluxo')
        ALTER TABLE rnc.ocorrencia ADD tipo_fluxo VARCHAR(50) DEFAULT 'padrao';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'tipo_rnc')
        ALTER TABLE rnc.ocorrencia ADD tipo_rnc VARCHAR(50) DEFAULT 'Cliente';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'motivo_cancelamento')
        ALTER TABLE rnc.ocorrencia ADD motivo_cancelamento NVARCHAR(MAX) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'data_reclamacao')
        ALTER TABLE rnc.ocorrencia ADD data_reclamacao DATE NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'setor_encaminhado')
        ALTER TABLE rnc.ocorrencia ADD setor_encaminhado VARCHAR(50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'producao_itens_json')
        ALTER TABLE rnc.ocorrencia ADD producao_itens_json NVARCHAR(MAX) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'compras_nf_devolucao')
        ALTER TABLE rnc.ocorrencia ADD compras_nf_devolucao VARCHAR(40) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'compras_data')
        ALTER TABLE rnc.ocorrencia ADD compras_data DATETIME2 NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'sgi_liberado')
        ALTER TABLE rnc.ocorrencia ADD sgi_liberado BIT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'sgi_observacoes')
        ALTER TABLE rnc.ocorrencia ADD sgi_observacoes NVARCHAR(MAX) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'financeiro_obs')
        ALTER TABLE rnc.ocorrencia ADD financeiro_obs NVARCHAR(MAX) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'financeiro_data')
        ALTER TABLE rnc.ocorrencia ADD financeiro_data DATETIME2 NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'comercial_fechamento_obs')
        ALTER TABLE rnc.ocorrencia ADD comercial_fechamento_obs NVARCHAR(MAX) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.ocorrencia') AND name = 'comercial_concluido_por')
        ALTER TABLE rnc.ocorrencia ADD comercial_concluido_por VARCHAR(100) NULL;
END
GO

-- 2.1 TABELA DE ITENS DA OCORRÊNCIA (rnc.item)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'item' AND schema_id = SCHEMA_ID('rnc'))
BEGIN
    PRINT 'Criando tabela rnc.item...';
    CREATE TABLE rnc.item (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        rnc_id BIGINT NOT NULL,
        tipo_material VARCHAR(50) NOT NULL,
        produto_descricao VARCHAR(255) NOT NULL,
        quantidade DECIMAL(12,2) NOT NULL DEFAULT 1.0,
        unidade_medida VARCHAR(20) DEFAULT 'UN',
        CONSTRAINT FK_rnc_item FOREIGN KEY (rnc_id) REFERENCES rnc.ocorrencia(id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_rnc_item_rnc ON rnc.item(rnc_id);
END
ELSE
BEGIN
    PRINT 'Tabela rnc.item ja existe. Verificando colunas...';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.item') AND name = 'unidade_medida')
        ALTER TABLE rnc.item ADD unidade_medida VARCHAR(20) DEFAULT 'UN';
END
GO

-- 3. TABELA DE HISTÓRICO E TRILHA DE AUDITORIA (rnc.historico)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'historico' AND schema_id = SCHEMA_ID('rnc'))
BEGIN
    PRINT 'Criando tabela rnc.historico...';
    CREATE TABLE rnc.historico (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        rnc_id BIGINT NOT NULL,
        step VARCHAR(60) NOT NULL,
        sector VARCHAR(50) NOT NULL,
        action VARCHAR(150) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        notes NVARCHAR(MAX) NULL,
        created_at DATETIME2 DEFAULT SYSDATETIME(),
        CONSTRAINT FK_rnc_historico FOREIGN KEY (rnc_id) REFERENCES rnc.ocorrencia(id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_rnc_historico_rnc ON rnc.historico(rnc_id);
END
ELSE
BEGIN
    PRINT 'Tabela rnc.historico ja existe.';
END
GO

-- 4. TABELA DE ANEXOS E EVIDÊNCIAS (rnc.anexo)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'anexo' AND schema_id = SCHEMA_ID('rnc'))
BEGIN
    PRINT 'Criando tabela rnc.anexo...';
    CREATE TABLE rnc.anexo (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        rnc_id BIGINT NOT NULL,
        step VARCHAR(60) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        category VARCHAR(50) NOT NULL, -- foto, laudo_pdf, nf_entrada
        uploaded_by VARCHAR(100) NOT NULL,
        created_at DATETIME2 DEFAULT SYSDATETIME(),
        CONSTRAINT FK_rnc_anexo FOREIGN KEY (rnc_id) REFERENCES rnc.ocorrencia(id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_rnc_anexo_rnc ON rnc.anexo(rnc_id);
END
ELSE
BEGIN
    PRINT 'Tabela rnc.anexo ja existe.';
END
GO

-- 5. TABELA DE USUÁRIOS E PERFIS SETORIAIS (rnc.usuario)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario' AND schema_id = SCHEMA_ID('rnc'))
BEGIN
    PRINT 'Criando tabela rnc.usuario...';
    CREATE TABLE rnc.usuario (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        sector VARCHAR(50) NOT NULL,
        role VARCHAR(100) NOT NULL,
        password VARCHAR(255) NULL,
        ativo BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT SYSDATETIME()
    );
END
ELSE
BEGIN
    PRINT 'Tabela rnc.usuario ja existe.';
END
GO

-- Garante que a coluna password exista
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rnc.usuario') AND name = 'password')
BEGIN
    PRINT 'Adicionando coluna password em rnc.usuario...';
    ALTER TABLE rnc.usuario ADD password VARCHAR(255) NULL;
END
GO

-- Garante senhas padrao para usuarios existentes sem senha
UPDATE rnc.usuario SET password = 'admin123' WHERE username = 'gestor' AND (password IS NULL OR password = '');
UPDATE rnc.usuario SET password = '123456' WHERE (password IS NULL OR password = '');
GO

-- Seed inicial apenas se a tabela estiver completamente vazia
IF (SELECT COUNT(*) FROM rnc.usuario) = 0
BEGIN
    PRINT 'Inserindo usuarios padrao...';
    INSERT INTO rnc.usuario (username, name, sector, role, password)
    VALUES 
        ('mariana', 'Mariana Costa', 'comercial', 'Vendedora / Comercial', '123456'),
        ('roberto', 'Roberto Nogueira', 'expedicao', 'Lider de Expedicao', '123456'),
        ('andre', 'Andre Silveira', 'producao', 'Inspetor Tecnico (Perfis/Acessorios)', '123456'),
        ('camila', 'Camila Duarte', 'producao', 'Inspetora Tecnica (Kits)', '123456'),
        ('thiago', 'Thiago Rocha', 'fiscal', 'Analista Fiscal / Compras', '123456'),
        ('beatriz', 'Beatriz Cunha', 'sgi', 'Coordenadora de SGI / Qualidade', '123456'),
        ('gustavo', 'Gustavo Mendes', 'financeiro', 'Analista Financeiro', '123456'),
        ('gestor', 'Administrador Geral', 'gestao', 'Coordenacao TI / Gestao', 'admin123');
END
GO

-- 6. SINÔNIMOS DE ACESSO TRANSPARENTE
IF NOT EXISTS (SELECT * FROM sys.synonyms WHERE name = 'rncs')
    CREATE SYNONYM dbo.rncs FOR rnc.ocorrencia;
GO

IF NOT EXISTS (SELECT * FROM sys.synonyms WHERE name = 'rnc_history')
    CREATE SYNONYM dbo.rnc_history FOR rnc.historico;
GO

IF NOT EXISTS (SELECT * FROM sys.synonyms WHERE name = 'rnc_attachments')
    CREATE SYNONYM dbo.rnc_attachments FOR rnc.anexo;
GO

IF NOT EXISTS (SELECT * FROM sys.synonyms WHERE name = 'rnc_usuario')
    CREATE SYNONYM dbo.rnc_usuario FOR rnc.usuario;
GO

-- 7. CONCESSÃO DE PERMISSÕES PARA O USUÁRIO DA APLICAÇÃO (AIAGENT)
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'AIAGENT')
BEGIN
    PRINT 'Concedendo permissoes ao usuario AIAGENT...';
    GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::rnc TO AIAGENT;
    GRANT EXECUTE ON SCHEMA::rnc TO AIAGENT;
    GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rncs TO AIAGENT;
    GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rnc_history TO AIAGENT;
    GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rnc_attachments TO AIAGENT;
    GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rnc_usuario TO AIAGENT;
END
GO

PRINT '=====================================================================';
PRINT 'ESTRUTURA DO MODULO nexRNC IMPLANTADA COM SUCESSO NO BANCO DE DADOS!';
PRINT '=====================================================================';
