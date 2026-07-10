import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      desc: 'Perfect for small businesses getting started with AI.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: ['Up to 1,000 conversations/mo', 'Website Chat Widget', 'Standard Support', '1 Team Member'],
      highlight: false
    },
    {
      name: 'Professional',
      desc: 'Ideal for growing companies with high volume.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: ['Up to 5,000 conversations/mo', 'WhatsApp & Instagram', 'Priority Support', '5 Team Members', 'Remove Vella Branding'],
      highlight: true
    },
    {
      name: 'Business',
      desc: 'For large teams needing advanced features and APIs.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: ['Unlimited conversations', 'All Integrations + API', 'Dedicated Success Manager', 'Unlimited Team Members', 'Custom AI Training Model'],
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="w-full py-16 md:py-32 relative border-t border-vella-border/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-bold text-white tracking-tight mb-6 md:mb-8 leading-tight"
          >
            Simple, transparent pricing.
          </motion.h2>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-vella-accent/50'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-vella-darker border border-vella-border relative p-1 cursor-pointer transition-colors"
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-vella-accent/50'} flex items-center gap-2`}>
              Annually <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`p-6 md:p-8 rounded-3xl border flex flex-col relative ${
                plan.highlight 
                  ? 'bg-vella-dark border-white/20 shadow-2xl shadow-white/5 py-8 md:py-12 scale-100 md:scale-105 z-10' 
                  : 'bg-vella-darker border-vella-border'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-vella-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-vella-accent/60 mb-6 min-h-[40px] md:h-10">{plan.desc}</p>
              
              <div className="mb-6 md:mb-8">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  ₦{isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                <span className="text-vella-accent/50 ml-1">/mo</span>
              </div>
              
              <Link to="/signup" className={`w-full py-3 px-4 rounded-full text-sm font-medium transition-colors mb-6 md:mb-8 text-center block ${
                plan.highlight 
                  ? 'bg-white text-vella-black hover:bg-gray-200' 
                  : 'bg-vella-black border border-vella-border text-white hover:bg-white/5'
              }`}>
                Get Started
              </Link>

              <div className="space-y-3 md:space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 md:gap-3">
                    <Check size={16} className="text-white shrink-0 mt-0.5 md:w-4 md:h-4" />
                    <span className="text-sm text-vella-accent/80">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
