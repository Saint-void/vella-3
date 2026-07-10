import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CTA() {
  return (
    <section className="w-full py-20 md:py-48 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-2xl aspect-square bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6 md:mb-8">
            Hire your first AI<br />employee today.
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 md:py-4 text-sm md:text-base font-medium text-vella-black bg-white rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group">
              Start Free
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform w-4 h-4 md:w-[18px] md:h-[18px]" />
            </Link>
            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 md:py-4 text-sm md:text-base font-medium text-white bg-vella-darker border border-vella-border rounded-full hover:bg-vella-border transition-colors flex items-center justify-center">
              Book Demo
            </Link>
          </div>
          <p className="text-xs md:text-sm text-vella-accent/50 mt-4 md:mt-6">
            Join 10,000+ companies automating their support.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
