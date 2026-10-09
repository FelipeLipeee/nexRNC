import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CancelRncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  reason: string;
  onReasonChange: (v: string) => void;
  cancelling: boolean;
  error: string | null;
}

export const CancelRncDialog: React.FC<CancelRncDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reason,
  onReasonChange,
  cancelling,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-2.5 text-rose-700 mb-3 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Confirmar Cancelamento de RNC</span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Ao cancelar esta RNC, a esteira será paralisada e o motivo ficará registrado permanentemente na trilha de auditoria.
        </p>
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-3">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Motivo / Justificativa do Cancelamento *
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ex: Erro de digitação na abertura, cliente desistiu da devolução..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 mb-4"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={cancelling}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={cancelling || reason.trim().length < 5}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
