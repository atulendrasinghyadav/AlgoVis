import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Shield, Star, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { processPremiumUpgrade } from '../firebase/paymentService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import './Premium.css';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function Premium({ user, isPremium, onNavigate }) {
  const [processing, setProcessing] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().isPremium) {
        alert('Confirmed! You are a Premium member. Welcome back.');
        onNavigate('home');
      } else {
        alert('Premium status not found. If you just paid, please wait a moment or contact support if the issue persists.');
      }
    } catch (err) {
      console.error(err);
      alert('Error checking status.');
    } finally {
      setChecking(false);
    }
  };


  const plans = [
    {
      name: 'Standard',
      price: 'Free',
      description: 'Perfect for getting started with core algorithm visualizations.',
      features: [
        'Access to all Sorting algorithms',
        'Access to all Searching algorithms',
        'Basic Tree & Graph visualizers',
        'Frame-by-frame execution control',
        'Adjustable animation speeds',
      ],
      cta: 'Current Plan',
      premium: false,
    },
    {
      name: 'Premium',
      price: '₹1',
      period: '/Lifetime',
      description: 'Unlock full power with custom algorithms and advanced features.',
      features: [
        'Everything in Standard',
        'Custom Algorithm Visualizer',
        'Advanced Pathfinding (Dijkstra, A*)',
        'Complex Data Structure support',
        'Progress tracking & Analytics',
        'Priority support & updates',
      ],
      cta: 'Upgrade to Premium',
      premium: true,
      popular: true,
    }
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) {
      onNavigate('auth', 'Please login to upgrade your account.', 'premium');
      return;
    }

    setProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      if (!RAZORPAY_KEY_ID) {
        alert('Razorpay Key is missing. Please check your environment variables.');
        setProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: 100, // Amount in paise (₹1.00)
        currency: 'INR',
        name: 'AlgoVis Premium',
        description: 'Lifetime Access to Advanced Features',
        image: '/AlgoVis.png',
        handler: async function (response) {
          try {
            setProcessing(true);
            // Process the payment in Firebase
            await processPremiumUpgrade(user.uid, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: 1
            });

            alert('Payment Successful! Welcome to AlgoVis Premium.');
            onNavigate('home');
          } catch (error) {
            console.error('Payment processing failed:', error);
            alert(`Database Error: ${error.message}`);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.displayName || 'User',
          email: user.email || '',
        },
        theme: {
          color: '#eab308',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on('payment.failed', function (response) {
        console.error('Payment failed details:', response.error);
        alert(`Payment Failed: ${response.error.description}`);
        setProcessing(false);
      });

      console.log('Opening Razorpay modal with amount (paise):', options.amount);
      rzp1.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
      alert(`System Error: ${error.message}`);
      setProcessing(false);
    }
  };

  return (
    <div className="premium-container">
      {processing && (
        <div className="payment-overlay">
          <Loader2 className="animate-spin" size={48} color="#eab308" />
          <p>Processing Secure Payment...</p>
        </div>
      )}
      <div className="premium-background">

        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      <header className="premium-header">
        <span className="premium-badge">ALGOVIS PRO</span>
        <h1>Elevate Your Engineering <br /><span>Understanding</span></h1>
        <p>Unlock advanced visualization tools and custom algorithm playgrounds designed for high-performance learning.</p>

        {user && !isPremium && (
          <button className="check-status-btn" onClick={handleCheckStatus} disabled={checking}>
            {checking ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Already paid? Check Status
          </button>
        )}
      </header>

      <div className="plans-grid">
        {plans.map((plan, idx) => (
          <div key={idx} className={`plan-card ${plan.premium ? 'premium-card' : ''} ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}

            <div className="plan-icon">
              {plan.premium ? <Crown size={32} color="#fbbf24" /> : <Star size={32} color="#94a3b8" />}
            </div>

            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="amount">{plan.price}</span>
                {plan.period && <span className="period">{plan.period}</span>}
              </div>
              <p className="plan-desc">{plan.description}</p>
            </div>

            <div className="plan-divider"></div>

            <ul className="plan-features">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx}>
                  <Check size={18} className="check-icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`plan-cta ${plan.premium ? 'btn-premium' : 'btn-standard'}`}
              onClick={plan.premium ? handleUpgrade : () => onNavigate('home')}
              disabled={!plan.premium && isPremium}
            >
              {plan.premium ? (
                <>
                  {plan.cta} <ChevronRight size={18} />
                </>
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>

      <section className="premium-trust">
        <div className="trust-item">
          <Zap size={20} />
          <span>Instant Activation</span>
        </div>
        <div className="trust-item">
          <Shield size={20} />
          <span>Secure Checkout</span>
        </div>
        <div className="trust-item">
          <Star size={20} />
          <span>Lifetime Access</span>
        </div>
      </section>
    </div>
  );
}