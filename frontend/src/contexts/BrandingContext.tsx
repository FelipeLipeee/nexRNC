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

  useEffect(() => {
    if (branding.company_name) {
      document.title = `${branding.company_name} | nexRNC`;
    }
  }, [branding.company_name]);

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
