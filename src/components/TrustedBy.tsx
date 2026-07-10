import { motion } from 'motion/react';
import { Shield, Zap, Sparkles, Box, Compass, Layers } from 'lucide-react';

export function TrustedBy() {
  const logos = [Shield, Zap, Sparkles, Box, Compass, Layers];

  // Duplicate the logos array to ensure seamless infinite scrolling
  const scrollLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="w-full py-12 md:py-20 border-t border-vella-border/50 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        <p className="text-sm font-medium text-vella-accent/50 mb-10 uppercase tracking-widest text-center px-6">
          Trusted by growing businesses
        </p>
        
        <div className="w-full relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            className="flex items-center gap-12 md:gap-24 opacity-40 grayscale whitespace-nowrap min-w-max pr-12 md:pr-24"
          >
            {scrollLogos.map((Icon, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <Icon size={24} />
                <span className="text-lg font-bold tracking-tighter">Brand{(idx % logos.length) + 1}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
