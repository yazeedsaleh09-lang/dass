import { describe, expect, it } from 'vitest';
import { createDemoPlatform } from './demo-platform.js';
import type { StorageLike } from './types.js';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const account = {
  displayName: 'يزيد Player', username: 'yazed_1', email: 'YAZED@example.com',
  password: 'safePass8', acceptedTerms: true,
};

describe('local demo account adapter', () => {
  it('creates one normalized local session and never marks it verified', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    const session = await service.signUp(account);
    expect(session).toMatchObject({ displayName: 'يزيد Player', username: 'yazed_1', email: 'yazed@example.com', verified: false, mode: 'demo', plan: 'free' });
    expect(service.getSession()?.id).toBe(session.id);
  });

  it('rejects unsafe input and terms bypass', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await expect(service.signUp({ ...account, displayName: '<b>x</b>' })).rejects.toThrow('رموزًا غير مدعومة');
    await expect(service.signUp({ ...account, acceptedTerms: false })).rejects.toThrow('وافق على الشروط');
  });

  it('reports duplicate local email and username states', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    await service.signOut();
    await expect(service.signUp(account)).rejects.toThrow('البريد مستخدم');
    await expect(service.signUp({ ...account, email: 'second@example.com' })).rejects.toThrow('اسم المستخدم مستخدم');
  });

  it('rejects unknown demo credentials and restores a known local identity', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await expect(service.signIn('missing@example.com', 'safePass8')).rejects.toThrow('بيانات الدخول غير صحيحة');
    await service.signUp(account);
    await service.updateProfile({ displayName: 'اسم محدث', username: 'updated_name' });
    await service.signOut();
    const session = await service.signIn('yazed@example.com', 'anotherPass9');
    expect(session).toMatchObject({ displayName: 'اسم محدث', username: 'updated_name' });
  });

  it('does not claim to send a password reset email', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await expect(service.requestPasswordReset('player@example.com')).resolves.toEqual({ delivered: false, demo: true });
  });

  it('supports guest and sign-out session notifications', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    const changes: Array<string | null> = [];
    service.subscribeToSessionChanges((session) => changes.push(session?.mode ?? null));
    await service.continueAsGuest('ضيف عربي');
    await service.signOut();
    expect(changes).toEqual(['guest', null]);
  });
});

describe('local demo entitlements and checkout', () => {
  it('derives product price from the catalog and grants only successful checkouts', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const failed = await service.createCheckout('product', 'avatar-falcon');
    expect(failed.price.amountMinor).toBe(700);
    await service.completeDemoCheckout(failed.id, 'failed');
    expect(service.getInventory().ownedProductIds).not.toContain('avatar-falcon');

    const success = await service.createCheckout('product', 'avatar-falcon');
    await service.completeDemoCheckout(success.id, 'succeeded');
    expect(service.getInventory().ownedProductIds).toContain('avatar-falcon');
    expect(service.getPurchaseHistory()).toHaveLength(1);
    expect(service.getPurchaseHistory()[0]).toMatchObject({ demo: true, totalMinor: 700 });
  });

  it('is idempotent when a completed checkout is submitted twice', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const checkout = await service.createCheckout('product', 'frame-gold');
    await service.completeDemoCheckout(checkout.id, 'succeeded');
    await service.completeDemoCheckout(checkout.id, 'succeeded');
    expect(service.getPurchaseHistory()).toHaveLength(1);
    expect(service.getInventory().ownedProductIds.filter((id) => id === 'frame-gold')).toHaveLength(1);
  });

  it('keeps one equipped cosmetic per category and supports safe unequip', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const checkout = await service.createCheckout('product', 'theme-sadu');
    await service.completeDemoCheckout(checkout.id, 'succeeded');
    await service.equipProduct('theme-sadu');
    expect(service.getInventory().equipped.theme).toBe('theme-sadu');
    await service.equipProduct('theme-original');
    expect(service.getInventory().equipped.theme).toBe('theme-original');
    await service.equipProduct('theme-sadu');
    await service.unequipProduct('theme-sadu');
    expect(service.getInventory().equipped.theme).toBe('theme-original');
  });

  it('isolates inventory, receipts, and settings between local identities', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const checkout = await service.createCheckout('product', 'frame-gold');
    await service.completeDemoCheckout(checkout.id, 'succeeded');
    service.updateSettings({ highContrast: true });
    await service.signOut();
    await service.signUp({ ...account, email: 'other@example.com', username: 'other_user' });
    expect(service.getInventory().ownedProductIds).not.toContain('frame-gold');
    expect(service.getPurchaseHistory()).toEqual([]);
    expect(service.getSettings().highContrast).toBe(false);
    await service.signOut();
    await service.signIn(account.email, account.password);
    expect(service.getInventory().ownedProductIds).toContain('frame-gold');
    expect(service.getPurchaseHistory()).toHaveLength(1);
    expect(service.getSettings().highContrast).toBe(true);
  });

  it('does not let another local identity complete a checkout it does not own', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const checkout = await service.createCheckout('product', 'avatar-falcon');
    await service.signOut();
    await service.signUp({ ...account, email: 'other@example.com', username: 'other_user' });
    await expect(service.completeDemoCheckout(checkout.id, 'succeeded')).rejects.toThrow('لا تخص هذا الحساب');
    expect(service.getInventory().ownedProductIds).not.toContain('avatar-falcon');
  });

  it('rejects missing, free, coming-soon, and unowned selections', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    await expect(service.createCheckout('product', 'missing')).rejects.toThrow('غير متاح');
    await expect(service.createCheckout('product', 'season-eid')).rejects.toThrow('غير متاح');
    await expect(service.createCheckout('plan', 'free')).rejects.toThrow('لا تحتاج');
    await expect(service.equipProduct('theme-sadu')).rejects.toThrow('غير مملوك');
  });

  it('upgrades the demo plan only on success', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const checkout = await service.createCheckout('plan', 'majlis-plus', 'year');
    expect(checkout.price.amountMinor).toBe(19000);
    await service.completeDemoCheckout(checkout.id, 'succeeded');
    expect(service.getSession()?.plan).toBe('majlis-plus');
    await service.signOut();
    expect((await service.signIn(account.email, account.password)).plan).toBe('majlis-plus');
    expect((await service.cancelSubscription()).plan).toBe('free');
  });

  it('treats timeout as terminal and grants no entitlement', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    const checkout = await service.createCheckout('product', 'winner-spark');
    expect((await service.completeDemoCheckout(checkout.id, 'timed-out')).status).toBe('timed-out');
    expect(service.getInventory().ownedProductIds).not.toContain('winner-spark');
    expect(service.getPurchaseHistory()).toEqual([]);
  });
});

describe('local demo honesty and deletion', () => {
  it('does not fabricate match history', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    expect(service.getMatchHistory()).toEqual([]);
  });

  it('stores support requests locally and labels their delivery', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    const request = await service.saveSupportRequest({ category: 'problem', subject: 'مشكلة دخول', message: 'تفاصيل كافية عن المشكلة الحالية.' });
    expect(request.delivery).toBe('local-only');
  });

  it('persists bounded settings and profile changes', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    expect(service.updateSettings({ effectsVolume: 400, musicVolume: -20, highContrast: true })).toMatchObject({ effectsVolume: 100, musicVolume: 0, highContrast: true });
    await expect(service.updateProfile({ displayName: '<b>x</b>' })).rejects.toThrow('غير مدعومة');
    await service.updateProfile({ displayName: 'اسم آمن', username: 'safe_name' });
    expect(service.getSession()).toMatchObject({ displayName: 'اسم آمن', username: 'safe_name' });
  });

  it('requires the exact Arabic confirmation before deleting local account data', async () => {
    const service = createDemoPlatform(new MemoryStorage());
    await service.signUp(account);
    await expect(service.deleteLocalAccount('احذف')).rejects.toThrow('اكتب');
    await service.deleteLocalAccount('احذف حسابي');
    expect(service.getSession()).toBeNull();
    expect(service.getPurchaseHistory()).toEqual([]);
  });
});
