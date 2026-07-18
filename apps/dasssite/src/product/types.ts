export type AccountMode = 'guest' | 'demo';
export type PlanId = 'free' | 'majlis-plus' | 'events';
export type CosmeticCategory = 'theme' | 'background' | 'avatar' | 'frame' | 'winner' | 'reveal' | 'seasonal';

export interface Session {
  id: string;
  mode: AccountMode;
  displayName: string;
  username: string;
  email?: string;
  verified: boolean;
  plan: PlanId;
  createdAt: string;
}

export interface Profile {
  displayName: string;
  username: string;
  avatar: string;
  frame: string;
  favoriteCosmetic?: string;
}

export interface UserSettings {
  language: 'ar';
  appearance: 'dass';
  effectsVolume: number;
  musicVolume: number;
  muted: boolean;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: 'normal' | 'large';
  haptics: boolean;
  confirmCritical: boolean;
  autoReady: boolean;
  productUpdates: boolean;
  matchInvites: boolean;
  friendInvites: boolean;
  purchaseReceipts: boolean;
  subscriptionReminders: boolean;
  marketing: boolean;
  profileVisibility: 'private' | 'players' | 'public';
  activityVisibility: boolean;
  recentPlayerVisibility: boolean;
  analytics: boolean;
  functionalCookies: boolean;
}

export interface CatalogPrice {
  amountMinor: number;
  currency: 'SAR';
  interval?: 'month' | 'year' | 'one-time';
  taxInclusive: boolean;
  providerPriceId?: string;
}

export interface CatalogProduct {
  id: string;
  category: CosmeticCategory;
  name: string;
  description: string;
  price: CatalogPrice;
  accent: string;
  glyph: string;
  includedIn?: PlanId;
  comingSoon?: boolean;
}

export interface MembershipPlan {
  id: PlanId;
  name: string;
  description: string;
  monthly?: CatalogPrice;
  yearly?: CatalogPrice;
  features: string[];
  recommended?: boolean;
}

export interface Inventory {
  ownedProductIds: string[];
  equipped: Partial<Record<CosmeticCategory, string>>;
}

export interface MatchSummary {
  id: string;
  playedAt: string;
  roomLabel: string;
  players: number;
  rounds: number;
  durationMinutes: number;
  result: 'win' | 'loss';
  winnerName: string;
  isSample: boolean;
}

export type CheckoutStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'timed-out';
export interface CheckoutSession {
  id: string;
  ownerId: string;
  kind: 'product' | 'plan';
  referenceId: string;
  label: string;
  price: CatalogPrice;
  status: CheckoutStatus;
  demo: true;
  createdAt: string;
}

export interface PurchaseReceipt {
  id: string;
  checkoutId: string;
  label: string;
  totalMinor: number;
  currency: 'SAR';
  createdAt: string;
  demo: true;
}

export interface SupportRequest {
  id: string;
  category: 'problem' | 'player-report' | 'suggestion' | 'billing';
  subject: string;
  message: string;
  email?: string;
  roomCode?: string;
  technicalDetails?: string;
  createdAt: string;
  delivery: 'local-only';
}

export interface SignUpInput {
  displayName: string;
  username: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

export interface PlatformServices {
  readonly mode: 'demo' | 'unavailable';
  getSession(): Session | null;
  subscribeToSessionChanges(listener: (session: Session | null) => void): () => void;
  signIn(email: string, password: string): Promise<Session>;
  signUp(input: SignUpInput): Promise<Session>;
  continueAsGuest(displayName?: string): Promise<Session>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ delivered: false; demo: true }>;
  getProfile(): Profile;
  updateProfile(profile: Partial<Profile>): Promise<Profile>;
  getSettings(): UserSettings;
  updateSettings(settings: Partial<UserSettings>): UserSettings;
  getInventory(): Inventory;
  equipProduct(productId: string): Promise<Inventory>;
  unequipProduct(productId: string): Promise<Inventory>;
  createCheckout(kind: 'product' | 'plan', referenceId: string, interval?: 'month' | 'year'): Promise<CheckoutSession>;
  getCheckout(id: string): CheckoutSession | null;
  completeDemoCheckout(id: string, outcome: Exclude<CheckoutStatus, 'pending'>): Promise<CheckoutSession>;
  getPurchaseHistory(): PurchaseReceipt[];
  cancelSubscription(): Promise<Session>;
  getMatchHistory(): MatchSummary[];
  saveSupportRequest(request: Omit<SupportRequest, 'id' | 'createdAt' | 'delivery'>): Promise<SupportRequest>;
  deleteLocalAccount(confirmation: string): Promise<void>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
