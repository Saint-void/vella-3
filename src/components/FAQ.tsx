import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
  const faqs = [
    {
      q: "How does Vella work?",
      a: "Vella ingests your business data (PDFs, website URLs, text) to create a custom AI model. You then embed our widget on your site or connect it to your social channels, where it answers customer questions instantly."
    },
    {
      q: "Can I train it on my own documents?",
      a: "Yes, you can upload PDFs, Word documents, CSVs, or simply provide your website URL. Vella will securely process the information to build your custom knowledge base."
    },
    {
      q: "Does it support WhatsApp?",
      a: "Absolutely. Our Professional and Business plans include direct WhatsApp Business API integration, allowing your AI to handle customer support natively within WhatsApp."
    },
    {
      q: "Can I customize the appearance?",
      a: "Yes, you can fully customize the widget's colors, logo, greeting message, and chat bubble styles to perfectly match your brand identity."
    },
    {
      q: "How secure is my data?",
      a: "Enterprise-grade security is built-in. We encrypt all data at rest and in transit. Your custom knowledge base is sandboxed and never used to train public AI models."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-16 md:py-32 relative border-t border-vella-border/30">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-white tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border border-vella-border rounded-2xl bg-vella-darker overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span className="text-sm md:text-base font-medium text-white">{faq.q}</span>
                <motion.div
                   animate={{ rotate: openIndex === idx ? 180 : 0 }}
                   transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={20} className="text-vella-accent/50 md:w-5 md:h-5 w-4 h-4" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 md:px-6 md:pb-6 text-sm text-vella-accent/70 leading-relaxed border-t border-white/5 pt-3 md:pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
