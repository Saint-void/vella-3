import { motion } from 'motion/react';
import { Pricing } from '../components/Pricing';
import { FAQ } from '../components/FAQ';
import { CTA } from '../components/CTA';
import { Check } from 'lucide-react';

export function PricingPage() {
  return (
    <main className="w-full flex flex-col items-center pt-32 pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Pricing that scales with you
          </h1>
          <p className="text-lg md:text-xl text-vella-accent/60 max-w-2xl mx-auto">
            Start for free and upgrade as your automated conversations grow.
          </p>
        </motion.div>
        
        <Pricing />

        <div className="py-24 border-t border-white/10 mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Compare all features</h2>
            <p className="text-vella-accent/60">See exactly what you get on each plan.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-white/10 text-white font-medium w-1/3">Feature</th>
                  <th className="p-4 border-b border-white/10 text-white font-medium text-center">Free</th>
                  <th className="p-4 border-b border-white/10 text-white font-medium text-center">Pro</th>
                  <th className="p-4 border-b border-white/10 text-white font-medium text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm text-vella-accent/80">
                {[
                  { name: 'Monthly Messages', free: '500', pro: '5,000', ent: 'Unlimited' },
                  { name: 'Knowledge Base Size', free: '10 Docs', pro: '100 Docs', ent: 'Unlimited' },
                  { name: 'Channels', free: 'Web', pro: 'Web, WhatsApp, IG', ent: 'All Channels' },
                  { name: 'Analytics', free: 'Basic', pro: 'Advanced', ent: 'Custom Reports' },
                  { name: 'Remove Branding', free: '-', pro: <Check size={16} className="mx-auto text-green-400" />, ent: <Check size={16} className="mx-auto text-green-400" /> },
                  { name: 'Dedicated Account Manager', free: '-', pro: '-', ent: <Check size={16} className="mx-auto text-green-400" /> },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 border-b border-white/5 font-medium">{row.name}</td>
                    <td className="p-4 border-b border-white/5 text-center">{row.free}</td>
                    <td className="p-4 border-b border-white/5 text-center">{row.pro}</td>
                    <td className="p-4 border-b border-white/5 text-center">{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <FAQ />
      </div>
      <CTA />
    </main>
  );
}
