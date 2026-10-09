import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trash2, RefreshCw, Check, AlertCircle, Database, ShieldCheck } from 'lucide-react';
import { getDemoStatus, seedDemoData, resetData } from '../services/api';

interface DemoSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const DemoSandboxModal: React.FC<DemoSandboxModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ total_rncs: number; demo_rncs: number; is_demo_active: boolean; db_mode: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await getDemoStatus();
      setStatus(data);
    } catch {
      // Ignora erro inicial
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await seedDemoData(true);
      setFeedback({ type: 'success', message: res.message });
      await fetchStatus();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao semear demonstração' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await resetData(true);
      setFeedback({ type: 'success', message: res.message });
      await fetchStatus();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao remover demonstração' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Atenção: Deseja realmente zerar todas as ocorrências do sistema? Usuários e senhas serão mantidos.')) {
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await resetData(false);
      setFeedback({ type: 'success', message: res.message });
      await fetchStatus();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao zerar ocorrências' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Sandbox & Demonstração Industrial</h2>
              <p className="text-[11px] text-slate-400">Controle de ambiente de teste e sementeira de dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Status Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Estado da Base de Dados</span>
              <div className="flex items-center gap-3 font-semibold text-slate-800">
                <span>Total: <strong className="font-mono text-tec-navy">{status ? status.total_rncs : '...'}</strong> RNCs</span>
                <span>•</span>
                <span>Demo Ativo: <strong className="font-mono text-amber-600">{status ? status.demo_rncs : '...'}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                <Database className="w-3 h-3 text-emerald-600" />
                {status?.db_mode === 'sql_server' ? 'SQL Server' : 'SQLite'}
              </span>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action 1: Seed Demo */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Carregar Demonstração Industrial (9 Casos)
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Popula casos industriais reais em todas as 8 etapas, incluindo laudos, 5 Porquês e SLA estourado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSeed}
              disabled={loading}
              className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Processando...' : 'Semear Dados de Demonstração'}</span>
            </button>
          </div>

          {/* Action 2: Reset Options */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Opções de Limpeza</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleResetDemo}
                disabled={loading || !status?.demo_rncs}
                className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Limpar Somente Demo</span>
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                disabled={loading || !status?.total_rncs}
                className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Zerar Base (Produção)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Os operadores e senhas cadastrados são 100% preservados em qualquer operação.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
