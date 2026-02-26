import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, AlertTriangle, Loader2 } from "lucide-react"; // Added Loader2
import type { Sector, SortStep } from "@/hooks/useReefGrid";

interface RestorationPriorityProps {
  gridExists: boolean;
  hasSorted: boolean;
  sortedSectors: Sector[];
  sortSteps: SortStep[];
  getCellColor: (value: number) => string;
  onSort: () => void;
  isLoading: boolean; // <-- Added this
}

export default function RestorationPriority({
  gridExists,
  hasSorted,
  sortedSectors,
  sortSteps,
  getCellColor,
  onSort,
  isLoading, // <-- Added this
}: RestorationPriorityProps) {
  if (!gridExists) return null;

  const top5 = sortedSectors.slice(0, 5);

  return (
    <section className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-gradient-coral">
            Restoration Priority
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Bubble Sort ranks every sector from most degraded to healthiest, revealing where to focus restoration.
          </p>

          <motion.button
            onClick={onSort}
            disabled={hasSorted || isLoading} // Disable while loading
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-display font-semibold text-lg transition-all ${
              hasSorted
                ? "bg-accent/20 text-accent border border-accent/30 cursor-default"
                : "bg-accent text-accent-foreground hover:scale-105 disabled:opacity-50"
            }`}
            whileHover={hasSorted || isLoading ? {} : { scale: 1.05 }}
            whileTap={hasSorted || isLoading ? {} : { scale: 0.98 }}
          >
            {/* Show a spinner while Python runs the sort */}
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Algorithm...
              </>
            ) : (
              <>
                <ArrowUpDown className="w-5 h-5" />
                {hasSorted ? "Sectors Sorted" : "Sort Sectors"}
              </>
            )}
          </motion.button>
        </motion.div>

        {hasSorted && (
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-primary" />
                Algorithm Insights
              </h3>
              <p className="text-muted-foreground mb-4">
                The Python backend successfully ran a <strong>Bubble Sort</strong> on the 2D Matrix to flatten and sort it by Health Score.
              </p>
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <code className="text-sm text-primary font-mono block mb-2">Algorithm used: O(n²) Bubble Sort</code>
                <code className="text-xs text-muted-foreground font-mono block">
                  for i in range(n):<br/>
                  &nbsp;&nbsp;for j in range(0, n - i - 1):<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;if flat_list[j] &gt; flat_list[j + 1]:<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap(flat_list[j], flat_list[j + 1])
                </code>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Top 5 Most Degraded Sectors
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {top5.map((sector, i) => (
                    <motion.div
                      key={`${sector.row}-${sector.col}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center font-display font-bold text-accent text-lg">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-semibold">
                          Sector [{sector.row}, {sector.col}]
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Health Score: <span className="text-accent font-bold">{sector.health}</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded ${getCellColor(sector.health)}`} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}