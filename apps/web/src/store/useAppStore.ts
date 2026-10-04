import { create } from 'zustand';
import { UserRole, BookingState, VehicleCategory } from '@fairride/types';
import { I18N_STRINGS } from '@fairride/constants';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token?: string;
  trustScore?: number;
  isVerified?: boolean;
  referralCode?: string;
  walletBalance?: number;
  fairPoints?: number;
}

export interface ActiveBookingState {
  bookingId?: string;
  bookingReference?: string;
  state: BookingState;
  pickupAddress: string;
  destinationAddress: string;
  pickupCoords: [number, number];
  destinationCoords: [number, number];
  pickupPointType?: string;
  specificInstructions?: string;
  vehicleCategory: VehicleCategory;
  lockedFare: number;
  finalFare?: number;
  verificationPin?: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehicleModel: string;
    plateNumber: string;
    currentCoords: [number, number];
    etaMinutes: number;
  };
  isRecovered?: boolean;
  routeDeviationFlagged?: boolean;
  timeline: Array<{ event: string; actor: string; timestamp: string }>;
}

interface AppState {
  // Auth & Role
  currentUser: UserSession;
  activeRoleView: 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CORPORATE';
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  setCurrentUser: (user: UserSession, token?: string) => void;
  login: (user: UserSession, token: string) => void;
  logout: () => void;
  setActiveRoleView: (role: 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CORPORATE') => void;
  quickSwitchRole: (role: 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CORPORATE') => void;
  loginDemoPersona: (role: 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CORPORATE') => void;
  refreshProfile: () => Promise<void>;

  // Active Booking
  activeBooking: ActiveBookingState | null;
  setActiveBooking: (booking: Partial<ActiveBookingState> | null) => void;
  updateBookingState: (state: BookingState) => void;

  // Preferences & Accessibility
  seniorMode: boolean;
  toggleSeniorMode: () => void;
  lowInternetMode: boolean;
  toggleLowInternetMode: () => void;
  language: 'en' | 'te' | 'hi' | 'ta' | 'kn';
  setLanguage: (lang: 'en' | 'te' | 'hi' | 'ta' | 'kn') => void;
  t: (key: keyof typeof I18N_STRINGS['en']) => string;

  // Simulation State
  isSimulatingDrive: boolean;
  setSimulatingDrive: (sim: boolean) => void;
}

const DEFAULT_PASSENGER: UserSession = {
  userId: 'usr_demo_aarav_sharma',
  name: 'Aarav Sharma',
  email: 'passenger@fairride.local',
  phone: '+91 9800000002',
  role: 'PASSENGER',
  trustScore: 98
};

const DEFAULT_DRIVER: UserSession = {
  userId: 'usr_demo_rajesh_kumar',
  name: 'Rajesh Kumar',
  email: 'driver@fairride.local',
  phone: '+91 9800000003',
  role: 'DRIVER',
  trustScore: 99
};

const DEFAULT_ADMIN: UserSession = {
  userId: 'usr_demo_sunita_verma',
  name: 'Sunita Verma',
  email: 'admin@fairride.local',
  phone: '+91 9800000001',
  role: 'SUPER_ADMIN',
  trustScore: 100
};

const DEFAULT_CORPORATE: UserSession = {
  userId: 'usr_demo_vikram_patel',
  name: 'Vikram Patel',
  email: 'corporate@fairride.local',
  phone: '+91 9800000004',
  role: 'CORPORATE_MANAGER',
  trustScore: 97
};

const getInitialAuth = (): { user: UserSession; token: string | null; isAuth: boolean } => {
  try {
    const savedUser = localStorage.getItem('fairride_auth_user');
    const savedToken = localStorage.getItem('fairride_auth_token');
    if (savedUser && savedToken) {
      return { user: JSON.parse(savedUser), token: savedToken, isAuth: true };
    }
  } catch {}
  return { user: DEFAULT_PASSENGER, token: 'mock_jwt_token_demo', isAuth: true };
};

const initialAuth = getInitialAuth();

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: initialAuth.user,
  activeRoleView: (initialAuth.user.role as any) || 'PASSENGER',
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuth,
  isAuthModalOpen: false,

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  setCurrentUser: (user, token) => set({ currentUser: user, token: token || get().token }),

  login: (user, token) => {
    try {
      localStorage.setItem('fairride_auth_user', JSON.stringify(user));
      localStorage.setItem('fairride_auth_token', token);
    } catch {}
    set({
      currentUser: user,
      token,
      isAuthenticated: true,
      activeRoleView: (user.role as any) || 'PASSENGER',
      isAuthModalOpen: false
    });
  },

  logout: () => {
    try {
      localStorage.removeItem('fairride_auth_user');
      localStorage.removeItem('fairride_auth_token');
    } catch {}
    set({
      currentUser: {
        userId: 'guest_' + Date.now(),
        name: 'Guest Rider',
        email: 'guest@fairride.local',
        phone: '',
        role: 'PASSENGER',
        trustScore: 80
      },
      token: null,
      isAuthenticated: false
    });
  },

  setActiveRoleView: (role) => set({ activeRoleView: role }),

  quickSwitchRole: (role) => {
    // Switch the active dashboard view without overriding the logged in user's profile
    set({ activeRoleView: role });
  },

  loginDemoPersona: (role) => {
    if (role === 'PASSENGER') {
      get().login(DEFAULT_PASSENGER, 'mock_jwt_token_demo');
    } else if (role === 'DRIVER') {
      get().login(DEFAULT_DRIVER, 'mock_jwt_token_driver');
    } else if (role === 'ADMIN') {
      get().login(DEFAULT_ADMIN, 'mock_jwt_token_admin');
    } else if (role === 'CORPORATE') {
      get().login(DEFAULT_CORPORATE, 'mock_jwt_token_corporate');
    }
  },

  refreshProfile: async () => {
    try {
      const token = get().token;
      if (!token || token.startsWith('mock_')) return;
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        const updated: UserSession = {
          userId: u._id || u.userId,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          trustScore: u.trustScore ?? 99,
          isVerified: u.isVerified ?? true,
          referralCode: u.referralCode,
          walletBalance: u.walletBalance ?? 100,
          fairPoints: u.fairPoints ?? 100
        };
        set({ currentUser: updated });
        localStorage.setItem('fairride_auth_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('[Store] refreshProfile error:', err);
    }
  },

  activeBooking: null,
  setActiveBooking: (booking) =>
    set((state) => ({
      activeBooking: booking === null ? null : ({ ...(state.activeBooking || {}), ...booking } as ActiveBookingState)
    })),

  updateBookingState: (state) =>
    set((s) => ({
      activeBooking: s.activeBooking ? { ...s.activeBooking, state } : null
    })),

  seniorMode: false,
  toggleSeniorMode: () => {
    const next = !get().seniorMode;
    set({ seniorMode: next });
    if (next) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
  },

  lowInternetMode: false,
  toggleLowInternetMode: () => {
    const next = !get().lowInternetMode;
    set({ lowInternetMode: next });
    if (next) {
      document.body.classList.add('low-internet');
    } else {
      document.body.classList.remove('low-internet');
    }
  },

  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  t: (key) => {
    const lang = get().language;
    const strings = I18N_STRINGS[lang] || I18N_STRINGS.en;
    return strings[key] || I18N_STRINGS.en[key] || key;
  },

  isSimulatingDrive: false,
  setSimulatingDrive: (sim) => set({ isSimulatingDrive: sim })
}));
