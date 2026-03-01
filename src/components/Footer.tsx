import { Wallet } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">Bookmark Wallet</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bookmark Wallet. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
