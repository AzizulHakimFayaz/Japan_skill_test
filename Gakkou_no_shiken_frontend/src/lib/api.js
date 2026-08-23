// Centralized API Client for Django REST Framework Backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

export function setAuthTokens(access, refresh) {
  if (typeof window === 'undefined') return;
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_info');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user_info', JSON.stringify(user));
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || 'no-store',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || (typeof data === 'object' ? JSON.stringify(data) : data) || 'API Request Failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ─── Tests & Quiz APIs ───
export async function getTests(category = '') {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest(`/api/tests/${query}`);
}

export async function getTestDetail(id) {
  return apiRequest(`/api/tests/${id}/`);
}

export async function getQuizData(id) {
  return apiRequest(`/api/tests/${id}/quiz/`);
}

export async function submitQuiz(id, answers) {
  return apiRequest(`/api/tests/${id}/submit/`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function getAttemptResults(id) {
  return apiRequest(`/api/attempts/${id}/`);
}

// ─── Static / Overview Data ───
export async function getJftInfo() {
  return apiRequest('/api/info/jft/');
}

export async function getSswInfo() {
  return apiRequest('/api/info/ssw/');
}

// ─── Authentication APIs ───
export async function loginUser(username, password) {
  const data = await apiRequest('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (data?.tokens?.access) {
    setAuthTokens(data.tokens.access, data.tokens.refresh);
    setStoredUser(data.user);
  }
  return data;
}

export async function registerUser(username, email, password, passwordConfirm) {
  const data = await apiRequest('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      password_confirm: passwordConfirm,
    }),
  });
  if (data?.tokens?.access) {
    setAuthTokens(data.tokens.access, data.tokens.refresh);
    setStoredUser(data.user);
  }
  return data;
}

export async function getMe() {
  return apiRequest('/api/auth/me/');
}

export async function getMyResults() {
  return apiRequest('/api/auth/my-results/');
}
