import { motion } from 'motion/react';
import { ArrowRight, Globe, MessageCircle, FileText, BarChart3, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 md:pt-48 md:pb-32 flex flex-col items-center text-center">
      {/* Hero Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl space-y-6 md:space-y-8 relative z-20"
      >
        <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-vella-white leading-[1.1]">
          Train Once.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
            Answer Everywhere.
          </span>
        </h1>
        
        <p className="text-base md:text-xl text-vella-accent/80 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
          Deploy an AI employee that instantly answers customer questions across your website, WhatsApp, Instagram, Messenger, and more using your own business knowledge.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 md:pt-4">
          <Link to="/signup" className="w-full sm:w-auto px-8 py-3 md:py-3.5 text-sm font-medium text-vella-black bg-vella-white rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group">
            Start Free
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/signup" className="w-full sm:w-auto px-8 py-3 md:py-3.5 text-sm font-medium text-vella-white bg-vella-darker border border-vella-border rounded-full hover:bg-vella-border transition-colors flex items-center justify-center">
            Book Demo
          </Link>
        </div>

        <p className="text-xs md:text-sm text-vella-accent/50 pt-2">
          No credit card required. Free 14-day trial.
        </p>
      </motion.div>

      {/* Hero Visuals */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full mt-16 md:mt-24 aspect-square md:aspect-[21/9] max-w-6xl mx-auto z-10"
      >
        {/* Main Dashboard Mockup */}
        <div className="absolute inset-0 rounded-2xl glass-panel overflow-hidden border-t-white/10 flex">
          {/* Sidebar */}
          <div className="hidden md:flex w-64 border-r border-vella-border bg-vella-darker/50 flex-col p-4">
            <div className="h-8 w-24 bg-white/5 rounded mb-8" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-full bg-white/5 rounded" />
              ))}
            </div>
          </div>
          {/* Main Area */}
          <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 bg-vella-black/40">
             <div className="h-8 md:h-10 w-32 md:w-48 bg-white/5 rounded" />
             <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
               <div className="md:col-span-2 bg-white/5 rounded-xl border border-white/5" />
               <div className="hidden md:block col-span-1 bg-white/5 rounded-xl border border-white/5" />
             </div>
          </div>
        </div>

        {/* Floating Cards (Left) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute -left-2 md:-left-12 top-4 md:top-12 p-2 md:p-3 glass-panel rounded-xl flex items-center gap-2 md:gap-3 w-40 md:w-48 shadow-2xl scale-75 md:scale-100 origin-top-left"
        >
          <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Globe size={14} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-medium text-white">Website Connected</p>
            <p className="text-[8px] md:text-[10px] text-white/50">Active now</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
          className="absolute -left-2 md:-left-8 top-28 md:top-40 p-2 md:p-3 glass-panel rounded-xl flex items-center gap-2 md:gap-3 w-44 md:w-52 shadow-2xl scale-75 md:scale-100 origin-center-left"
        >
          <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <MessageCircle size={14} className="text-green-400" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-medium text-white">WhatsApp Connected</p>
            <p className="text-[8px] md:text-[10px] text-white/50">Syncing...</p>
          </div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 2 }}
          className="absolute left-4 md:left-24 bottom-4 md:bottom-12 p-2 md:p-3 glass-panel rounded-xl flex items-center gap-2 md:gap-3 w-36 md:w-44 shadow-2xl scale-75 md:scale-100 origin-bottom-left"
        >
          <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <FileText size={14} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-medium text-white">PDF Uploaded</p>
            <p className="text-[8px] md:text-[10px] text-white/50">Knowledge Base</p>
          </div>
        </motion.div>

        {/* Chatbot Preview (Right) */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.8, duration: 0.6 }}
           className="absolute -right-2 md:-right-12 top-4 md:top-8 w-56 md:w-80 glass-panel rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-white/10 scale-[0.85] md:scale-100 origin-top-right"
        >
           <div className="bg-vella-darker p-4 border-b border-vella-border flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
               <Bot size={16} className="text-vella-black" />
             </div>
             <div>
               <p className="text-sm font-medium text-white">Vella AI</p>
               <p className="text-xs text-green-400">Online</p>
             </div>
           </div>
           <div className="p-4 space-y-4 bg-vella-black/80">
              <div className="flex justify-end">
                <div className="bg-vella-dark px-4 py-2 rounded-2xl rounded-tr-none text-sm text-white/90 shadow-sm border border-vella-border">
                  Do you open on Sundays?
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex justify-start gap-2"
              >
                 <div className="w-6 h-6 rounded-full bg-white flex-shrink-0 flex items-center justify-center mt-1">
                   <Bot size={12} className="text-vella-black" />
                 </div>
                 <div className="bg-vella-white text-vella-black px-4 py-2 rounded-2xl rounded-tl-none text-sm font-medium shadow-sm">
                   Yes. We're open every Sunday from 9AM to 6PM.
                 </div>
              </motion.div>
           </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
