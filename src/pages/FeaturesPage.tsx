import { motion } from 'motion/react';
import { Features as FeaturesSection } from '../components/Features';
import { CTA } from '../components/CTA';

export function FeaturesPage() {
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
            Powerful Features
          </h1>
          <p className="text-lg md:text-xl text-vella-accent/60 max-w-2xl mx-auto">
            Discover all the tools you need to build, deploy, and manage your AI employees efficiently.
          </p>
        </motion.div>
        
        <FeaturesSection />

        <div className="py-24 border-t border-white/10 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Train on Your Own Data</h2>
              <p className="text-lg text-vella-accent/70 mb-6 leading-relaxed">
                Our AI isn't just a generic chatbot. It's an employee trained specifically on your business knowledge.
              </p>
              <ul className="space-y-4">
                {[
                  'Upload PDFs, Word docs, and text files',
                  'Crawl your entire website with one click',
                  'Sync with Notion, Google Drive, and more',
                  'Real-time updates to your knowledge base'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-vella-darker border border-vella-border flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full" />
              <div className="glass-panel rounded-2xl p-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-vella-darker rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">PDF</div>
                      <div>
                         <p className="text-sm font-medium text-white">Employee_Handbook.pdf</p>
                         <p className="text-xs text-white/50">2.4 MB</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Synced</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-vella-darker rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">URL</div>
                      <div>
                         <p className="text-sm font-medium text-white">help.yourcompany.com</p>
                         <p className="text-xs text-white/50">42 pages</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <CTA />
    </main>
  );
}
