import { motion } from 'motion/react';
import { 
  Bot, Book, UserPlus, Globe, MessageCircle, Instagram, 
  MessageSquare, BarChart, Globe2, Users, History, Palette 
} from 'lucide-react';

export function Features() {
  const features = [
    { icon: Bot, title: 'AI Customer Support', desc: 'Instantly resolve common queries automatically.' },
    { icon: Book, title: 'Knowledge Base', desc: 'Train your AI on PDFs, URLs, and text.' },
    { icon: UserPlus, title: 'Lead Capture', desc: 'Collect emails and phone numbers 24/7.' },
    { icon: Globe, title: 'Website Chat Widget', desc: 'Embed a beautiful chat widget anywhere.' },
    { icon: MessageCircle, title: 'WhatsApp Integration', desc: 'Connect directly to your WhatsApp Business.' },
    { icon: Instagram, title: 'Instagram Integration', desc: 'Automate DM replies and story mentions.' },
    { icon: MessageSquare, title: 'Messenger Integration', desc: 'Support customers on Facebook seamlessly.' },
    { icon: BarChart, title: 'Analytics Dashboard', desc: 'Track conversations, resolution rates, and CSAT.' },
    { icon: Globe2, title: 'Multi-language Support', desc: 'Speak to customers in 50+ languages.' },
    { icon: Users, title: 'Team Inbox', desc: 'Human handoff when the AI needs help.' },
    { icon: History, title: 'Conversation History', desc: 'Full transcripts of every interaction.' },
    { icon: Palette, title: 'Custom Branding', desc: 'Match the widget to your exact brand colors.' },
  ];

  return (
    <section id="features" className="w-full py-16 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            Everything you need to automate customer conversations.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="group p-5 md:p-6 rounded-2xl bg-vella-darker border border-vella-border hover:bg-vella-dark transition-all duration-300 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-10 h-10 rounded-lg bg-vella-black border border-vella-border flex items-center justify-center mb-3 md:mb-4 group-hover:border-white/20 transition-colors">
                  <Icon size={20} className="text-vella-white" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1.5 md:mb-2">{feature.title}</h3>
                <p className="text-sm text-vella-accent/60 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
