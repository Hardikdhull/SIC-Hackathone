import { motion } from "framer-motion";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

interface OutputSectionProps {
  gridExists: boolean;
  hasSorted: boolean;
  onExportMap: () => void;
  onExportCSV: () => void;
}

export default function OutputSection({ gridExists, hasSorted, onExportMap, onExportCSV }: OutputSectionProps) {
  if (!gridExists) return null;

  return (
    <section className="py-16">
      <div className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold mb-4 text-gradient-ocean">Export Data</h2>
          <p className="text-muted-foreground mb-8">Download reef health data for further analysis.</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExportMap}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-display font-medium hover:bg-secondary/80 transition-all"
            >
              <FileText className="w-5 h-5" />
              reef_health_map.txt
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
            {hasSorted && (
              <button
                onClick={onExportCSV}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-display font-medium hover:bg-secondary/80 transition-all"
              >
                <FileSpreadsheet className="w-5 h-5" />
                restoration_priority.csv
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
