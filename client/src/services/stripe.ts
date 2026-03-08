import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

export async function startPremiumCheckout(userEmail?: string): Promise<{ success: boolean; error?: string }> {
  if (!STRIPE_KEY) {
    return { success: false, error: 'Stripe is not configured yet. Set VITE_STRIPE_PUBLISHABLE_KEY to enable payments.' };
  }

  const priceId = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID as string;
  if (!priceId) {
    return { success: false, error: 'Stripe price ID not configured. Set VITE_STRIPE_PREMIUM_PRICE_ID.' };
  }

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        priceId,
        email: userEmail,
        successUrl: window.location.origin + '?premium=success',
        cancelUrl: window.location.origin + '?premium=cancelled',
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || 'Failed to create checkout session' };
    }

    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    if (!stripe) {
      return { success: false, error: 'Failed to load Stripe' };
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Checkout failed' };
  }
}

/*
  SERVER-SIDE ROUTES NEEDED (add to server/routes.ts when Stripe is configured):

  import Stripe from 'stripe';
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Create checkout session
  app.post('/api/create-checkout-session', async (req, res) => {
    const { priceId, email, successUrl, cancelUrl } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    res.json({ sessionId: session.id });
  });

  // Stripe webhook
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    if (event.type === 'checkout.session.completed') {
      // Mark user as premium in DB
    }
    res.json({ received: true });
  });
*/
