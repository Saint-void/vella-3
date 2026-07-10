import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const links = ['Features', 'Solutions', 'Pricing', 'Integrations', 'Resources', 'About'];

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 w-[calc(100%-2rem)] max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3.5 backdrop-blur-md bg-vella-darker/60 border border-white/10 rounded-full shadow-2xl"
      >
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-vella-white">
            <img src="/logo.png" alt="Vella Logo" className="h-12 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link} 
                to={`/${link.toLowerCase()}`}
                className="text-sm font-medium text-vella-accent/70 hover:text-vella-white transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-vella-accent hover:text-vella-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium text-vella-black bg-vella-white rounded-full hover:bg-gray-200 transition-colors">
            Start Free
          </Link>
        </div>

        <button 
          className="md:hidden text-vella-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[80px] left-4 right-4 z-40 bg-vella-darker/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl md:hidden flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link 
                  key={link} 
                  to={`/${link.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-vella-accent/80 hover:text-vella-white transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-3 text-base font-medium text-vella-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="text-center py-3 text-base font-medium text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors">
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
