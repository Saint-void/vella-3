import { motion } from 'motion/react';
import { Users, MessageSquare, Clock, Zap, Book, LayoutDashboard } from 'lucide-react';

export function DashboardShowcase() {
  return (
    <section className="w-full py-16 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            Everything in one place.
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl relative"
        >
          {/* Dashboard Header */}
          <div className="h-12 md:h-14 border-b border-vella-border bg-vella-darker/80 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="h-4 md:h-6 w-px bg-vella-border" />
              <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-white/80">
                <LayoutDashboard size={14} className="hidden sm:block" /> <span className="sm:hidden">Overview</span><span className="hidden sm:block">Overview</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-white/50">
              Last 30 Days
            </div>
          </div>

          {/* Dashboard Body */}
          <div className="p-4 md:p-8 bg-vella-black/40 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Main Stats Area */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { title: 'Total Messages', val: '24,592', inc: '+12%', icon: MessageSquare },
                  { title: 'Visitors Helped', val: '8,401', inc: '+8%', icon: Users },
                  { title: 'Avg Response', val: '1.2s', inc: '-0.4s', icon: Clock },
                  { title: 'Leads Captured', val: '432', inc: '+24%', icon: Zap },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-vella-darker/50 border border-vella-border rounded-xl p-3 md:p-4">
                      <div className="flex justify-between items-start mb-2 md:mb-4">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon size={12} className="text-white/70 md:w-3.5 md:h-3.5" />
                        </div>
                        <span className="text-[10px] md:text-xs font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">{stat.inc}</span>
                      </div>
                      <p className="text-xs md:text-sm text-vella-accent/60 mb-0.5 md:mb-1 truncate">{stat.title}</p>
                      <p className="text-lg md:text-2xl font-bold text-white">{stat.val}</p>
                    </div>
                  )
                })}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-vella-darker/50 border border-vella-border rounded-xl p-4 md:p-6 h-48 md:h-64 flex flex-col">
                <p className="text-xs md:text-sm font-medium text-white mb-4 md:mb-6">Conversation Analytics</p>
                <div className="flex-1 flex items-end gap-1 md:gap-2">
                  {[40, 60, 35, 80, 55, 90, 45, 70, 65, 100, 85, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative group">
                       <motion.div 
                         initial={{ height: 0 }}
                         whileInView={{ height: `${h}%` }}
                         viewport={{ once: true }}
                         transition={{ duration: 1, delay: i * 0.05 }}
                         className="absolute bottom-0 left-0 right-0 bg-white/40 rounded-t-sm group-hover:bg-white/60 transition-colors"
                       />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-4 md:space-y-6">
              {/* Knowledge Base Status */}
              <div className="bg-vella-darker/50 border border-vella-border rounded-xl p-4 md:p-5">
                 <div className="flex items-center gap-2 mb-3 md:mb-4">
                   <Book size={14} className="text-white/80 md:w-4 md:h-4" />
                   <p className="text-xs md:text-sm font-medium text-white">Knowledge Base</p>
                 </div>
                 <div className="space-y-2.5 md:space-y-3">
                   {[
                     { name: 'website_crawl.pdf', status: 'Synced' },
                     { name: 'refund_policy.docx', status: 'Synced' },
                     { name: 'product_catalog_v2.csv', status: 'Processing' },
                   ].map((doc, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px] md:text-xs">
                       <span className="text-white/60 truncate mr-2">{doc.name}</span>
                       <span className={`px-1.5 md:px-2 py-0.5 rounded-full ${doc.status === 'Synced' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                         {doc.status}
                       </span>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Recent Chats */}
              <div className="bg-vella-darker/50 border border-vella-border rounded-xl p-4 md:p-5 flex-1 min-h-[160px] md:min-h-[200px]">
                 <p className="text-xs md:text-sm font-medium text-white mb-3 md:mb-4">Recent Chats</p>
                 <div className="space-y-3 md:space-y-4">
                   {[
                     { name: 'Sarah J.', via: 'Website', time: '2m ago' },
                     { name: 'Mike T.', via: 'WhatsApp', time: '15m ago' },
                     { name: 'Anonymous', via: 'Instagram', time: '1h ago' },
                   ].map((chat, i) => (
                     <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2 md:gap-3">
                         <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] md:text-xs text-white">
                           {chat.name.charAt(0)}
                         </div>
                         <div>
                           <p className="text-[10px] md:text-xs font-medium text-white">{chat.name}</p>
                           <p className="text-[8px] md:text-[10px] text-white/50">via {chat.via}</p>
                         </div>
                       </div>
                       <span className="text-[8px] md:text-[10px] text-white/40">{chat.time}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
