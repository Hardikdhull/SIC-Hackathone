import { motion } from "framer-motion";
import { ScanSearch } from "lucide-react";

interface NeighborhoodScanProps {
  gridExists: boolean;
  hasScanned: boolean;
  onScan: () => void;
}

export default function NeighborhoodScan({ gridExists, hasScanned, onScan }: NeighborhoodScanProps) {
  if (!gridExists) return null;

  return (
    <section className="py-16">
      <div className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold mb-4 text-gradient-ocean">
            Neighborhood Scan
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Run a 3×3 kernel scan across every sector to compute neighborhood averages and detect bleaching spread patterns.
          </p>

          <motion.button
            onClick={onScan}
            disabled={hasScanned}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-display font-semibold text-lg transition-all ${
              hasScanned
                ? "bg-sea-green/20 text-sea-green border border-sea-green/30 cursor-default"
                : "bg-primary text-primary-foreground glow-primary hover:scale-105"
            }`}
            whileHover={hasScanned ? {} : { scale: 1.05 }}
            whileTap={hasScanned ? {} : { scale: 0.98 }}
          >
            <ScanSearch className="w-5 h-5" />
            {hasScanned ? "Scan Complete — Grid Updated" : "Run 3×3 Grid Scan"}
          </motion.button>

          {hasScanned && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              The grid above now shows neighborhood averages. Smoothed colors reveal bleaching spread zones.
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
