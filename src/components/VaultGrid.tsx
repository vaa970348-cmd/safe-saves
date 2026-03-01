import { Briefcase, Play, Palette, Gamepad2 } from "lucide-react";

const categories = [
  {
    name: "Work",
    icon: Briefcase,
    links: ["Notion", "Slack", "Figma", "Linear"],
    count: 47,
    color: "from-primary/20 to-primary/5",
  },
  {
    name: "Media",
    icon: Play,
    links: ["YouTube", "Spotify", "Netflix", "Twitch"],
    count: 23,
    color: "from-accent/20 to-accent/5",
  },
  {
    name: "Design",
    icon: Palette,
    links: ["Dribbble", "Behance", "Awwwards", "Mobbin"],
    count: 65,
    color: "from-primary/30 to-primary/5",
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    links: ["Steam", "Epic Games", "IGN", "Twitch"],
    count: 31,
    color: "from-accent/30 to-accent/5",
  },
];

const VaultGrid = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-primary font-semibold tracking-widest text-sm uppercase mb-4">The Vault</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Your internet,{" "}
            <span className="gradient-text">organized.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Categorize everything into smart collections that adapt to how you browse.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className={`fade-up fade-up-delay-${Math.min(index + 1, 4)} glass rounded-2xl p-6 group hover:glow-border transition-all duration-500 cursor-pointer`}
            >
              <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-5`}>
                <cat.icon className="w-10 h-10 text-foreground/80" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">{cat.name}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {cat.count} links
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.links.map((link) => (
                  <span
                    key={link}
                    className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md"
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VaultGrid;
