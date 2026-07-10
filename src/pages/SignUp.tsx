import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { publicApiRequest } from "../lib/api";
import { AuthSession, saveAuthSession } from "../lib/authSession";
import { startOAuth } from "../lib/oauth";

export function SignUp() {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the terms to create your account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await publicApiRequest<AuthSession>("/api/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (session.access_token) {
        saveAuthSession(session);
        navigate("/dashboard");
        return;
      }

      alert(session.message ?? "Check your email to verify your account.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-vella-black overflow-hidden relative">
      {/* Background Grid - from landing page */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)] z-0" />
      
      {/* Left Column: Form */}
      <div className="flex flex-col px-8 sm:px-16 lg:px-24 py-12 relative z-10 min-h-screen border-r border-white/5 bg-vella-black/80 backdrop-blur-xl">
        <Link to="/" className="inline-block mb-12 lg:mb-16">
          <img src="/logo.png" alt="Vella Logo" className="h-12 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] mx-auto lg:mx-0 flex-1 flex flex-col justify-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Create your account</h1>
          <p className="text-vella-accent/60 text-sm md:text-base mb-8">Start automating your customer support today</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80"
              type="button"
              onClick={() => startOAuth("google")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80"
              type="button"
              onClick={() => startOAuth("github")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="white"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Or</span>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="w-full bg-[#1c1c1c] border border-transparent rounded-xl px-5 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="w-full bg-[#1c1c1c] border border-transparent rounded-xl px-5 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value)}
                  />
                </div>
            </div>

            <div>
              <input 
                type="email" 
                placeholder="Work Email" 
                className="w-full bg-[#1c1c1c] border border-transparent rounded-xl px-5 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-[#1c1c1c] border border-transparent rounded-xl px-5 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3 pt-2 pb-4">
              <label className="flex items-center gap-2 cursor-pointer group mt-0.5">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${termsAccepted ? 'bg-white border-white' : 'border-white/20 group-hover:border-white/40'}`}>
                  {termsAccepted && <Check size={14} className="text-vella-black" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
              </label>
              <span className="text-sm text-white/70">
                I agree to the <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>
              </span>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-vella-black rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Login Now
            </Link>
          </p>
        </motion.div>

        <div className="mt-auto pt-16 flex items-center justify-between text-xs text-white/40 max-w-[420px] mx-auto lg:mx-0 w-full">
          <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
          <span>Copyright {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex relative items-center justify-center overflow-hidden z-10 bg-vella-black/40 backdrop-blur-sm">
        <div className="absolute top-8 right-8 flex gap-6 text-sm text-white/70">
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/login" className="px-4 py-1.5 bg-white rounded-md text-vella-black font-medium hover:bg-gray-200 transition-colors">Login</Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 w-full max-w-sm p-8"
        >
          {/* Phone/Dashboard UI representation */}
          <div className="bg-[#111111] border-[8px] border-[#0a0a0a] rounded-[2.5rem] p-5 shadow-2xl relative h-[700px] flex flex-col transform rotate-[-2deg] overflow-hidden">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0a0a0a] rounded-b-3xl z-20"></div>

            {/* Dashboard Content */}
            <div className="pt-6 flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                       <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                     </div>
                     <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">+12%</span>
                   </div>
                   <p className="text-white/60 text-xs mb-1">Total Messages</p>
                   <p className="text-white font-bold text-lg">24,592</p>
                 </div>
                 
                 <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                       <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                     </div>
                     <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">+8%</span>
                   </div>
                   <p className="text-white/60 text-xs mb-1">Visitors Helped</p>
                   <p className="text-white font-bold text-lg">8,401</p>
                 </div>
                 
                 <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                       <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">-0.4s</span>
                   </div>
                   <p className="text-white/60 text-xs mb-1">Avg Response</p>
                   <p className="text-white font-bold text-lg">1.2s</p>
                 </div>
                 
                 <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                       <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">+24%</span>
                   </div>
                   <p className="text-white/60 text-xs mb-1">Leads Captured</p>
                   <p className="text-white font-bold text-lg">432</p>
                 </div>
              </div>

              {/* Knowledge Base */}
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <h4 className="text-white font-medium text-sm">Knowledge Base</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                     <span className="text-white/60 truncate max-w-[120px]">website_crawl.pdf</span>
                     <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Synced</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                     <span className="text-white/60 truncate max-w-[120px]">refund_policy.docx</span>
                     <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Synced</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                     <span className="text-white/60 truncate max-w-[120px]">product_catalog_v2...</span>
                     <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Processing</span>
                  </div>
                </div>
              </div>

              {/* Recent Chats */}
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex-1">
                <h4 className="text-white font-medium text-sm mb-4">Recent Chats</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium">S</div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">Sarah J.</p>
                      <p className="text-white/40 text-[10px]">via Website</p>
                    </div>
                    <span className="text-white/40 text-[10px]">2m ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium">M</div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">Mike T.</p>
                      <p className="text-white/40 text-[10px]">via WhatsApp</p>
                    </div>
                    <span className="text-white/40 text-[10px]">15m ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium">A</div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">Anonymous</p>
                      <p className="text-white/40 text-[10px]">via Instagram</p>
                    </div>
                    <span className="text-white/40 text-[10px]">1h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-32 -right-16 bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 shadow-2xl transform rotate-[5deg]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                 <svg className="w-3 h-3 text-vella-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-white text-xs font-medium">Agent Active</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
