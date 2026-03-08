import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { CreditCard, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { startCheckout } from '../../services/billing';

export function SettingsPanel({ children }: { children: React.ReactNode }) {
  const { isPremium, selectedPlan, setPremium } = useAppStore();
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<"monthly" | "yearly">("monthly");
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await startCheckout(selectedPlanType);
      setPremium(true, selectedPlanType);
    } catch (error) {
      console.error(error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setShowPlans(false)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="glass-panel border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold neon-text">Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage your account and subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/60">Membership</h3>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium text-lg">
                    {isPremium ? "Premium (No ads)" : "Free (with ads)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPremium 
                      ? `Plan: ${selectedPlan === 'yearly' ? 'Yearly (£19.99/year)' : 'Monthly (£1.99/mo)'}` 
                      : "Upgrade to enjoy an ad-free experience."}
                  </p>
                </div>
                {isPremium && (
                  <Badge variant="outline" className="border-primary/50 text-primary animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.3)]">
                    Active
                  </Badge>
                )}
              </div>

              {!isPremium ? (
                !showPlans ? (
                  <Button 
                    className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
                    onClick={() => setShowPlans(true)}
                  >
                    Become Full Member
                  </Button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setSelectedPlanType("monthly")}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          selectedPlanType === 'monthly' ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold">Monthly</p>
                          <p className="text-xs text-muted-foreground">£1.99 per month</p>
                        </div>
                        {selectedPlanType === 'monthly' && <Check className="w-4 h-4 text-primary" />}
                      </button>

                      <button
                        onClick={() => setSelectedPlanType("yearly")}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all relative ${
                          selectedPlanType === 'yearly' ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold">Yearly</p>
                          <p className="text-xs text-muted-foreground">£19.99 per year</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/20 border-primary/40 text-[10px] uppercase">Best Value</Badge>
                          {selectedPlanType === 'yearly' && <Check className="w-4 h-4 text-primary" />}
                        </div>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        disabled={isActivating}
                        onClick={handleActivate}
                        className="w-full bg-primary text-black font-bold h-10"
                      >
                        {isActivating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Activating...
                          </>
                        ) : "Continue"}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">No ads on Premium</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-10">
                    Manage Premium
                  </Button>
                  {!showPlans ? (
                    <button 
                      onClick={() => setShowPlans(true)}
                      className="w-full text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-bold"
                    >
                      View plans
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div className={`flex items-center justify-between p-3 rounded-lg border bg-black/20 border-white/10`}>
                          <div className="text-left">
                            <p className="text-sm font-bold">Monthly</p>
                            <p className="text-xs text-muted-foreground">£1.99 per month</p>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg border bg-black/20 border-white/10 relative`}>
                          <div className="text-left">
                            <p className="text-sm font-bold">Yearly</p>
                            <p className="text-xs text-muted-foreground">£19.99 per year</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/20 border-primary/40 text-[10px] uppercase">Best Value</Badge>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowPlans(false)}
                        className="w-full text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-bold"
                      >
                        Hide plans
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-primary/40" />
            <div>
              <p className="text-sm font-bold">Secure Transactions</p>
              <p className="text-xs text-muted-foreground">Encryption-protected membership management.</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
