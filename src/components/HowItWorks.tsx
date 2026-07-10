import { motion } from 'motion/react';

export function HowItWorks() {
  const steps = [
    { num: '01', title: 'Create an account', desc: 'Sign up in seconds. No credit card required.' },
    { num: '02', title: 'Upload PDFs or FAQs', desc: 'Add your business data to train the AI securely.' },
    { num: '03', title: 'Connect your website', desc: 'Paste a single line of code or use our integrations.' },
    { num: '04', title: 'Start answering instantly', desc: 'Your AI employee handles customer questions 24/7.' },
  ];

  return (
    <section id="solutions" className="w-full py-16 md:py-32 relative border-t border-vella-border/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            From setup to live in minutes.
          </motion.h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-10 md:top-12 left-[10%] right-[10%] h-[1px] bg-vella-border">
             <motion.div 
               className="h-full bg-white/30"
               initial={{ width: "0%" }}
               whileInView={{ width: "100%" }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Circle */}
                <div className="w-20 md:w-24 h-20 md:h-24 rounded-full bg-vella-darker border border-vella-border flex items-center justify-center mb-4 md:mb-6 relative z-10 group-hover:border-white/30 transition-colors shadow-xl">
                  <span className="text-xl md:text-2xl font-mono font-medium text-white">{step.num}</span>
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-vella-accent/60 max-w-[200px] leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
