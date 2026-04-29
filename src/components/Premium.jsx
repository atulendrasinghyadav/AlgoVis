import React from 'react';
import { Check, Crown, Zap, Shield, Star, ChevronRight } from 'lucide-react';
import './Premium.css';

export default function Premium({ user, onNavigate }) {
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
      price: '₹49',
      period: ' one-time',
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

  const handleUpgrade = () => {
    if (!user) {
      onNavigate('auth', 'Please login to upgrade your account.', 'premium');
    } else {
      // In a real app, this would trigger Stripe or another payment gateway
      alert('Redirecting to secure payment gateway...');
    }
  };

  return (
    <div className="premium-container">
      <div className="premium-background">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      <header className="premium-header">
        <span className="premium-badge">ALGOVIS PRO</span>
        <h1>Elevate Your Engineering <br /><span>Understanding</span></h1>
        <p>Unlock advanced visualization tools and custom algorithm playgrounds designed for high-performance learning.</p>
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
              disabled={!plan.premium && user?.isPremium}
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
