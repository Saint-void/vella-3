import { motion } from 'motion/react';

export function Integrations() {
  const integrations = [
    'Website', 'WordPress', 'Shopify', 'Wix', 'Webflow', 'Framer', 
    'WhatsApp', 'Instagram', 'Messenger', 'Telegram', 'Slack', 'Zapier', 'API'
  ];

  return (
    <section id="integrations" className="w-full py-16 md:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-5xl font-bold text-white tracking-tight mb-3 md:mb-4 leading-tight">
            Connects with your stack.
          </h2>
          <p className="text-base md:text-lg text-vella-accent/60 max-w-2xl mx-auto">
            Deploy your AI across all your favorite tools and platforms with zero coding required.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
          {integrations.map((name, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base rounded-full bg-vella-darker border border-vella-border/50 text-white font-medium hover:bg-vella-dark hover:border-white/20 hover:-translate-y-0.5 transition-all cursor-default shadow-sm"
            >
              {name}
            </motion.div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8 md:mt-12 text-xs md:text-sm text-vella-accent/40 font-mono"
        >
          + More integrations coming soon.
        </motion.p>
      </div>
    </section>
  );
}
