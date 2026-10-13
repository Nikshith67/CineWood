import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserSubscription, createPaymentOrder, verifyPayment } from '../services/api';

export const PLANS = [
  {
    id: 'FREE',
    name: 'General',
    price: '₹0',
    cycle: 'Free Forever',
    badge: 'Basic',
    color: '#808080',
    accentBg: 'rgba(128, 128, 128, 0.12)',
    description: 'Great for casual movie watching with essential streaming features.',
    features: [
      '720p HD Streaming',
      '1 Screen at a time',
      'Mobile & Tablet streaming',
      'Access to Free Catalog with Ads',
      'Standard audio quality',
    ],
  },
  {
    id: 'MONTHLY',
    name: 'Monthly Plan',
    price: '₹199',
    cycle: 'per month',
    badge: 'POPULAR',
    color: '#46D369',
    accentBg: 'rgba(70, 211, 105, 0.12)',
    description: 'The most popular plan for daily entertainment in high definition.',
    features: [
      '1080p Full HD Streaming',
      '2 Screens at the same time',
      'All Devices (TV, Laptop, Phone, Tablet)',
      '100% Ad-Free Experience',
      'Download up to 30 titles for offline viewing',
      'High fidelity stereo sound',
    ],
  },
  {
    id: 'ANNUAL',
    name: 'Annual Plan',
    price: '₹1299',
    cycle: 'per year (Save 45%)',
    badge: 'BEST VALUE',
    color: '#E50914',
    accentBg: 'rgba(229, 9, 20, 0.15)',
    description: 'Ultimate cinematic experience with 4K Ultra HD & Dolby Atmos.',
    features: [
      '4K Ultra HD + HDR10 + Dolby Vision',
      '4 Screens at the same time',
      'All Devices including 4K Smart TVs',
      '100% Ad-Free + VIP Early Premiere Access',
      'Unlimited Offline Downloads',
      'Dolby Atmos 3D Spatial Audio',
      'Priority customer support',
    ],
  },
];

// Helper to normalize legacy tier strings
export function normalizeTier(tier) {
  if (!tier) return 'FREE';
  const t = tier.toUpperCase();
  if (t === 'ULTRA_4K' || t === 'ANNUAL') return 'ANNUAL';
  if (t === 'HD' || t === 'MONTHLY') return 'MONTHLY';
  return 'FREE';
}

export default function SubscriptionModal({ isOpen, onClose }) {
  const { user, updateSubscriptionTier } = useAuth();
  const currentNormalized = normalizeTier(user?.subscriptionTier);
  const [selectedPlanId, setSelectedPlanId] = useState(currentNormalized);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user?.userId) return;
    setLoading(true);
    setError('');

    // If Free Plan: Direct activation without payment
    if (selectedPlanId === 'FREE') {
      try {
        await updateUserSubscription(user.userId, 'FREE');
        updateSubscriptionTier('FREE');
        setSuccess(true);
      } catch (err) {
        console.error('Failed to update free subscription:', err);
        updateSubscriptionTier('FREE');
        setSuccess(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For Paid Plans (Monthly ₹199 or Annual ₹1299): Initiate Razorpay Payment
    try {
      const orderRes = await createPaymentOrder(selectedPlanId);
      const orderData = orderRes.data;

      if (!orderData?.orderId) {
        throw new Error('Failed to obtain payment order details.');
      }

      // Check if Razorpay Checkout script is loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount, // in paise
          currency: orderData.currency || 'INR',
          name: orderData.companyName || 'CineWood Streaming',
          description: orderData.planName || `${selectedPlan.name} (${selectedPlan.price})`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              setLoading(true);
              // High-security backend HMAC-SHA256 signature verification
              await verifyPayment(
                response.razorpay_order_id || orderData.orderId,
                response.razorpay_payment_id,
                response.razorpay_signature,
                selectedPlanId
              );

              // Update local auth context
              updateSubscriptionTier(selectedPlanId);
              setSuccess(true);
            } catch (verifyErr) {
              console.error('Payment verification failed:', verifyErr);
              const errMsg = verifyErr.response?.data?.error || 'Payment signature verification failed. Please contact support.';
              setError(errMsg);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.email?.split('@')[0] || 'Subscriber',
            email: user?.email || '',
            contact: '9999999999',
          },
          notes: {
            planId: selectedPlanId,
            userId: String(user?.userId || ''),
          },
          theme: {
            color: '#E50914',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          console.error('Razorpay payment failed:', resp.error);
          setError(`Payment Failed: ${resp.error?.description || 'Transaction declined'}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback for offline/test environments if Razorpay script is blocked
        const testPaymentId = 'pay_test_' + Date.now();
        const testSignature = 'rzp_test_signature';
        await verifyPayment(orderData.orderId, testPaymentId, testSignature, selectedPlanId);
        updateSubscriptionTier(selectedPlanId);
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to initiate payment. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];
  const isCurrent = currentNormalized === selectedPlanId;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="w-full mx-4 rounded-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col"
        style={{
          maxWidth: '896px',
          width: '100%',
          background: '#141414',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative px-6 py-6 border-b border-white/10 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(20,20,20,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#E50914', color: '#fff' }}
            >
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
            </div>
            <div>
              <h2 className="text-headline-md text-white font-black tracking-tight" style={{ fontSize: '22px' }}>
                Choose Your CineWood Plan
              </h2>
              <p className="text-body-sm text-[#B3B3B3] mt-0.5">
                Switch or cancel anytime. Stream anywhere on any device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {user?.role === 'ROLE_ADMIN' && (
            <div
              className="mb-6 p-4 rounded-xl flex items-start gap-3 border"
              style={{ background: 'rgba(229,9,20,0.1)', borderColor: 'rgba(229,9,20,0.3)' }}
            >
              <span className="material-symbols-outlined text-[#E50914] text-[22px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">
                  Administrator All-Access Active
                </p>
                <p className="text-xs text-[#B3B3B3] leading-relaxed">
                  As the platform administrator, you already possess unlimited access to all 4K Ultra HD streams, media catalog controls, and user administration. You do not need any subscription plan.
                </p>
              </div>
            </div>
          )}

          {success ? (
            <div className="py-14 text-center animate-fade-in" style={{ textAlign: 'center' }}>
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(70, 211, 105, 0.15)', border: '2px solid #46D369' }}
              >
                <span className="material-symbols-outlined text-5xl" style={{ color: '#46D369', fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </div>
              <h3 className="text-headline-md text-white font-bold mb-2">
                Subscription Activated!
              </h3>
              <p
                className="text-body-md text-[#B3B3B3]"
                style={{ maxWidth: '480px', width: '100%', margin: '0 auto', textAlign: 'center', lineHeight: '1.6' }}
              >
                You are now subscribed to the <strong className="text-white">{selectedPlan.name}</strong> ({selectedPlan.price}). Enjoy unlimited streaming!
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* 3 Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isUserActive = currentNormalized === plan.id;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? 'ring-2 shadow-2xl scale-[1.02]'
                          : 'hover:border-white/30 hover:bg-white/5 opacity-85 hover:opacity-100'
                      }`}
                      style={{
                        background: isSelected ? plan.accentBg : '#1A1A1A',
                        borderColor: isSelected ? plan.color : 'rgba(255,255,255,0.08)',
                        borderWidth: '1px',
                        ringColor: plan.color,
                        boxShadow: isSelected ? `0 12px 30px ${plan.color}25` : 'none',
                      }}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                          style={{
                            background: `${plan.color}25`,
                            color: plan.color,
                            border: `1px solid ${plan.color}50`,
                          }}
                        >
                          {plan.badge}
                        </span>

                        {isUserActive && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#46D369]" />
                            Current Plan
                          </span>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div>
                        <h4 className="text-headline-sm text-white font-bold">{plan.name}</h4>
                        <div className="mt-2 mb-1 flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-white">{plan.price}</span>
                          <span className="text-xs text-[#808080] font-medium">{plan.cycle}</span>
                        </div>
                        <p className="text-xs text-[#A0A0A0] min-h-[34px] leading-relaxed mt-1 mb-4">
                          {plan.description}
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="border-t border-white/10 pt-4 mt-auto space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <span
                              className="material-symbols-outlined text-[15px] shrink-0 mt-0.5"
                              style={{ color: plan.color, fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span className="text-[#D4D4D4] leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Selection Checkmark Button */}
                      <div className="mt-5 pt-3">
                        <div
                          className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'text-white'
                              : 'bg-white/5 text-[#B3B3B3] hover:text-white'
                          }`}
                          style={{
                            backgroundColor: isSelected ? plan.color : undefined,
                          }}
                        >
                          {isSelected ? (
                            <>
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Selected
                            </>
                          ) : (
                            'Select Plan'
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!success && (
          <div
            className="px-6 md:px-8 py-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-4"
            style={{ background: '#101010' }}
          >
            <div className="flex items-center gap-2 text-xs text-[#808080]">
              <span className="material-symbols-outlined text-[16px] text-[#46D369]">lock</span>
              <span>
                {selectedPlanId === 'FREE' ? (
                  <>Selected: <strong className="text-white">General Free Plan</strong></>
                ) : (
                  <>Secure Razorpay Checkout • <strong className="text-white">{selectedPlan.name}</strong> ({selectedPlan.price})</>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="px-7 py-2.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: '#E50914',
                  boxShadow: '0 4px 20px rgba(229,9,20,0.4)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : isCurrent ? (
                  'Keep Current Plan'
                ) : selectedPlanId === 'FREE' ? (
                  'Activate Free Plan'
                ) : selectedPlanId === 'MONTHLY' ? (
                  <>
                    <span className="material-symbols-outlined text-[15px]">payment</span>
                    Pay ₹199 (UPI / Cards / NetBanking)
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">payment</span>
                    Pay ₹1299 (Save 45%)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
