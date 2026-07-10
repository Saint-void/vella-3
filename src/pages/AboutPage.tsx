import { motion } from 'motion/react';
import { Benefits } from '../components/Benefits';
import { CTA } from '../components/CTA';

export function AboutPage() {
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
            About Vella
          </h1>
          <p className="text-lg md:text-xl text-vella-accent/60 max-w-2xl mx-auto">
            We're on a mission to democratize enterprise-grade AI support for businesses of all sizes.
          </p>
        </motion.div>

        <div className="bg-vella-darker border border-vella-border rounded-3xl p-8 md:p-12 mb-24 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
          <p className="text-lg md:text-xl text-white/90 leading-relaxed text-center mb-8 relative z-10">
            Founded in 2026, Vella emerged from a simple observation: businesses spend too much time answering the same questions, and customers spend too much time waiting for answers.
          </p>
          <p className="text-base text-vella-accent/80 leading-relaxed text-center relative z-10">
            Our team of engineers and designers came together to build a platform that requires zero coding, integrates everywhere, and learns from your actual business knowledge. We believe that great customer service shouldn't be a bottleneck to growth.
          </p>
        </div>
        
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-vella-accent/60">What drives us every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: 'Simplicity First', desc: 'Powerful technology should be easy to use. We obsess over removing friction.' },
               { title: 'Customer Obsession', desc: 'We build for your customers. If they aren\'t happy with the AI, neither are we.' },
               { title: 'Continuous Learning', desc: 'Our AI gets smarter over time, and so do we. We adapt to the ever-changing landscape.' }
             ].map((value, i) => (
               <div key={i} className="text-center px-6">
                 <div className="w-12 h-12 rounded-full bg-vella-darker border border-vella-border flex items-center justify-center mx-auto mb-6 text-xl font-bold text-white">
                   {i + 1}
                 </div>
                 <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                 <p className="text-vella-accent/60 text-sm leading-relaxed">{value.desc}</p>
               </div>
             ))}
          </div>
        </div>

        <Benefits />
      </div>
      <CTA />
    </main>
  );
}
