// Centralized API Client for Django REST Framework Backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://gakkounoshiken.site' : 'http://127.0.0.1:8000');


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
    'Accept': 'application/json, text/plain, */*',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  // On server, add a 6-second timeout safeguard to prevent serverless hanging
  if (typeof window === 'undefined' && !fetchOptions.signal) {
    fetchOptions.signal = AbortSignal.timeout(6000);
  }

  const response = await fetch(url, fetchOptions);

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMsg = 'API Request Failed';
    if (isJson && typeof data === 'object' && data !== null) {
      errorMsg = data.detail || data.message || data.error || (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null) || Object.values(data).flat().join(', ') || 'Request failed';
    } else if (response.status === 404) {
      errorMsg = 'Backend endpoint not found (404). Please verify that NEXT_PUBLIC_API_URL is set to your Railway backend URL.';
    } else if (response.status >= 500) {
      errorMsg = 'Backend server error (500). Please check your Railway backend deployment logs.';
    } else if (typeof data === 'string' && !data.includes('<html') && !data.includes('<!DOCTYPE')) {
      errorMsg = data;
    } else {
      errorMsg = `Connection failed (${response.status}). Please check your backend connection.`;
    }
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
  return apiRequest(`/api/tests/${query}`, { next: { revalidate: 60 } });
}

export async function getTestDetail(id) {
  return apiRequest(`/api/tests/${id}/`, { next: { revalidate: 300 } });
}

export async function getQuizData(id, preview = null) {
  const query = preview ? `?preview=${preview}` : '';
  return apiRequest(`/api/tests/${id}/quiz/${query}`, { cache: 'no-store' });
}

export async function submitQuiz(id, answers) {
  return apiRequest(`/api/tests/${id}/submit/`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function getAttemptResults(id) {
  return apiRequest(`/api/attempts/${id}/`, { cache: 'no-store' });
}

// ─── Static / Overview Data ───
export async function getJftInfo() {
  return apiRequest('/api/info/jft/', { next: { revalidate: 3600 } });
}

export async function getSswInfo() {
  return apiRequest('/api/info/ssw/', { next: { revalidate: 3600 } });
}

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

export async function googleAuthLogin(idToken) {
  const data = await apiRequest('/api/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  if (data?.tokens?.access) {
    setAuthTokens(data.tokens.access, data.tokens.refresh);
    setStoredUser(data.user);
  }
  return data;
}


export async function sendRegistrationOTP(username, email, password, passwordConfirm, firstName = '', lastName = '') {
  return apiRequest('/api/auth/send-otp/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirm: passwordConfirm,
    }),
  });
}

export async function verifyRegistrationOTP(email, otpCode) {
  const data = await apiRequest('/api/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code: otpCode }),
  });
  if (data?.tokens?.access) {
    setAuthTokens(data.tokens.access, data.tokens.refresh);
    setStoredUser(data.user);
  }
  return data;
}

export async function resendRegistrationOTP(email) {
  return apiRequest('/api/auth/resend-otp/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function registerUser(username, email, password, passwordConfirm, firstName = '', lastName = '') {
  const data = await apiRequest('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      first_name: firstName,
      last_name: lastName,
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

export async function getUserProfile() {
  return apiRequest('/api/auth/profile/');
}

export async function updateUserProfile(profileData) {
  const data = await apiRequest('/api/auth/profile/', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (data?.user) {
    setStoredUser(data.user);
  }
  return data;
}

export async function getMyResults() {
  return apiRequest('/api/auth/my-results/');
}

// ─── Leaderboard & Rankings API ───
export async function getLeaderboard() {
  return apiRequest('/api/leaderboard/');
}

export async function getCandidateProfile(username) {
  return apiRequest(`/api/candidates/${encodeURIComponent(username)}/`);
}


