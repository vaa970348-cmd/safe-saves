import heroWallet from "@/assets/hero-wallet.png";
import { Shield, Zap, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <div className="fade-up inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground tracking-wide">End-to-end encrypted</span>
            </div>

            <h1 className="fade-up fade-up-delay-1 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="gradient-text">The Secure Home</span>
              <br />
              <span className="text-foreground">for Every Link</span>
              <br />
              <span className="text-foreground">You Love.</span>
            </h1>

            <p className="fade-up fade-up-delay-2 mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
              Stop losing tabs. Store, tag, and encrypt your digital footprint in a private bookmark wallet designed for the modern web.
            </p>

            <div className="fade-up fade-up-delay-3 flex flex-wrap gap-4 mt-10">
              <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-xl hover:brightness-110 transition-all duration-300 animate-pulse-glow">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center gap-2 glass text-foreground font-medium px-7 py-3.5 rounded-xl hover:bg-card/80 transition-all duration-300">
                <Zap className="w-4 h-4 text-primary" />
                Watch Demo
              </button>
            </div>

            <div className="fade-up fade-up-delay-4 flex items-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                No credit card
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="fade-up fade-up-delay-2 flex justify-center lg:justify-end">
            <div className="relative animate-float">
              <img
                src={heroWallet}
                alt="Digital bookmark wallet with glowing translucent cards"
                className="w-full max-w-lg rounded-2xl"
              />
              {/* Glow behind image */}
              <div className="absolute inset-0 -z-10 blur-[60px] bg-primary/20 rounded-full scale-75" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
