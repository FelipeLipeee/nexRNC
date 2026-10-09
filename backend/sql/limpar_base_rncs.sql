-- =====================================================================
-- GRUPO TEC - TECVIDRO: LIMPEZA DE DADOS DE TESTE DO MODULO RNC
-- BANCO DE DADOS: TEC_DESK
-- SCHEMA: rnc.*
-- =====================================================================
-- Este script apaga todas as RNCs, itens, historicos e anexos,
-- reiniciando a numeracao de protocolos e IDs a partir de 1.
-- Os USUARIOS e SENHAS (rnc.usuario) NAO sao afetados.
-- =====================================================================

USE TEC_DESK;
GO

PRINT 'Iniciando limpeza de dados do modulo RNC...';

-- 1. Exclusao dos registros filhos e principais
DELETE FROM rnc.anexo;
PRINT 'Tabela rnc.anexo limpa.';

DELETE FROM rnc.historico;
PRINT 'Tabela rnc.historico limpa.';

DELETE FROM rnc.item;
PRINT 'Tabela rnc.item limpa.';

DELETE FROM rnc.ocorrencia;
PRINT 'Tabela rnc.ocorrencia limpa.';
GO

-- 2. Reiniciar contadores (o proximo registro comecara em ID = 1)
DBCC CHECKIDENT ('rnc.ocorrencia', RESEED, 0);
DBCC CHECKIDENT ('rnc.item', RESEED, 0);
DBCC CHECKIDENT ('rnc.historico', RESEED, 0);
DBCC CHECKIDENT ('rnc.anexo', RESEED, 0);
GO

-- 3. Confirmacao
PRINT '=====================================================================';
PRINT 'BASE DE RNCs LIMPA COM SUCESSO!';
PRINT 'A proxima RNC criada sera: RNC-' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-0001';
PRINT 'Usuarios e senhas foram PRESERVADOS.';
PRINT '=====================================================================';
GO
