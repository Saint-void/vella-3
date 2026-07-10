export function Footer() {
  const sections = {
    Product: ['Features', 'Pricing', 'Documentation', 'API', 'Changelog'],
    Resources: ['Blog', 'Developers', 'Community', 'Help Center'],
    Company: ['About', 'Careers', 'Contact', 'Partners'],
    Socials: ['LinkedIn', 'GitHub', 'X', 'YouTube']
  };

  return (
    <footer className="w-full bg-vella-black border-t border-vella-border/50 pt-16 md:pt-20 pb-8 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 mb-12 md:mb-20">
          
          {/* Brand & Newsletter */}
          <div className="col-span-2 md:col-span-2">
            <a href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tighter text-white inline-block mb-4 md:mb-6">
              <img src="/logo.png" alt="Vella Logo" className="h-13 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </a>
            <p className="text-sm text-vella-accent/60 mb-6 max-w-xs">
              Subscribe to our newsletter for the latest AI customer support insights and product updates.
            </p>
            <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-vella-darker border border-vella-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors w-full sm:max-w-[200px]"
              />
              <button type="submit" className="bg-white text-vella-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          {/* Links */}
          {Object.entries(sections).map(([title, links], idx) => (
            <div key={idx} className="col-span-1">
              <h4 className="text-white font-medium mb-4 md:mb-6 text-sm md:text-base">{title}</h4>
              <ul className="space-y-2 md:space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-xs md:text-sm text-vella-accent/50 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
        </div>

        <div className="border-t border-vella-border/50 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-vella-accent/40 text-center md:text-left">
            © 2026 Vella. Built by Void Technology.
          </p>
          <div className="flex gap-4 md:gap-6">
            <a href="#" className="text-xs text-vella-accent/40 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-vella-accent/40 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
