import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff, UserPlus, Sparkles } from 'lucide-react';
import { loginUser, seedDemoData } from '../services/api';
import { RegisterForm } from './RegisterForm';
import { useBranding } from '../contexts/BrandingContext';
import type { UserProfile } from '../types';


interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { branding } = useBranding();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleQuickDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      await seedDemoData(true);
      // Login como Engenharia de Qualidade / SGI para visibilidade total
      try {
        const res = await loginUser('qualidade', '123456');
        onLoginSuccess(res.user, res.token);
      } catch {
        const resAdmin = await loginUser('admin', 'admin123');
        onLoginSuccess(resAdmin.user, resAdmin.token);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao semear dados de demonstração.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, informe o usuário e a senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(username.trim(), password.trim());
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-3 mb-3">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt={branding.company_name} className="w-12 h-12 object-contain rounded-xl p-1 bg-white shadow-sm border border-slate-200" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white text-base shadow-md">
              RNC
            </div>
          )}
          <div className="text-left">
            <h1 className="text-2xl font-black text-tec-navy tracking-tight">
              nex<span className="text-tec-orange">RNC</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block truncate max-w-[220px]">
              {branding.company_name}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-600 max-w-sm">
          {branding.custom_footer || 'Esteira Digital de Gestão e Tratativa de Relatórios de Não Conformidade'}
        </p>
      </div>


      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-tec-navy">Autenticação Corporativa</h2>
            <p className="text-xs text-slate-500">Entre com sua conta setorial autorizada</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-tec-orange-light text-tec-orange flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'border-tec-orange text-tec-navy'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Acessar Conta</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'border-tec-orange text-tec-navy'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar Operador</span>
          </button>
        </div>

        {mode === 'register' ? (
          <RegisterForm
            onRegisterSuccess={onLoginSuccess}
            onSwitchToLogin={() => { setMode('login'); setError(null); }}
          />
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-tec-navy mb-1.5">Usuário / Login</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: mariana, roberto, andre..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-tec-navy mb-1.5">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-tec-orange hover:bg-tec-orange-hover text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>Acessar Esteira</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-xs font-semibold text-tec-navy hover:text-tec-orange transition-colors cursor-pointer"
                >
                  Não possui cadastro? <span className="underline">Cadastre seu setor aqui</span>
                </button>
              </div>
            </form>

            {/* Industrial Demo Mode (Sandbox 1-Click) */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={demoLoading || loading}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-400/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{demoLoading ? 'Carregando Demonstração...' : '⚡ Modo Demonstração (Sandbox 1-Clique)'}</span>
              </button>
              <span className="text-[10px] text-slate-400 text-center font-medium">
                Popula instantaneamente com 9 ocorrências fabris cobrindo todas as etapas (ISO 9001).
              </span>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500">
        {branding.company_name || 'nexRNC Enterprise'} • Sistema de Gestão Integrada (SGI) • Ambiente Seguro
      </div>
    </div>
  );
};
