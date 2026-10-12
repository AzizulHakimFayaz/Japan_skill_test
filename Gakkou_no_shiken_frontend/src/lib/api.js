function getApiBase() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://gakkounoshiken.site';
}

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
  const apiBase = getApiBase();
  const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
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

export async function submitQuiz(id, answers, preview = null) {
  const query = preview ? `?preview=${encodeURIComponent(preview)}` : '';
  const bodyPayload = typeof answers === 'object' && answers !== null && !Array.isArray(answers) && answers.answers
    ? { ...answers, preview }
    : { answers, preview };
  return apiRequest(`/api/tests/${id}/submit/${query}`, {
    method: 'POST',
    body: JSON.stringify(bodyPayload),
  });
}

export async function getAttemptResults(id, preview = null) {
  const query = preview ? `?preview=${encodeURIComponent(preview)}` : '';
  return apiRequest(`/api/attempts/${id}/${query}`, { cache: 'no-store' });
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


export async function sendRegistrationOTP(username, email, password, passwordConfirm, firstName = '', lastName = '', country = '') {
  return apiRequest('/api/auth/send-otp/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      first_name: firstName,
      last_name: lastName,
      country,
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

export async function registerUser(username, email, password, passwordConfirm, firstName = '', lastName = '', country = '') {
  const data = await apiRequest('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      first_name: firstName,
      last_name: lastName,
      country,
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

export async function forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, password, passwordConfirm = '') {
  return apiRequest('/api/auth/reset-password/', {
    method: 'POST',
    body: JSON.stringify({
      token,
      password,
      password_confirm: passwordConfirm,
    }),
  });
}

export async function confirmCountry(country) {
  const data = await apiRequest('/api/auth/confirm-country/', {
    method: 'POST',
    body: JSON.stringify({ country }),
  });
  if (data?.user) {
    setStoredUser(data.user);
  }
  return data;
}

export async function detectVisitorCountry() {
  try {
    return await apiRequest('/api/auth/detect-country/', { cache: 'no-store' });
  } catch (err) {
    return { country: 'Bangladesh', is_detected: false };
  }
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

// ─── Notices, Notifications & PDF Study Materials API ───
export async function getNotices(params = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.audience) query.set('audience', params.audience);
  if (params.pinned !== undefined) query.set('pinned', String(params.pinned));
  if (params.popup !== undefined) query.set('popup', String(params.popup));
  if (params.search) query.set('search', params.search);
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiRequest(`/api/notices/${qs ? `?${qs}` : ''}`);
}

export async function getNoticeDetail(id) {
  return apiRequest(`/api/notices/${id}/`);
}

export async function downloadNoticePdf(id) {
  return apiRequest(`/api/notices/${id}/download/`, {
    method: 'POST',
  });
}

// ─── Curriculum & Study Hub API ───
export async function getCurriculumLessons(params = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.level) query.set('level', params.level);
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  return apiRequest(`/api/curriculum/lessons/${qs ? `?${qs}` : ''}`);
}

export async function getCurriculumLessonDetail(id) {
  return apiRequest(`/api/curriculum/lessons/${id}/`);
}

export async function searchCurriculum(q) {
  if (!q) return { vocabularies: [], kanjis: [] };
  return apiRequest(`/api/curriculum/search/?q=${encodeURIComponent(q)}`);
}
// ─── Exam Books & Interactive PDF Reader API ───
import { FALLBACK_BOOKS, FALLBACK_TOPICS, getTopicsForBook } from './booksData';

export async function getBooks(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.language && params.language !== 'all') query.set('language', params.language);
    if (params.book_type && params.book_type !== 'all') query.set('book_type', params.book_type);
    if (params.q) query.set('q', params.q);

    const qs = query.toString();
    const data = await apiRequest(`/api/books/${qs ? `?${qs}` : ''}`);
    if (data && data.books && data.books.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('API getBooks failed, utilizing fallback catalog:', err);
  }

  // Filter fallback books locally
  let filtered = [...FALLBACK_BOOKS];
  if (params.category && params.category !== 'all') {
    filtered = filtered.filter((b) => b.category === params.category);
  }
  if (params.language && params.language !== 'all') {
    filtered = filtered.filter((b) => b.language === params.language);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.title_ja && b.title_ja.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }

  return {
    books: filtered,
    total_count: filtered.length,
    languages: [],
    categories: [],
  };
}

export async function getBookDetail(id) {
  try {
    const data = await apiRequest(`/api/books/${id}/`);
    if (data && data.id) {
      const verified = FALLBACK_BOOKS.find((b) => String(b.id) === String(id)) || FALLBACK_BOOKS.find((b) => b.pdf_download_url === data.pdf_download_url);
      if (verified?.total_pages && (!data.total_pages || data.total_pages < verified.total_pages)) {
        data.total_pages = verified.total_pages;
      }
      if (!data.topics || !Array.isArray(data.topics) || data.topics.length === 0) {
        data.topics = getTopicsForBook(data);
      }
      return data;
    }
  } catch (err) {
    console.warn(`API getBookDetail(${id}) failed, utilizing fallback book:`, err);
  }

  const numId = parseInt(id, 10);
  const matched = FALLBACK_BOOKS.find((b) => b.id === numId) || FALLBACK_BOOKS[0];
  return {
    ...matched,
    topics: (matched.topics && matched.topics.length > 0) ? matched.topics : getTopicsForBook(matched),
  };
}

export async function getBookLanguages() {
  try {
    return await apiRequest('/api/books/languages/');
  } catch {
    return [];
  }
}

