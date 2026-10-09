import type { RncItem, RncDetail, UserProfile, KpiSummary, BiMetricsResponse, BiFilterParams } from '../types';

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://localhost:8001/api';
};

export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await fetch(`${getBaseUrl()}/users`);
  if (!res.ok) throw new Error('Erro ao listar usuários');
  return res.json();
}

export async function fetchKpis(): Promise<KpiSummary> {
  const res = await fetch(`${getBaseUrl()}/kpis`);
  if (!res.ok) throw new Error('Erro ao carregar KPIs');
  return res.json();
}

export async function fetchRncs(sector?: string, status?: string, search?: string): Promise<RncItem[]> {
  const params = new URLSearchParams();
  if (sector && sector !== 'gestao') params.append('sector', sector);
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const qs = params.toString();
  const url = `${getBaseUrl()}/rncs${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar RNCs');
  return res.json();
}

export async function fetchRnc(id: number): Promise<RncDetail> {
  const res = await fetch(`${getBaseUrl()}/rncs/${id}`);
  if (!res.ok) throw new Error(`Erro ao buscar RNC #${id}`);
  return res.json();
}

export async function createRnc(payload: any): Promise<RncDetail> {
  const res = await fetch(`${getBaseUrl()}/rncs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro ao abrir RNC' }));
    throw new Error(err.detail || 'Erro ao abrir RNC');
  }
  return res.json();
}

export async function transitionRnc(id: number, targetStep: string, payload: any, userName: string): Promise<RncDetail> {
  const res = await fetch(`${getBaseUrl()}/rncs/${id}/transition?target_step=${targetStep}&user_name=${encodeURIComponent(userName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro ao transicionar etapa' }));
    throw new Error(err.detail || 'Erro ao transicionar etapa');
  }
  return res.json();
}

export async function returnStep(id: number, motivo: string, userName: string = 'Operador'): Promise<any> {
  const res = await fetch(`${getBaseUrl()}/rncs/${id}/return-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo, user_name: userName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro ao retornar etapa' }));
    throw new Error(err.detail || 'Erro ao retornar etapa');
  }
  return res.json();
}

export async function uploadAttachment(id: number, file: File, step: string, category: string, userName: string): Promise<any> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('step', step);
  fd.append('category', category);
  fd.append('uploaded_by', userName);

  const res = await fetch(`${getBaseUrl()}/rncs/${id}/attachments`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Erro ao enviar anexo');
  return res.json();
}

export async function loginUser(username: string, password: string): Promise<{ authenticated: boolean; token: string; user: UserProfile }> {
  const res = await fetch(`${getBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Usuário ou senha incorretos' }));
    throw new Error(err.detail || 'Usuário ou senha incorretos');
  }
  return res.json();
}

export async function registerUser(payload: {
  name: string;
  username: string;
  sector: string;
  role?: string;
  password: string;
}): Promise<{ authenticated: boolean; token: string; user: UserProfile }> {
  const res = await fetch(`${getBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro ao cadastrar usuário' }));
    throw new Error(err.detail || 'Erro ao cadastrar usuário');
  }
  return res.json();
}

export async function createRncWithAttachment(formData: FormData): Promise<RncDetail> {
  const res = await fetch(`${getBaseUrl()}/rncs/create-with-attachment`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro ao abrir RNC com anexo' }));
    throw new Error(err.detail || 'Erro ao abrir RNC com anexo');
  }
  return res.json();
}

export async function cancelRnc(id: number, motivo: string, userName: string): Promise<RncDetail> {
  const res = await fetch(`${getBaseUrl()}/rncs/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo, user_name: userName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro ao cancelar RNC' }));
    throw new Error(err.detail || 'Erro ao cancelar RNC');
  }
  return res.json();
}

export async function fetchBiMetrics(filters: BiFilterParams = {}): Promise<BiMetricsResponse> {
  const params = new URLSearchParams();
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.tipo_fluxo && filters.tipo_fluxo !== 'todos') params.append('tipo_fluxo', filters.tipo_fluxo);
  if (filters.sector && filters.sector !== 'todos') params.append('sector', filters.sector);

  const qs = params.toString();
  const url = `${getBaseUrl()}/bi/metrics${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao carregar métricas de BI');
  return res.json();
}

