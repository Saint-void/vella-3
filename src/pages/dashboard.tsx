import { motion } from 'motion/react';
import { Bot, Plus, Settings, LayoutDashboard, MessageSquare, BarChart2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: MessageSquare, label: 'Chatbots', active: false },
  { icon: BarChart2, label: 'Analytics', active: false },
  { icon: Users, label: 'Leads', active: false },
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-vella-black text-vella-white flex flex-col w-full relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />
      
      {/* Dashboard Navbar (Same design as landing page) */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 w-[calc(100%-2rem)] max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3.5 backdrop-blur-md bg-vella-darker/60 border border-white/10 rounded-full shadow-2xl"
      >
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-vella-white">
            <img src="/logo.png" alt="Vella Logo" className="h-13 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-white/60 hover:text-white transition-colors p-2">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium border border-white/10">
            US
          </div>
        </div>
      </motion.nav>

      <div className="flex-1 flex max-w-[1400px] w-full mx-auto relative z-10 pt-[100px] px-4 md:px-6 pb-6 gap-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-64 shrink-0 hidden lg:flex flex-col bg-[#1c1c1c]/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            {sidebarLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    link.active 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl flex flex-col p-8 shadow-2xl"
          >
            {/* Top Right Action */}
            <div className="absolute top-6 right-6">
              <button className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-vella-black bg-vella-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <span className="relative flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Chatbot
                </span>
              </button>
            </div>
            
            {/* Center Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                <Bot className="w-8 h-8 text-white/30" />
              </div>
              <h2 className="text-2xl font-medium text-white/80 tracking-tight">No chatbot here</h2>
              <p className="text-base text-white/40 mt-3">Create your first AI employee to get started.</p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
