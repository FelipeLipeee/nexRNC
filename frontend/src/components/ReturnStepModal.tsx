import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';

interface ReturnStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
  protocol: string;
}

export const ReturnStepModal: React.FC<ReturnStepModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  protocol,
}) => {
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMotivo = motivo.trim();
    if (cleanMotivo.length < 5) {
      setError('A justificativa deve conter no mínimo 5 caracteres informando o motivo do retorno.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(cleanMotivo);
      setMotivo('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao retornar etapa');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header in Amber / Warning */}
        <div className="p-4 bg-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-sm">Voltar Etapa • {protocol}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Devolução para o setor anterior</strong>
              <p className="mt-0.5 text-amber-800">
                A ocorrência será devolvida à fila do setor anterior e uma notificação por e-mail será enviada à equipe responsável.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Justificativa do Retorno <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Descreva detalhadamente o motivo da devolução da ocorrência..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Mínimo de 5 caracteres • Esta justificativa será gravada na Linha do Tempo da RNC.
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || motivo.trim().length < 5}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{submitting ? 'Devolvendo...' : 'Confirmar Retorno de Etapa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
