import React from 'react';
import { X, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageName: string | null;
  uploadedBy?: string | null;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  uploadedBy,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center gap-2 truncate mr-4">
            <ImageIcon className="w-4 h-4 text-tec-orange shrink-0" />
            <div className="truncate">
              <span className="font-bold text-xs truncate block">{imageName || 'Evidência Fotográfica'}</span>
              {uploadedBy && (
                <span className="text-[10px] text-slate-400 block">Enviado por: {uploadedBy}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aba</span>
            </a>
            <a
              href={imageUrl}
              download={imageName || 'evidencia_rnc.jpg'}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Baixar imagem original"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="p-4 bg-black/50 flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-auto">
          <img
            src={imageUrl}
            alt={imageName || 'Evidência'}
            className="max-w-full max-h-[72vh] w-auto h-auto object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950 text-slate-400 text-[11px] flex items-center justify-between border-t border-slate-800">
          <span>Visualizador de Evidências • Grupo Tec</span>
          <span className="font-mono text-[10px] text-slate-500">Alta Resolução</span>
        </div>
      </div>
    </div>
  );
};
