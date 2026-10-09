import React from 'react';
import { Paperclip, FileText, Trash2, Plus, Film, Image as ImageIcon } from 'lucide-react';

interface MultiFileUploaderProps {
  files: File[];
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export const MultiFileUploader: React.FC<MultiFileUploaderProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearAll,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = ''; // reset so same files can be re-selected if needed
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (type.includes('video') || ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'].includes(ext)) {
      return <Film className="w-4 h-4 text-purple-600" />;
    }
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    }
    return <FileText className="w-4 h-4 text-emerald-600" />;
  };

  const totalSizeMb = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-tec-navy flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-tec-orange" />
          <span>Evidências: Fotos, Vídeos ou PDFs ({files.length})</span>
        </label>
        {files.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-600 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remover todos</span>
          </button>
        )}
      </div>

      {files.length > 0 ? (
        <div className="space-y-1.5">
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}_${file.size}_${idx}`}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-800 truncate block text-xs">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors ml-2 cursor-pointer"
                  title="Remover este arquivo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span className="text-[10px] text-slate-500 font-medium">
              Total: {files.length} arquivo(s) • {totalSizeMb.toFixed(2)} MB
            </span>
            <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-bold text-tec-orange cursor-pointer transition-colors shadow-2xs">
              <Plus className="w-3 h-3" />
              <span>Adicionar mais</span>
              <input
                type="file"
                multiple
                accept=".pdf,image/*,video/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center py-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-tec-orange hover:bg-orange-50/10 transition-all text-center group shadow-2xs">
          <Paperclip className="w-5 h-5 text-slate-400 group-hover:text-tec-orange mb-1 transition-colors" />
          <span className="text-xs font-semibold text-slate-700">
            Clique para anexar fotos, vídeos ou PDFs
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Suporta múltiplos arquivos simultâneos (MP4, Fotos, Laudos)
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,image/*,video/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
