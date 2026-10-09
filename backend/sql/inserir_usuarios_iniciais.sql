-- =====================================================================
-- nexRNC: CARGA INICIAL DE USUARIOS E PERFIS PADRAO (TEMPLATE COMERCIAL)
-- =====================================================================
-- Este script realiza a carga inicial de operadores demonstrativos
-- para cada setor da esteira produtiva.
-- Senha padrao inicial: 123456
-- =====================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario' AND schema_id = SCHEMA_ID('rnc'))
BEGIN
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
GO

-- 1. ADMINISTRADOR & GESTAO
IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'admin')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('admin', 'Administrador do Sistema', 'gestao', 'Administrador / TI', 'admin123', 1);

IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'diretoria')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('diretoria', 'Diretoria Executiva', 'gestao', 'Diretor Geral', '123456', 1);

-- 2. COMERCIAL
IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'comercial')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('comercial', 'Operador Comercial', 'comercial', 'Analista de Vendas', '123456', 1);

-- 3. EXPEDICAO / RECEBIMENTO
IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'expedicao')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('expedicao', 'Conferente Expedicao', 'expedicao', 'Conferente de Carga', '123456', 1);

-- 4. PRODUCAO & FABRICA
IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'producao')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('producao', 'Supervisor de Producao', 'producao', 'Lider de Fabricacao', '123456', 1);

-- 5. QUALIDADE / SGI
IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'qualidade')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('qualidade', 'Analista de Qualidade / SGI', 'sgi', 'Engenheiro de Qualidade', '123456', 1);

-- 6. FINANCEIRO
IF NOT EXISTS (SELECT 1 FROM rnc.usuario WHERE username = 'financeiro')
    INSERT INTO rnc.usuario (username, name, sector, role, password, ativo) VALUES ('financeiro', 'Analista Financeiro', 'financeiro', 'Contas a Receber / Faturamento', '123456', 1);
GO

PRINT 'Carga de usuarios padrao do nexRNC realizada com sucesso!';
