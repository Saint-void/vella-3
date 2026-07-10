import { motion } from 'motion/react';
import { Clock, TrendingUp, PiggyBank } from 'lucide-react';

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      desc: 'Answer customers 24/7 without lifting a finger. Free up your team to focus on complex issues.',
    },
    {
      icon: TrendingUp,
      title: 'Increase Sales',
      desc: 'Capture more leads automatically and guide visitors to checkout when intent is highest.',
    },
    {
      icon: PiggyBank,
      title: 'Reduce Costs',
      desc: 'Automate repetitive support tasks and scale your customer service without hiring more staff.',
    }
  ];

  return (
    <section className="w-full py-16 md:py-32 relative border-t border-vella-border/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="flex flex-col items-center md:items-start text-center md:text-left group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-vella-darker border border-vella-border flex items-center justify-center mb-4 md:mb-6 group-hover:bg-white group-hover:border-white transition-colors duration-300">
                  <Icon size={20} className="text-white group-hover:text-vella-black transition-colors duration-300 md:w-6 md:h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 tracking-tight">{benefit.title}</h3>
                <p className="text-base md:text-lg text-vella-accent/60 leading-relaxed max-w-sm">
                  {benefit.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
