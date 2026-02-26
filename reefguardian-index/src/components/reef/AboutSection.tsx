import { motion } from "framer-motion";
import { Globe, Shell, Grid3x3 } from "lucide-react";

const cards = [
  {
    icon: Globe,
    title: "What is SDG 14?",
    text: "Sustainable Development Goal 14 aims to conserve and sustainably use the oceans, seas, and marine resources. It addresses pollution, overfishing, ocean acidification, and habitat destruction.",
  },
  {
    icon: Shell,
    title: "Why Coral Reefs Matter",
    text: "Coral reefs support 25% of all marine species, protect coastlines from storms, and sustain livelihoods for 500 million people. Yet over 50% of reefs have been lost in the past 30 years.",
  },
  {
    icon: Grid3x3,
    title: "2D Grid Modeling",
    text: "By mapping reef sectors into a 2D array, each cell captures a health score. Nested loop scans detect bleaching spread, while sorting algorithms prioritize which sectors need urgent restoration.",
  },
];

export default function AboutSection() {
  return (
    <section className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-gradient-ocean">
            Understanding the Crisis
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Combining environmental science with computational modeling to protect our oceans.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card-hover p-8"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
