import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      quote: "Vella completely transformed how we handle customer inquiries. We reduced our response time from hours to seconds.",
      author: "Sarah Jenkins",
      role: "Head of Support",
      company: "Acme Corp"
    },
    {
      quote: "The WhatsApp integration is flawless. Our customers love getting instant answers, and we've seen a 30% bump in conversions.",
      author: "David Chen",
      role: "Founder",
      company: "Lumina Studios"
    },
    {
      quote: "Setting it up was incredibly easy. We just uploaded our PDF manuals, and the AI knew exactly how to answer technical questions.",
      author: "Elena Rodriguez",
      role: "Operations Manager",
      company: "TechFlow"
    }
  ];

  return (
    <section className="w-full py-16 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            Loved by fast-growing teams.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-6 md:p-8 rounded-2xl bg-vella-darker border border-vella-border flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-4 md:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-white text-white md:w-4 md:h-4" />
                  ))}
                </div>
                <p className="text-base md:text-lg text-white/90 leading-relaxed mb-6 md:mb-8 font-medium">
                  "{test.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-vella-black border border-vella-border flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{test.author}</p>
                  <p className="text-xs text-vella-accent/60">{test.role}, {test.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
