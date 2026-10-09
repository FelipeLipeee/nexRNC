import React, { useState } from 'react';
import { Plus, User, LayoutGrid, ListFilter, LogOut, BarChart3, Palette, Sparkles } from 'lucide-react';
import type { UserProfile, SectorType } from '../types';
import { isExecutiveUser, canCreateRnc } from '../types';
import { useBranding } from '../contexts/BrandingContext';
import { BrandingModal } from './BrandingModal';
import { DemoSandboxModal } from './DemoSandboxModal';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  activeView: 'queue' | 'kanban' | 'bi';
  onToggleView: (view: 'queue' | 'kanban' | 'bi') => void;
  onOpenNewRnc: () => void;
  onDataRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  activeView,
  onToggleView,
  onOpenNewRnc,
  onDataRefresh,
}) => {
  const { branding } = useBranding();
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const getSectorBadge = (sector: SectorType) => {
    switch (sector) {
      case 'comercial': return 'bg-blue-500/20 text-blue-300 border-blue-400/40';
      case 'expedicao': return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'producao': return 'bg-orange-500/20 text-orange-300 border-orange-400/40';
      case 'fiscal': return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
      case 'sgi': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      case 'financeiro': return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
      case 'gestao': return 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      case 'gerencia': return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40';
      case 'diretoria': return 'bg-amber-400/20 text-amber-200 border-amber-300/50';
      case 'ti': return 'bg-teal-500/20 text-teal-300 border-teal-400/40';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="bg-tec-navy text-white border-b border-tec-navy-light sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Dynamic Brand and Title (White-Label Ready) */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-tec-navy-dark flex items-center justify-center shadow-md p-1 border border-slate-700/50 overflow-hidden shrink-0">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={branding.company_name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-white text-xs tracking-tighter">
                RNC
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-orange-400 font-extrabold truncate max-w-[240px]">
                {branding.company_name}
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {branding.system_title}
            </h1>
          </div>
        </div>


        {/* User Info & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Authenticated User Badge */}
          <div className="flex items-center gap-2 bg-tec-navy-dark px-3 py-1.5 rounded-full border border-gray-700/60 text-xs">
            <div className="w-6 h-6 rounded-full bg-tec-navy-light text-tec-orange flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-white leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-300">{currentUser.role}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-1 ${getSectorBadge(currentUser.sector)}`}>
              {currentUser.sector}
            </span>
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-tec-navy-dark p-1 rounded-lg border border-gray-700/60">
            <button
              onClick={() => onToggleView('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'queue'
                  ? 'bg-tec-orange text-white shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Minha Fila</span>
            </button>
            <button
              onClick={() => onToggleView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'kanban'
                  ? 'bg-tec-orange text-white shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Esteira 7 Etapas</span>
            </button>
            {isExecutiveUser(currentUser) && (
              <button
                onClick={() => onToggleView('bi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'bi'
                    ? 'bg-tec-orange text-white shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="Painel Executivo de Business Intelligence"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Painel BI</span>
              </button>
            )}
          </div>

          {/* New RNC Button (Apenas Comercial ou Administradores) */}
          {canCreateRnc(currentUser) && (
            <button
              onClick={onOpenNewRnc}
              className="flex items-center gap-1.5 bg-tec-orange hover:bg-tec-orange-hover text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova RNC</span>
            </button>
          )}

          {/* White-Label Branding Button (Apenas Executivos / TI / Gestao) */}
          {isExecutiveUser(currentUser) && (
            <>
              <button
                onClick={() => setShowDemoModal(true)}
                title="Sandbox & Demonstração Industrial"
                className="p-2 rounded-lg bg-tec-navy-dark hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-gray-700/60 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>
              <button
                onClick={() => setShowBrandingModal(true)}
                title="Personalizar Marca e White-Label"
                className="p-2 rounded-lg bg-tec-navy-dark hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 border border-gray-700/60 transition-colors cursor-pointer"
              >
                <Palette className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Sair da conta"
            className="p-2 rounded-lg bg-tec-navy-dark hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-gray-700/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* White-Label Settings Modal */}
      <BrandingModal isOpen={showBrandingModal} onClose={() => setShowBrandingModal(false)} />

      {/* Industrial Sandbox Modal */}
      <DemoSandboxModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onDataChanged={onDataRefresh}
      />
    </header>
  );
};

