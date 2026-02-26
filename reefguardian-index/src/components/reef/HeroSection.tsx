import { motion } from "framer-motion";
import { Waves } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Add this import
import heroImage from "@/assets/hero-reef.jpg";

export default function HeroSection() {
  const navigate = useNavigate(); // Initialize navigation

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image code remains exactly the same... */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Coral reef underwater" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
        <svg viewBox="0 0 1440 120" className="w-full h-full animate-wave">
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z"
            fill="hsl(var(--turquoise))"
            fillOpacity="0.3"
          />
        </svg>
      </div>

      <div className="relative z-10 section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
            <Waves className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">SDG 14 — Life Below Water</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight">
            <span className="text-gradient-ocean">Reef-Guard</span>
            <br />
            <span className="text-foreground/90 text-3xl sm:text-4xl lg:text-5xl font-light">
              Ocean Biodiversity Index
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Live 2D grid modeling for coral reef restoration.
            Detect bleaching patterns, identify dead zones, and prioritize conservation efforts using real OBIS data.
          </p>

          <motion.button
            onClick={() => navigate("/map")} // Navigate to map page
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Waves className="w-5 h-5" />
            Show
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}