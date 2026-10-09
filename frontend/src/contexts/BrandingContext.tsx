import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BrandingSettings } from '../types';
import { fetchBranding, updateBrandingSettings, uploadBrandingLogo } from '../services/api';

const DEFAULT_BRANDING: BrandingSettings = {
  id: 1,
  company_name: 'nexRNC Enterprise',
  system_title: 'Sistema de Gestão de Não Conformidades',
  logo_url: null,
  logo_dark_url: null,
  primary_color: '#13273e',
  accent_color: '#e35210',
  custom_footer: 'Esteira Digital de Gestão e Tratativa de Relatórios de Não Conformidade',
  updated_at: null,
};

interface BrandingContextType {
  branding: BrandingSettings;
  loading: boolean;
  refreshBranding: () => Promise<void>;
  updateSettings: (payload: Partial<BrandingSettings>) => Promise<BrandingSettings>;
  uploadLogo: (file: File) => Promise<BrandingSettings>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: DEFAULT_BRANDING,
  loading: true,
  refreshBranding: async () => {},
  updateSettings: async () => DEFAULT_BRANDING,
  uploadLogo: async () => DEFAULT_BRANDING,
});

function adjustBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const loadBranding = async () => {
    try {
      const data = await fetchBranding();
      setBranding(data);
    } catch {
      // Fallback silently to defaults if server isn't reached yet
      setBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  // Update tab title
  useEffect(() => {
    if (branding.company_name) {
      document.title = `${branding.company_name} | nexRNC`;
    }
  }, [branding.company_name]);

  // Apply dynamic colors to CSS custom properties in real-time
  useEffect(() => {
    const root = document.documentElement;
    if (branding.primary_color) {
      const primary = branding.primary_color;
      const primaryLight = adjustBrightness(primary, 15);
      const primaryDark = adjustBrightness(primary, -18);
      root.style.setProperty('--color-tec-navy', primary);
      root.style.setProperty('--color-tec-navy-light', primaryLight);
      root.style.setProperty('--color-tec-navy-dark', primaryDark);
    }
    if (branding.accent_color) {
      const accent = branding.accent_color;
      const accentHover = adjustBrightness(accent, -12);
      root.style.setProperty('--color-tec-orange', accent);
      root.style.setProperty('--color-tec-orange-hover', accentHover);
      root.style.setProperty('--color-tec-orange-light', `${accent}18`);
    }
  }, [branding.primary_color, branding.accent_color]);

  // Apply dynamic favicon to all icon link tags in document
  useEffect(() => {
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    const href = branding.logo_url || '/favicon.png?v=nex';
    const type = 'image/png';

    if (iconLinks.length > 0) {
      iconLinks.forEach((link) => {
        link.href = href;
        link.type = type;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = type;
      link.href = href;
      document.head.appendChild(link);
    }
  }, [branding.logo_url]);

  const handleUpdate = async (payload: Partial<BrandingSettings>) => {
    const updated = await updateBrandingSettings(payload);
    setBranding(updated);
    return updated;
  };

  const handleUploadLogo = async (file: File) => {
    const updated = await uploadBrandingLogo(file);
    setBranding(updated);
    return updated;
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        refreshBranding: loadBranding,
        updateSettings: handleUpdate,
        uploadLogo: handleUploadLogo,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
