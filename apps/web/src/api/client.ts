import { useAppStore } from '../store/useAppStore';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAppStore.getState().token;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Idempotency key for critical mutations
  if (options.method === 'POST' || options.method === 'PUT') {
    if (!headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    }
  }

  const isLowInternet = useAppStore.getState().lowInternetMode;
  const timeoutMs = isLowInternet ? 15000 : 8000;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(timeoutMs)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err: any) {
    // If backend is booting, provide graceful offline fallback
    console.warn(`[API Client] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  sendOtp: (phone: string) => request<any>('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) => request<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  getMe: () => request<any>('/auth/me'),

  // Locations & Places
  searchPlaces: (q: string) => request<any>(`/locations/search?q=${encodeURIComponent(q)}`),
  getMultimodalPlan: (body: any) => request<any>('/locations/multimodal-plan', { method: 'POST', body: JSON.stringify(body) }),

  // Fares
  getQuotes: (body: any) => request<any>('/fares/quotes', { method: 'POST', body: JSON.stringify(body) }),
  lockFare: (quote: any) => request<any>('/fares/lock', { method: 'POST', body: JSON.stringify({ quote }) }),
  getFareAudit: (bookingId: string) => request<any>(`/fares/audit/${bookingId}`),

  // Bookings
  createBooking: (body: any) => request<any>('/bookings/create', { method: 'POST', body: JSON.stringify(body) }),
  getBooking: (id: string) => request<any>(`/bookings/${id}`),
  driverResponse: (id: string, body: any) => request<any>(`/bookings/${id}/driver-response`, { method: 'POST', body: JSON.stringify(body) }),
  transitionBooking: (id: string, body: any) => request<any>(`/bookings/${id}/transition`, { method: 'POST', body: JSON.stringify(body) }),
  passengerCancel: (id: string, reason: string) => request<any>(`/bookings/${id}/passenger-cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Driver
  getDriverProfile: () => request<any>('/drivers/profile'),
  toggleDriverStatus: (isOnline: boolean) => request<any>('/drivers/toggle-status', { method: 'POST', body: JSON.stringify({ isOnline }) }),
  updateDriverLocation: (coordinates: [number, number], bearing?: number) => request<any>('/drivers/location', { method: 'POST', body: JSON.stringify({ coordinates, bearing }) }),
  getDriverEarningsPreview: (body: any) => request<any>('/drivers/earnings-preview', { method: 'POST', body: JSON.stringify(body) }),
  getDriverActiveRide: () => request<any>('/drivers/active-ride'),

  // Safety
  triggerSos: (body: any) => request<any>('/safety/sos', { method: 'POST', body: JSON.stringify(body) }),
  checkRouteDeviation: (body: any) => request<any>('/safety/route-deviation-check', { method: 'POST', body: JSON.stringify(body) }),
  respondDeviation: (body: any) => request<any>('/safety/deviation-response', { method: 'POST', body: JSON.stringify(body) }),
  getSafetyIncidents: () => request<any>('/safety/incidents'),
  patchSafetyIncident: (id: string, body: any) => request<any>(`/safety/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Disputes
  createDispute: (body: any) => request<any>('/disputes/create', { method: 'POST', body: JSON.stringify(body) }),
  getMyDisputes: () => request<any>('/disputes/my'),
  getAllDisputes: () => request<any>('/disputes/all'),
  resolveDispute: (id: string, body: any) => request<any>(`/disputes/${id}/resolve`, { method: 'POST', body: JSON.stringify(body) }),

  // Payments & Wallet
  createPaymentOrder: (body: any) => request<any>('/payments/create-order', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (body: any) => request<any>('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
  getWallet: () => request<any>('/wallet/my'),
  topupWallet: (amount: number) => request<any>('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }),
  withdrawDriver: (amount: number, bankOrUpi: string) => request<any>('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, bankOrUpi }) }),

  // Corporate
  getCorporateAccount: () => request<any>('/corporate/account'),
  corporateApproval: (id: string, body: any) => request<any>(`/corporate/bookings/${id}/approval`, { method: 'POST', body: JSON.stringify(body) }),

  // AI & Voice
  parseVoiceBooking: (transcript: string) => request<any>('/ai/parse-voice-booking', { method: 'POST', body: JSON.stringify({ transcript }) }),
  getDemandHeatmap: (city = 'Hyderabad') => request<any>(`/ai/demand-heatmap?city=${encodeURIComponent(city)}`),

  // Admin
  getAdminOverview: () => request<any>('/admin/overview'),
  getLiveOperations: () => request<any>('/admin/live-operations'),
  verifyDriver: (id: string, body: any) => request<any>(`/admin/drivers/${id}/verify`, { method: 'POST', body: JSON.stringify(body) }),
  getFraudAlerts: () => request<any>('/admin/fraud-alerts'),
  actionFraudAlert: (id: string, body: any) => request<any>(`/admin/fraud-alerts/${id}/action`, { method: 'POST', body: JSON.stringify(body) }),
  getAuditLogs: () => request<any>('/admin/audit-logs'),
  getUsers: (params?: { search?: string; role?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.role) q.append('role', params.role);
    const qs = q.toString();
    return request<any>(`/admin/users${qs ? '?' + qs : ''}`);
  }
};
