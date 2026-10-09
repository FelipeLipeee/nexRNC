import React, { useState } from 'react';
import { Paperclip, Upload, PlayCircle, Eye, FileText } from 'lucide-react';
import type { AttachmentEntry } from '../types';
import { ImageViewerModal } from './ImageViewerModal';

interface RncAttachmentGalleryProps {
  attachments: AttachmentEntry[];
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenVideo: (video: { url: string; name: string }) => void;
}

export const RncAttachmentGallery: React.FC<RncAttachmentGalleryProps> = ({
  attachments,
  uploading,
  onFileUpload,
  onOpenVideo,
}) => {
  const [activeImage, setActiveImage] = useState<{ url: string; name: string; uploadedBy?: string } | null>(null);

  const isVideo = (att: AttachmentEntry) => att.category === 'video' || /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(att.file_name);
  const isImage = (att: AttachmentEntry) => att.category === 'foto' || /\.(png|jpg|jpeg|webp|gif|bmp)$/i.test(att.file_name);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-tec-navy uppercase tracking-wider flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-500" />
          Evidências Multimídia ({attachments.length})
        </h4>
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors border border-slate-200 text-xs">
          <Upload className="w-3.5 h-3.5 text-tec-orange" />
          <span>{uploading ? 'Enviando...' : 'Anexar Fotos / Vídeos'}</span>
          <input type="file" accept="image/*,video/*,.pdf" multiple onChange={onFileUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {attachments.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
          Nenhum arquivo, foto ou vídeo anexado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {attachments.map((att) => {
            const isVid = isVideo(att);
            const isImg = isImage(att);
            return (
              <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors">
                <div 
                  className={`flex items-center gap-2.5 truncate mr-2 ${isImg ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (isImg) {
                      setActiveImage({ url: att.file_path, name: att.file_name, uploadedBy: att.uploaded_by });
                    }
                  }}
                  title={isImg ? "Clique para visualizar foto" : undefined}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isVid ? 'bg-amber-100 text-amber-700' : isImg ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isVid ? <PlayCircle className="w-4 h-4" /> : isImg ? <Eye className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 block truncate text-xs hover:text-tec-orange transition-colors">{att.file_name}</span>
                    <span className="text-[10px] text-slate-500 block">{att.uploaded_by} • {isVid ? 'Vídeo' : isImg ? 'Foto' : 'Arquivo'}</span>
                  </div>
                </div>

                {isVid ? (
                  <button
                    type="button"
                    onClick={() => onOpenVideo({ url: att.file_path, name: att.file_name })}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Assistir</span>
                  </button>
                ) : isImg ? (
                  <button
                    type="button"
                    onClick={() => setActiveImage({ url: att.file_path, name: att.file_name, uploadedBy: att.uploaded_by })}
                    className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-colors border border-blue-200 text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Foto</span>
                  </button>
                ) : (
                  <a
                    href={att.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded bg-orange-50 text-tec-orange hover:bg-tec-orange hover:text-white font-bold transition-colors border border-orange-200 text-xs shrink-0"
                  >
                    Abrir
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Integrated Image Viewer Modal */}
      <ImageViewerModal
        isOpen={Boolean(activeImage)}
        onClose={() => setActiveImage(null)}
        imageUrl={activeImage?.url || null}
        imageName={activeImage?.name || null}
        uploadedBy={activeImage?.uploadedBy}
      />
    </div>
  );
};
