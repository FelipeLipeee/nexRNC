import React, { useState } from 'react';
import { User, Lock, Briefcase, Building2, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../services/api';
import type { UserProfile, SectorType } from '../types';

interface RegisterFormProps {
  onRegisterSuccess: (user: UserProfile, token: string) => void;
  onSwitchToLogin: () => void;
}

const SECTOR_OPTIONS: { value: SectorType; label: string; desc: string; defaultRole: string }[] = [
  // Fluxo Base
  { value: 'comercial', label: 'Comercial', desc: 'Abertura de RNCs, triagem inicial e tratativa com cliente', defaultRole: 'Vendedor(a) / Comercial' },
  { value: 'expedicao', label: 'Expedição', desc: 'Recebimento físico de mercadorias e segregação em quarentena', defaultRole: 'Líder / Operador de Expedição' },
  { value: 'compras', label: 'Compras', desc: 'Emissão e escrituração de NF de devolução e gestão de fornecedores', defaultRole: 'Comprador(a) / Analista de Compras' },
  { value: 'sgi', label: 'SGI / Qualidade', desc: 'Conclusão técnica, homologação e liberação de tratativas', defaultRole: 'Coordenador / Analista de SGI' },
  { value: 'financeiro', label: 'Financeiro', desc: 'Liquidação de créditos, abatimentos de duplicatas e conciliação', defaultRole: 'Analista Financeiro(a)' },
  { value: 'gestao', label: 'Diretoria / Gestão TI', desc: 'Visão executiva global, auditoria de SLAs e coordenação', defaultRole: 'Gestão Executiva / Auditoria' },
  // Setores Fabris / Produção
  { value: 'producao', label: 'Produção (Geral)', desc: 'Inspeção técnica geral e triagem fabril', defaultRole: 'Inspetor(a) Técnico(a)' },
  { value: 'pintura', label: 'Pintura', desc: 'Inspeção técnica em linha de pintura eletrostática', defaultRole: 'Líder / Inspetor de Pintura' },
  { value: 'kit', label: 'Kit', desc: 'Inspeção de kits de instalação e montagem de componentes', defaultRole: 'Líder / Inspetor de Kit' },
  { value: 'extrusao', label: 'Extrusão', desc: 'Inspeção dimensional e metalúrgica de perfis extrudados', defaultRole: 'Líder / Operador de Extrusão' },
  { value: 'injetora', label: 'Injetora', desc: 'Inspeção de peças plásticas e polímeros injetados', defaultRole: 'Operador / Inspetor de Injetora' },
  { value: 'anodizacao', label: 'Anodização', desc: 'Controle de camada e acabamento superficial anodizado', defaultRole: 'Inspetor de Anodização' },
  { value: 'embalagem', label: 'Embalagem', desc: 'Conferência final de volumes e embalagens industriais', defaultRole: 'Operador de Embalagem' },
  { value: 'estoque_beneficiado', label: 'Estoque Beneficiado', desc: 'Triagem e conferência de perfis e materiais beneficiados', defaultRole: 'Almoxarife / Estoque Beneficiado' },
  { value: 'estoque_acessorios', label: 'Estoque de Acessórios', desc: 'Conferência física de roldanas, puxadores e acessórios', defaultRole: 'Almoxarife de Acessórios' },
  { value: 'estoque_componentes', label: 'Estoque de Componentes', desc: 'Conferência de ferragens e componentes de linha', defaultRole: 'Almoxarife de Componentes' },
  { value: 'estoque_in_natura', label: 'Estoque In Natura', desc: 'Inspeção de lingotes e matéria-prima bruta', defaultRole: 'Almoxarife In Natura' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [sector, setSector] = useState<SectorType>('comercial');
  const [role, setRole] = useState('Vendedor(a) / Comercial');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSectorChange = (newSector: SectorType) => {
    setSector(newSector);
    const found = SECTOR_OPTIONS.find((s) => s.value === newSector);
    if (found) {
      setRole(found.defaultRole);
    }
  };

  const handleUsernameChange = (val: string) => {
    // Sanitize to lowercase alphanumeric, dots and hyphens
    const clean = val.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    setUsername(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('O login de usuário deve ter no mínimo 3 caracteres.');
      return;
    }
    if (!password || password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        username: username.trim(),
        sector,
        role: role.trim() || undefined,
        password,
      });
      onRegisterSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Nome Completo */}
      <div>
        <label className="block text-xs font-bold text-tec-navy mb-1">Nome Completo</label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mariana Costa"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Login e Setor em 2 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-tec-navy mb-1">Usuário / Login</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="ex: mariana.c"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-tec-navy mb-1">Setor no Fluxo</label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <select
              value={sector}
              onChange={(e) => handleSectorChange(e.target.value as SectorType)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
            >
              {SECTOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Descrição do Setor selecionado */}
      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-tec-orange shrink-0 mt-0.5" />
        <span>
          <strong className="text-tec-navy font-bold">{SECTOR_OPTIONS.find((s) => s.value === sector)?.label}:</strong>{' '}
          {SECTOR_OPTIONS.find((s) => s.value === sector)?.desc}
        </span>
      </div>

      {/* Cargo / Função */}
      <div>
        <label className="block text-xs font-bold text-tec-navy mb-1">Cargo / Função Sugerida</label>
        <div className="relative">
          <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Vendedor(a) Técnico(a)"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Senha e Confirmação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-tec-navy mb-1">Senha</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-tec-navy mb-1">Confirmar Senha</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 px-4 bg-tec-orange hover:bg-tec-orange-hover text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <span>Criando conta e preparando esteira...</span>
        ) : (
          <>
            <span>Cadastrar e Acessar Esteira</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Switcher para login */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs font-semibold text-tec-navy hover:text-tec-orange transition-colors cursor-pointer"
        >
          Já possui conta cadastrada? <span className="underline">Fazer Login</span>
        </button>
      </div>
    </form>
  );
};
