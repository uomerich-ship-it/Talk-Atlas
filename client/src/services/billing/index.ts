export async function initBilling(): Promise<void> {}

export async function startCheckout(plan: 'monthly' | 'yearly'): Promise<void> {
  alert('Premium — £1.99/month coming soon');
}

export async function restorePurchases(): Promise<boolean> { return false; }

export async function checkPremiumStatus(): Promise<boolean> { return false; }
