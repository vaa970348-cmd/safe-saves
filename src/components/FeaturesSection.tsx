import { Bookmark, Lock, RefreshCw, Tag } from "lucide-react";

const features = [
  {
    icon: Bookmark,
    title: "One-Click Save",
    description: "Save any link instantly from your browser with a single click. No friction, no fuss.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your bookmarks are encrypted before they leave your device. Only you can read them.",
  },
  {
    icon: RefreshCw,
    title: "Cross-Device Sync",
    description: "Seamlessly sync your entire collection across desktop, tablet, and mobile.",
  },
  {
    icon: Tag,
    title: "Smart Tagging",
    description: "Auto-categorize with AI-powered tags or create your own custom taxonomy.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-primary font-semibold tracking-widest text-sm uppercase mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Everything you need to{" "}
            <span className="gradient-text">own your web.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`fade-up fade-up-delay-${Math.min(index + 1, 4)} glass rounded-2xl p-8 group hover:glow-border transition-all duration-500`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
