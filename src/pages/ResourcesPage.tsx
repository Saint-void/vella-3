import { motion } from 'motion/react';
import { BookOpen, FileText, Video, Users, ArrowRight } from 'lucide-react';
import { CTA } from '../components/CTA';

export function ResourcesPage() {
  const resources = [
    { title: 'Documentation', desc: 'Detailed guides on API and setup.', icon: BookOpen },
    { title: 'Blog', desc: 'Latest updates and industry insights.', icon: FileText },
    { title: 'Video Tutorials', desc: 'Step-by-step visual guides.', icon: Video },
    { title: 'Community', desc: 'Join other developers and founders.', icon: Users }
  ];

  const recentPosts = [
    { title: 'How to build an AI agent for Shopify', date: 'Jul 2, 2026', category: 'Tutorial' },
    { title: 'Announcing Vella 2.0: Multi-channel support', date: 'Jun 28, 2026', category: 'Product' },
    { title: 'The future of automated customer service', date: 'Jun 15, 2026', category: 'Industry' },
  ];

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
            Resources
          </h1>
          <p className="text-lg md:text-xl text-vella-accent/60 max-w-2xl mx-auto">
            Everything you need to master Vella and elevate your customer experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {resources.map((res, i) => {
            const Icon = res.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-vella-darker border border-vella-border rounded-2xl p-6 hover:bg-vella-dark transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-vella-black flex items-center justify-center mb-6 group-hover:border-white/20 border border-vella-border transition-colors">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{res.title}</h3>
                <p className="text-sm text-vella-accent/60">{res.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-white/10 pt-24 pb-16">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Latest from the Blog</h2>
            <button className="text-sm font-medium text-white hover:text-vella-accent/80 transition-colors flex items-center gap-2">
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="w-full aspect-[16/9] bg-vella-darker border border-vella-border rounded-xl mb-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-3 mb-3 text-xs text-vella-accent/60 font-medium">
                  <span className="text-blue-400">{post.category}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-vella-accent/80 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CTA />
    </main>
  );
}
