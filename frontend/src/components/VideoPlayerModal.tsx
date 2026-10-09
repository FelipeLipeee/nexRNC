import React from 'react';
import { X, Download, Film } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  videoName: string | null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoName,
}) => {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center gap-2 truncate mr-4">
            <Film className="w-4 h-4 text-tec-orange shrink-0" />
            <span className="font-bold text-xs truncate">{videoName || 'Vídeo de Ocorrência'}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={videoUrl}
              download={videoName || 'video_ocorrencia.mp4'}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Baixar vídeo original"
            >
              <Download className="w-4 h-4" />
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

        {/* Video Player */}
        <div className="p-4 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh]">
          <video
            src={videoUrl}
            controls
            autoPlay
            preload="metadata"
            className="w-full h-auto max-h-[65vh] rounded-lg shadow-lg focus:outline-none"
          >
            Seu navegador não suporta reprodução de vídeos HTML5.
          </video>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950 text-slate-400 text-[11px] flex items-center justify-between border-t border-slate-800">
          <span>Streaming local via servidor nexRNC</span>
          <span className="font-mono text-[10px] text-slate-500">MP4 / H.264</span>
        </div>
      </div>
    </div>
  );
};
