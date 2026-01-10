export const startCheckout = async (plan: "monthly" | "yearly"): Promise<void> => {
  console.log(`Starting mock checkout for ${plan} plan...`);
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return Promise.resolve();
};

export const restorePurchases = async (): Promise<void> => {
  console.log("Restoring mock purchases...");
  await new Promise(resolve => setTimeout(resolve, 800));
  return Promise.resolve();
};
