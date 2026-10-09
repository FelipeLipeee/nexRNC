import React, { useState, useRef } from 'react';
import { X, Upload, Check, Palette, Building2, Image as ImageIcon, Sparkles, RefreshCw, Pipette } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_THEMES = [
  { name: 'Tec Navy & Orange', primary: '#13273e', accent: '#e35210' },
  { name: 'Industrial Slate & Cyan', primary: '#0f172a', accent: '#06b6d4' },
  { name: 'Enterprise Blue & Gold', primary: '#1e3a8a', accent: '#f59e0b' },
  { name: 'Forest Quality & Emerald', primary: '#064e3b', accent: '#10b981' },
];

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) ? 'RGB(0, 0, 0)' : `RGB(${r}, ${g}, ${b})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) ? 'RGB(0, 0, 0)' : `RGB(${r}, ${g}, ${b})`;
  }
  return 'RGB(0, 0, 0)';
}

function normalizeHex(val: string): string {
  let clean = val.trim();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  return clean;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({ isOpen, onClose }) => {
  const { branding, updateSettings, uploadLogo } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState(branding.company_name);
  const [systemTitle, setSystemTitle] = useState(branding.system_title);
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color);
  const [accentColor, setAccentColor] = useState(branding.accent_color);
  const [customFooter, setCustomFooter] = useState(branding.custom_footer || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(branding.logo_url || null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (selectedFile) {
        await uploadLogo(selectedFile);
      }
      await updateSettings({
        company_name: companyName.trim() || 'nexRNC Enterprise',
        system_title: systemTitle.trim() || 'Sistema de Gestão de Não Conformidades',
        primary_color: primaryColor,
        accent_color: accentColor,
        custom_footer: customFooter.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar configurações de White-Label.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-400/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Configurações White-Label & Marca</h2>
              <p className="text-xs text-slate-400">Personalize a identidade corporativa para a sua empresa</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-slate-700 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Company Name & System Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Minha Indústria S/A"
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Título da Esteira
              </label>
              <input
                type="text"
                value={systemTitle}
                onChange={(e) => setSystemTitle(e.target.value)}
                placeholder="Ex: Gestão de Não Conformidades"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Logo Upload & Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Logomarca Institucional
            </label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1 shadow-sm shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Escolher Imagem (PNG, JPG, SVG)</span>
                </button>
                <p className="text-[11px] text-slate-400">Recomendado: Fundo transparente, proporção horizontal ou quadrada.</p>
              </div>
            </div>
          </div>

          {/* Color Palettes Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Paletas Rápidas Pré-Definidas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(theme.primary);
                    setAccentColor(theme.accent);
                  }}
                  className={`flex items-center gap-2 p-2 border rounded-lg text-left text-xs transition-all cursor-pointer ${
                    primaryColor === theme.primary && accentColor === theme.accent
                      ? 'border-orange-500 bg-orange-50/50 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex gap-1 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: theme.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <span className="truncate text-slate-700">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers with RGB & Swatch */}
          <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5 text-orange-500" />
                <span>Seletor de Cores Livre (RGB & HEX)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cor Primária */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Cor Primária (Topo)</label>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{hexToRgb(primaryColor)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 shadow-inner shrink-0 cursor-pointer">
                    <input
                      type="color"
                      value={primaryColor.length === 7 ? primaryColor : '#13273e'}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-0 p-0"
                      title="Clique para escolher a cor no espectro"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(normalizeHex(e.target.value))}
                      maxLength={7}
                      placeholder="#13273e"
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold uppercase border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cor de Destaque / Acento */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Cor de Destaque (Botões)</label>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{hexToRgb(accentColor)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 shadow-inner shrink-0 cursor-pointer">
                    <input
                      type="color"
                      value={accentColor.length === 7 ? accentColor : '#e35210'}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-0 p-0"
                      title="Clique para escolher a cor no espectro"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(normalizeHex(e.target.value))}
                      maxLength={7}
                      placeholder="#e35210"
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold uppercase border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Swatch Preview */}
            <div className="mt-2 pt-2 border-t border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Pré-visualização em tempo real:</div>
              <div
                className="p-2.5 rounded-lg flex items-center justify-between shadow-xs transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-[10px] font-black text-white">
                    RNC
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {companyName || 'Sua Empresa'}
                  </span>
                </div>
                <div
                  className="px-2.5 py-1 rounded text-[11px] font-bold text-white shadow-xs cursor-default"
                  style={{ backgroundColor: accentColor }}
                >
                  + Nova RNC
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Mensagem de Rodapé (Tela de Login)
            </label>
            <input
              type="text"
              value={customFooter}
              onChange={(e) => setCustomFooter(e.target.value)}
              placeholder="Ex: Esteira Digital de Qualidade e Rastreabilidade"
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                success ? 'bg-emerald-600' : 'bg-orange-600 hover:bg-orange-700'
              } disabled:opacity-50`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Identidade Atualizada!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Salvar Marca</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
