import { planById, productById } from './catalog.js';
import type {
  CheckoutSession,
  CheckoutStatus,
  Inventory,
  MatchSummary,
  PlatformServices,
  Profile,
  PurchaseReceipt,
  Session,
  SignUpInput,
  StorageLike,
  SupportRequest,
  UserSettings,
} from './types.js';
import { validateDisplayName, validateEmail, validatePassword, validateUsername } from './validation.js';

const PREFIX = 'dass.product.v1.';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'ar',
  appearance: 'dass',
  effectsVolume: 70,
  musicVolume: 45,
  muted: false,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  textScale: 'normal',
  haptics: true,
  confirmCritical: true,
  autoReady: false,
  productUpdates: true,
  matchInvites: true,
  friendInvites: false,
  purchaseReceipts: true,
  subscriptionReminders: true,
  marketing: false,
  profileVisibility: 'players',
  activityVisibility: false,
  recentPlayerVisibility: false,
  analytics: false,
  functionalCookies: true,
};

const DEFAULT_PROFILE: Profile = {
  displayName: 'ضيف المجلس',
  username: 'guest',
  avatar: 'theme-original',
  frame: 'theme-original',
};

const DEFAULT_INVENTORY: Inventory = {
  ownedProductIds: ['theme-original'],
  equipped: { theme: 'theme-original' },
};

interface DemoIdentity {
  id: string;
  displayName: string;
  username: string;
  email: string;
  createdAt: string;
  plan: Session['plan'];
}

const DEMO_IDENTITY: DemoIdentity = {
  id: 'demo_user_seed', displayName: 'لاعب تجريبي', username: 'demo_player',
  email: 'demo@backfire.local', createdAt: '2026-01-01T00:00:00.000Z', plan: 'free',
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function id(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

function parse<T>(storage: StorageLike, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) as T : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function save<T>(storage: StorageLike, key: string, value: T): void {
  storage.setItem(PREFIX + key, JSON.stringify(value));
}

function requireValue<T>(result: { ok: true; value: T } | { ok: false; message: string }): T {
  if (!result.ok) throw new Error(result.message);
  return result.value;
}

function scoped(key: string, session: Session | null): string {
  return `${key}.${session?.id ?? 'anonymous'}`;
}

export function createDemoPlatform(storage: StorageLike): PlatformServices {
  const listeners = new Set<(session: Session | null) => void>();
  const notify = (): void => {
    const session = api.getSession();
    for (const listener of listeners) listener(session);
  };
  const requireSession = (): Session => {
    const session = api.getSession();
    if (!session) throw new Error('سجّل الدخول أو تابع كضيف أولًا.');
    return session;
  };

  const api: PlatformServices = {
    mode: 'demo',
    getSession: () => parse<Session | null>(storage, 'session', null),
    subscribeToSessionChanges(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async signIn(email, password) {
      const cleanEmail = requireValue(validateEmail(email));
      requireValue(validatePassword(password));
      const identity = parse<DemoIdentity[]>(storage, 'identities', []).find((candidate) => candidate.email === cleanEmail)
        ?? (cleanEmail === DEMO_IDENTITY.email ? DEMO_IDENTITY : undefined);
      if (!identity) throw new Error('بيانات الدخول غير صحيحة في وضع العرض. أنشئ حسابًا محليًا أولًا.');
      const session: Session = {
        id: identity.id,
        mode: 'demo',
        displayName: identity.displayName,
        username: identity.username,
        email: cleanEmail,
        verified: false,
        plan: identity.plan,
        createdAt: identity.createdAt,
      };
      save(storage, 'session', session);
      const existingProfile = parse<Profile | null>(storage, scoped('profile', session), null);
      if (!existingProfile) save(storage, scoped('profile', session), { ...DEFAULT_PROFILE, displayName: session.displayName, username: session.username });
      notify();
      return clone(session);
    },
    async signUp(input: SignUpInput) {
      if (!input.acceptedTerms) throw new Error('وافق على الشروط وسياسة الخصوصية للمتابعة.');
      const displayName = requireValue(validateDisplayName(input.displayName));
      const username = requireValue(validateUsername(input.username));
      const email = requireValue(validateEmail(input.email));
      requireValue(validatePassword(input.password));
      const identities = parse<DemoIdentity[]>(storage, 'identities', []);
      if (identities.some((identity) => identity.email === email) || email === DEMO_IDENTITY.email) throw new Error('البريد مستخدم مسبقًا في هذا المتصفح.');
      if (identities.some((identity) => identity.username === username) || username === DEMO_IDENTITY.username) throw new Error('اسم المستخدم مستخدم مسبقًا في هذا المتصفح.');
      const createdAt = new Date().toISOString();
      const userId = id('demo_user');
      const session: Session = {
        id: userId, mode: 'demo', displayName, username, email,
        verified: false, plan: 'free', createdAt,
      };
      identities.push({ id: userId, displayName, username, email, createdAt, plan: 'free' });
      save(storage, 'identities', identities);
      save(storage, 'session', session);
      save(storage, scoped('profile', session), { ...DEFAULT_PROFILE, displayName, username });
      save(storage, scoped('settings', session), DEFAULT_SETTINGS);
      save(storage, scoped('inventory', session), DEFAULT_INVENTORY);
      notify();
      return clone(session);
    },
    async continueAsGuest(displayName = DEFAULT_PROFILE.displayName) {
      const cleanName = requireValue(validateDisplayName(displayName));
      const suffix = Math.random().toString(36).slice(2, 7);
      const session: Session = {
        id: id('guest'), mode: 'guest', displayName: cleanName, username: `guest_${suffix}`,
        verified: false, plan: 'free', createdAt: new Date().toISOString(),
      };
      save(storage, 'session', session);
      save(storage, scoped('profile', session), { ...DEFAULT_PROFILE, displayName: cleanName, username: session.username });
      notify();
      return clone(session);
    },
    async signOut() {
      storage.removeItem(PREFIX + 'session');
      notify();
    },
    async requestPasswordReset(email) {
      requireValue(validateEmail(email));
      return { delivered: false, demo: true };
    },
    getProfile() {
      const session = api.getSession();
      return parse<Profile>(storage, scoped('profile', session), session
        ? { ...DEFAULT_PROFILE, displayName: session.displayName, username: session.username }
        : DEFAULT_PROFILE);
    },
    async updateProfile(update) {
      const session = requireSession();
      const profile = api.getProfile();
      const next: Profile = { ...profile, ...update };
      if (update.displayName !== undefined) next.displayName = requireValue(validateDisplayName(update.displayName));
      if (update.username !== undefined) next.username = requireValue(validateUsername(update.username));
      const identities = parse<DemoIdentity[]>(storage, 'identities', []);
      if (identities.some((candidate) => candidate.id !== session.id && candidate.username === next.username) || (session.id !== DEMO_IDENTITY.id && next.username === DEMO_IDENTITY.username)) {
        throw new Error('اسم المستخدم مستخدم مسبقًا في هذا المتصفح.');
      }
      save(storage, scoped('profile', session), next);
      const nextSession = { ...session, displayName: next.displayName, username: next.username };
      save(storage, 'session', nextSession);
      const identity = identities.find((candidate) => candidate.id === session.id);
      if (identity) {
        identity.displayName = next.displayName;
        identity.username = next.username;
        save(storage, 'identities', identities);
      }
      notify();
      return clone(next);
    },
    getSettings: () => {
      const session = api.getSession();
      return { ...DEFAULT_SETTINGS, ...parse<Partial<UserSettings>>(storage, scoped('settings', session), {}) };
    },
    updateSettings(update) {
      requireSession();
      const next = { ...api.getSettings(), ...update };
      next.effectsVolume = Math.min(100, Math.max(0, Number(next.effectsVolume)));
      next.musicVolume = Math.min(100, Math.max(0, Number(next.musicVolume)));
      save(storage, scoped('settings', api.getSession()), next);
      return clone(next);
    },
    getInventory: () => parse<Inventory>(storage, scoped('inventory', api.getSession()), DEFAULT_INVENTORY),
    async equipProduct(productId) {
      requireSession();
      const product = productById(productId);
      if (!product) throw new Error('العنصر غير موجود.');
      const inventory = api.getInventory();
      if (!inventory.ownedProductIds.includes(productId)) throw new Error('العنصر غير مملوك.');
      inventory.equipped[product.category] = productId;
      save(storage, scoped('inventory', api.getSession()), inventory);
      return clone(inventory);
    },
    async unequipProduct(productId) {
      requireSession();
      const product = productById(productId);
      if (!product) throw new Error('العنصر غير موجود.');
      const inventory = api.getInventory();
      if (inventory.equipped[product.category] !== productId) return inventory;
      if (product.category === 'theme') inventory.equipped.theme = 'theme-original';
      else delete inventory.equipped[product.category];
      save(storage, scoped('inventory', api.getSession()), inventory);
      return clone(inventory);
    },
    async createCheckout(kind, referenceId, interval = 'month') {
      const session = requireSession();
      const product = kind === 'product' ? productById(referenceId) : undefined;
      const plan = kind === 'plan' ? planById(referenceId) : undefined;
      if (kind === 'product' && (!product || product.comingSoon)) throw new Error('هذا العنصر غير متاح للشراء.');
      if (kind === 'plan' && (!plan || plan.id === 'free')) throw new Error('هذه الباقة لا تحتاج إلى دفع.');
      const price = product?.price ?? (interval === 'year' ? plan?.yearly : plan?.monthly);
      if (!price) throw new Error('سعر الاختيار غير متاح.');
      const checkout: CheckoutSession = {
        id: id('demo_checkout'), ownerId: session.id, kind, referenceId, label: product?.name ?? plan!.name,
        price, status: 'pending', demo: true, createdAt: new Date().toISOString(),
      };
      save(storage, `checkout.${checkout.id}`, checkout);
      return clone(checkout);
    },
    getCheckout(checkoutId) {
      return parse<CheckoutSession | null>(storage, `checkout.${checkoutId}`, null);
    },
    async completeDemoCheckout(checkoutId, outcome: Exclude<CheckoutStatus, 'pending'>) {
      const currentSession = requireSession();
      const checkout = api.getCheckout(checkoutId);
      if (!checkout) throw new Error('جلسة الدفع غير موجودة.');
      if (checkout.ownerId !== currentSession.id) throw new Error('جلسة الدفع لا تخص هذا الحساب.');
      if (checkout.status !== 'pending') return checkout;
      checkout.status = outcome;
      save(storage, `checkout.${checkout.id}`, checkout);
      if (outcome === 'succeeded') {
        if (checkout.kind === 'product') {
          const inventory = api.getInventory();
          if (!inventory.ownedProductIds.includes(checkout.referenceId)) inventory.ownedProductIds.push(checkout.referenceId);
          save(storage, scoped('inventory', api.getSession()), inventory);
        } else {
          const session = requireSession();
          save(storage, 'session', { ...session, plan: checkout.referenceId as Session['plan'] });
          const identities = parse<DemoIdentity[]>(storage, 'identities', []);
          const identity = identities.find((candidate) => candidate.id === session.id);
          if (identity) { identity.plan = checkout.referenceId as Session['plan']; save(storage, 'identities', identities); }
          notify();
        }
        const receipts = api.getPurchaseHistory();
        const receipt: PurchaseReceipt = {
          id: id('demo_receipt'), checkoutId: checkout.id, label: checkout.label,
          totalMinor: checkout.price.amountMinor, currency: checkout.price.currency,
          createdAt: new Date().toISOString(), demo: true,
        };
        receipts.unshift(receipt);
        save(storage, scoped('receipts', api.getSession()), receipts);
      }
      return clone(checkout);
    },
    getPurchaseHistory: () => parse<PurchaseReceipt[]>(storage, scoped('receipts', api.getSession()), []),
    async cancelSubscription() {
      const session = requireSession();
      const next = { ...session, plan: 'free' as const };
      save(storage, 'session', next);
      const identities = parse<DemoIdentity[]>(storage, 'identities', []);
      const identity = identities.find((candidate) => candidate.id === session.id);
      if (identity) { identity.plan = 'free'; save(storage, 'identities', identities); }
      notify();
      return clone(next);
    },
    getMatchHistory: () => parse<MatchSummary[]>(storage, scoped('matches', api.getSession()), []),
    async saveSupportRequest(request) {
      const subject = request.subject.trim();
      const message = request.message.trim();
      if (subject.length < 3 || subject.length > 100) throw new Error('عنوان الطلب من ٣ إلى ١٠٠ حرف.');
      if (message.length < 10 || message.length > 2000) throw new Error('التفاصيل من ١٠ إلى ٢٠٠٠ حرف.');
      if (request.email) requireValue(validateEmail(request.email));
      const entry: SupportRequest = {
        ...request, subject, message, id: id('demo_support'),
        createdAt: new Date().toISOString(), delivery: 'local-only',
      };
      const requests = parse<SupportRequest[]>(storage, 'support', []);
      requests.unshift(entry);
      save(storage, 'support', requests);
      return clone(entry);
    },
    async deleteLocalAccount(confirmation) {
      if (confirmation.trim() !== 'احذف حسابي') throw new Error('اكتب «احذف حسابي» للتأكيد.');
      const session = requireSession();
      for (const key of ['profile', 'settings', 'inventory', 'receipts', 'matches']) {
        storage.removeItem(PREFIX + scoped(key, session));
      }
      const identities = parse<DemoIdentity[]>(storage, 'identities', []).filter((identity) => identity.id !== session.id);
      save(storage, 'identities', identities);
      storage.removeItem(PREFIX + 'support');
      storage.removeItem(PREFIX + 'session');
      notify();
    },
  };
  return api;
}

export function createUnavailablePlatform(): PlatformServices {
  const unavailable = (): never => { throw new Error('خدمات الحساب والدفع غير موصولة في هذا الإصدار.'); };
  return {
    mode: 'unavailable', getSession: () => null, subscribeToSessionChanges: () => () => undefined,
    signIn: async () => unavailable(), signUp: async () => unavailable(), continueAsGuest: async () => unavailable(),
    signOut: async () => undefined, requestPasswordReset: async () => unavailable(), getProfile: unavailable,
    updateProfile: async () => unavailable(), getSettings: unavailable, updateSettings: unavailable,
    getInventory: unavailable, equipProduct: async () => unavailable(), unequipProduct: async () => unavailable(), createCheckout: async () => unavailable(),
    getCheckout: () => null, completeDemoCheckout: async () => unavailable(), getPurchaseHistory: () => [], cancelSubscription: async () => unavailable(),
    getMatchHistory: () => [], saveSupportRequest: async () => unavailable(), deleteLocalAccount: async () => unavailable(),
  };
}
