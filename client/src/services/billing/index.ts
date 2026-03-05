import { Capacitor } from '@capacitor/core';

let Purchases: any = null;
let initialized = false;

async function getPurchases() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!Purchases) {
    const mod = await import('@revenuecat/purchases-capacitor');
    Purchases = mod.Purchases;
  }
  return Purchases;
}

export async function initBilling(): Promise<void> {
  const sdk = await getPurchases();
  if (!sdk || initialized) return;
  const apiKey = Capacitor.getPlatform() === 'ios'
    ? (import.meta.env.VITE_RC_API_KEY_IOS as string)
    : (import.meta.env.VITE_RC_API_KEY_ANDROID as string);
  if (!apiKey) return;
  await sdk.configure({ apiKey });
  initialized = true;
}

export async function startCheckout(plan: 'monthly' | 'yearly'): Promise<void> {
  const sdk = await getPurchases();
  if (!sdk) {
    throw new Error('Subscriptions are managed inside the TalkAtlas mobile app. Download it from the App Store or Google Play.');
  }
  const { current } = await sdk.getOfferings();
  if (!current) throw new Error('No subscription plans available right now. Please try again.');
  const pkg = plan === 'monthly' ? current.monthly : current.annual;
  if (!pkg) throw new Error('Plan not found. Please contact support.');
  await sdk.purchasePackage({ aPackage: pkg });
}

export async function restorePurchases(): Promise<boolean> {
  const sdk = await getPurchases();
  if (!sdk) return false;
  const { customerInfo } = await sdk.restorePurchases();
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export async function checkPremiumStatus(): Promise<boolean> {
  const sdk = await getPurchases();
  if (!sdk) return false;
  const { customerInfo } = await sdk.getCustomerInfo();
  return 'premium' in customerInfo.entitlements.active;
}
