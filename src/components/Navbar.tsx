import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Bookmark Wallet</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#vault" className="hover:text-foreground transition-colors">Vault</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Sign In
          </button>
          <button className="text-sm bg-primary text-primary-foreground font-medium px-5 py-2 rounded-lg hover:brightness-110 transition-all">
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-border px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#vault" className="block text-sm text-muted-foreground hover:text-foreground">Vault</a>
          <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</a>
          <button className="w-full text-sm bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg mt-2">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
