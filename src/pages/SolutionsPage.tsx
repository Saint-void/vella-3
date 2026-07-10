import { motion } from 'motion/react';
import { HowItWorks } from '../components/HowItWorks';
import { DashboardShowcase } from '../components/DashboardShowcase';
import { CTA } from '../components/CTA';

export function SolutionsPage() {
  const useCases = [
    { title: 'Customer Support', desc: 'Resolve up to 80% of customer inquiries instantly without human intervention. Handle refunds, order tracking, and FAQs.', icon: '🎧' },
    { title: 'Sales & Lead Gen', desc: 'Qualify leads 24/7, book meetings directly into your calendar, and answer product questions to drive conversions.', icon: '📈' },
    { title: 'Internal HR & IT', desc: 'Answer employee questions about benefits, policies, and IT troubleshooting instantly via Slack or Teams.', icon: '🏢' },
  ];

  return (
    <main className="w-full flex flex-col items-center pt-32 pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Solutions for Every Team
          </h1>
          <p className="text-lg md:text-xl text-vella-accent/60 max-w-2xl mx-auto">
            Whether you are in customer support, sales, or internal IT, Vella adapts to your workflow.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {useCases.map((useCase, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-vella-darker border border-vella-border rounded-2xl p-8"
            >
              <div className="text-4xl mb-6">{useCase.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
              <p className="text-vella-accent/70 leading-relaxed">{useCase.desc}</p>
            </motion.div>
          ))}
        </div>

        <HowItWorks />
        <DashboardShowcase />
      </div>
      <CTA />
    </main>
  );
}
