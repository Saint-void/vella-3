import { motion } from 'motion/react';
import { Integrations } from '../components/Integrations';
import { CTA } from '../components/CTA';

export function IntegrationsPage() {
  const categories = [
    {
      name: 'Messaging Platforms',
      tools: ['WhatsApp Business', 'Facebook Messenger', 'Instagram Direct', 'Slack', 'Microsoft Teams', 'Telegram']
    },
    {
      name: 'Helpdesks',
      tools: ['Zendesk', 'Intercom', 'Freshdesk', 'HubSpot Service Hub', 'Salesforce Service Cloud']
    },
    {
      name: 'E-commerce',
      tools: ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce']
    },
    {
      name: 'Knowledge Sources',
      tools: ['Notion', 'Google Drive', 'Confluence', 'Zendesk Guide', 'Webflow']
    }
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
            Seamless Integrations
          </h1>
          <p className="text-lg md:text-xl text-vella-accent/60 max-w-2xl mx-auto">
            Connect your AI to the platforms you already use. One click, infinite scale.
          </p>
        </motion.div>
        
        <Integrations />

        <div className="py-24 border-t border-white/10 mt-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Browse all Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {categories.map((cat, i) => (
              <div key={i} className="bg-vella-darker border border-vella-border rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-white/10">{cat.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {cat.tools.map((tool, j) => (
                    <span key={j} className="px-4 py-2 bg-vella-black border border-white/5 rounded-full text-sm text-vella-accent/80">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CTA />
    </main>
  );
}
