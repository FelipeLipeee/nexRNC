import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { RncQueueTable } from './components/RncQueueTable';
import { RncKanban } from './components/RncKanban';
import { NewRncModal } from './components/forms/NewRncModal';
import { StepHandoffModal } from './components/forms/StepHandoffModal';
import { RncDetailModal } from './components/RncDetailModal';
import { LoginScreen } from './components/LoginScreen';
import { BiDashboard } from './components/bi/BiDashboard';
import { fetchKpis, fetchRncs, transitionRnc, returnStep } from './services/api';
import type { UserProfile, RncItem, KpiSummary } from './types';
import { canCreateRnc, isExecutiveUser, isRncInUserSector } from './types';
import { Search, RefreshCw, CheckCircle } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nexrnc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const [activeView, setActiveView] = useState<'queue' | 'kanban' | 'bi'>('queue');
  const [filterMode, setFilterMode] = useState<'all' | 'my_sector' | 'my_rncs'>('my_sector');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'em_andamento' | 'concluido' | ''>('em_andamento');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'my_bancada' | 'em_transito' | 'atrasadas' | 'concluidas' | null>(null);

  const [rncs, setRncs] = useState<RncItem[]>([]);
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRncForAction, setSelectedRncForAction] = useState<RncItem | null>(null);
  const [selectedRncIdForDetail, setSelectedRncIdForDetail] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiData, rncList] = await Promise.all([
        fetchKpis().catch(() => null),
        fetchRncs(undefined, statusFilter || undefined, search || undefined),
      ]);
      setKpis(kpiData);
      setRncs(rncList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, search, statusFilter]);

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    localStorage.setItem('nexrnc_user', JSON.stringify(user));
    localStorage.setItem('nexrnc_token', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexrnc_user');
    localStorage.removeItem('nexrnc_token');
    setCurrentUser(null);
  };

  const handleTransition = async (rncId: number, targetStep: string, payload: any) => {
    if (!currentUser) return;
    await transitionRnc(rncId, targetStep, payload, currentUser.name);
    await loadData();
    showNotification('Etapa concluída e bastão repassado com sucesso!', 'success');
  };

  const handleReturnStep = async (rncId: number, motivo: string) => {
    if (!currentUser) return;
    await returnStep(rncId, motivo, currentUser.name);
    await loadData();
    showNotification('Etapa retornada com sucesso!', 'info');
  };

  // If not authenticated, show full Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const handleSelectKpiCard = (type: 'my_bancada' | 'em_transito' | 'atrasadas' | 'concluidas') => {
    if (activeKpiFilter === type) {
      setActiveKpiFilter(null);
      setFilterMode('my_sector');
      setStatusFilter('em_andamento');
      return;
    }

    setActiveKpiFilter(type);
    if (type === 'my_bancada') {
      setFilterMode('my_sector');
      setStatusFilter('em_andamento');
    } else if (type === 'em_transito') {
      setFilterMode('all');
      setStatusFilter('em_andamento');
    } else if (type === 'atrasadas') {
      setFilterMode('all');
      setStatusFilter('em_andamento');
    } else if (type === 'concluidas') {
      setFilterMode('all');
      setStatusFilter('concluido');
    }
  };

  const displayedRncs = rncs.filter((r) => {
    if (activeKpiFilter === 'atrasadas') {
      if (r.sla_status !== 'atrasado' || r.status === 'concluido' || r.status === 'cancelado') {
        return false;
      }
    }

    if (filterMode === 'my_rncs') {
      return r.criado_por === currentUser.name || (Boolean(r.criado_por) && r.criado_por.includes(currentUser.username));
    }
    if (filterMode === 'my_sector') {
      return isRncInUserSector(currentUser, r);
    }
    return true;
  });

  const myQueueCount = rncs.filter((r) => isRncInUserSector(currentUser, r) && r.status !== 'concluido').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl shadow-xl font-medium text-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-100" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header with user badge and logout */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        activeView={activeView}
        onToggleView={(view) => {
          if (view === 'bi' && !isExecutiveUser(currentUser)) return;
          setActiveView(view);
        }}
        onOpenNewRnc={() => {
          if (canCreateRnc(currentUser)) {
            setIsNewModalOpen(true);
          }
        }}
        onDataRefresh={fetchRncs}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'bi' && isExecutiveUser(currentUser) ? (
          <BiDashboard onOpenDetail={(rncId) => setSelectedRncIdForDetail(rncId)} />
        ) : (
          <>
            {/* Executive Context Banner */}
            <div className="bg-gradient-to-r from-tec-navy via-tec-navy-light to-tec-navy rounded-xl p-5 mb-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-tec-orange text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Esteira Operacional
                  </span>
                  <span className="text-xs text-slate-300">
                    Governança de Qualidade (SGI) & Comercial
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Gestão de Não Conformidades (RNC) & Controle de SLA
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Conectado à base corporativa • Sessão ativa de: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-tec-navy-dark/80 px-4 py-2 rounded-lg border border-gray-700/60 text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Na Fila do Meu Setor
                  </span>
                  <span className="text-xl font-black text-tec-orange font-mono">
                    {myQueueCount}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Cards in Crisp White - Now Interactive */}
            <KpiCards
              kpis={kpis}
              myQueueCount={myQueueCount}
              currentSector={currentUser.sector}
              activeFilter={activeKpiFilter}
              onSelectFilter={handleSelectKpiCard}
            />

            {/* Active Card Filter Banner */}
            {activeKpiFilter && (
              <div className="mb-4 flex items-center justify-between bg-white border border-tec-orange/30 p-3 rounded-xl shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-tec-navy">Filtro Ativo do Card:</span>
                  <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-tec-orange">
                    {activeKpiFilter === 'my_bancada' && 'Na Minha Bancada'}
                    {activeKpiFilter === 'em_transito' && 'Total em Trânsito (Em Andamento)'}
                    {activeKpiFilter === 'atrasadas' && 'SLA Atrasado (Prazo Estourado)'}
                    {activeKpiFilter === 'concluidas' && 'Concluídas / Baixadas'}
                  </span>
                  <span className="text-slate-500 font-medium">
                    Exibindo {displayedRncs.length} de {rncs.length} ocorrência(s)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveKpiFilter(null);
                    setFilterMode('my_sector');
                    setStatusFilter('em_andamento');
                  }}
                  className="text-xs font-bold text-tec-orange hover:text-tec-orange-hover hover:underline cursor-pointer px-2 py-1 rounded"
                >
                  Remover Filtro
                </button>
              </div>
            )}

            {/* Global Toolbar */}
            <div className="mt-2 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
              
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por protocolo, cliente, produto ou nota fiscal..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tec-orange focus:bg-white transition-all"
                />
              </div>

              {/* Filters and View Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button onClick={() => { setStatusFilter('em_andamento'); setActiveKpiFilter(null); }} className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${statusFilter === 'em_andamento' && activeKpiFilter !== 'concluidas' ? 'bg-white text-tec-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                    Em Andamento
                  </button>
                  <button onClick={() => { setStatusFilter('concluido'); setActiveKpiFilter(null); }} className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${statusFilter === 'concluido' ? 'bg-white text-tec-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                    Concluídas
                  </button>
                  <button onClick={() => { setStatusFilter(''); setActiveKpiFilter(null); }} className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${statusFilter === '' ? 'bg-white text-tec-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                    Todas
                  </button>
                </div>

                <button
                  onClick={loadData}
                  disabled={loading}
                  className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50 cursor-pointer"
                  title="Atualizar dados"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-tec-orange' : ''}`} />
                </button>
              </div>
            </div>

            {/* Dynamic View: Queue Table vs Kanban Board */}
            {activeView === 'queue' ? (
              <RncQueueTable
                rncs={displayedRncs}
                currentUser={currentUser}
                onOpenDetail={(rnc) => setSelectedRncIdForDetail(rnc.id)}
                onOpenAction={(rnc) => setSelectedRncForAction(rnc)}
                filterMode={filterMode}
                onFilterModeChange={setFilterMode}
              />
            ) : (
              <RncKanban
                rncs={rncs}
                currentUser={currentUser}
                onOpenDetail={(rnc) => setSelectedRncIdForDetail(rnc.id)}
                onOpenAction={(rnc) => setSelectedRncForAction(rnc)}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <NewRncModal
        isOpen={isNewModalOpen && canCreateRnc(currentUser)}
        onClose={() => setIsNewModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
          showNotification('Nova RNC aberta com sucesso!', 'success');
        }}
      />

      <StepHandoffModal
        isOpen={!!selectedRncForAction}
        onClose={() => setSelectedRncForAction(null)}
        rnc={selectedRncForAction}
        currentUser={currentUser}
        onSubmitTransition={handleTransition}
        onReturnStep={handleReturnStep}
      />

      <RncDetailModal
        isOpen={!!selectedRncIdForDetail}
        onClose={() => setSelectedRncIdForDetail(null)}
        rncId={selectedRncIdForDetail}
        currentUser={currentUser}
        onOpenAction={(rnc) => setSelectedRncForAction(rnc)}
        onUpdated={loadData}
      />

    </div>
  );
}

export default App;
