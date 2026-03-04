import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="glass rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
              Ready to take control of
              <br />
              <span className="gradient-text">your digital world?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
              Join thousands of power users who trust Wallet to keep their internet organized and secure.
            </p>
            <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:brightness-110 transition-all duration-300 text-lg animate-pulse-glow">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
