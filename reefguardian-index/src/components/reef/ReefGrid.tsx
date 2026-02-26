import { motion } from "framer-motion";
import { Grid3x3, Zap, Crosshair } from "lucide-react";
import type { GridSize } from "@/hooks/useReefGrid";

interface ReefGridProps {
  grid: number[][];
  gridSize: GridSize;
  selectedCell: { row: number; col: number } | null;
  neighborhoodAvgs: number[][];
  hasScanned: boolean;
  getCellColor: (value: number) => string;
  onGenerate: (size: GridSize) => void;
  onCellClick: (row: number, col: number) => void;
}

export default function ReefGrid({
  grid,
  gridSize,
  selectedCell,
  neighborhoodAvgs,
  hasScanned,
  getCellColor,
  onGenerate,
  onCellClick,
}: ReefGridProps) {
  const displayGrid = hasScanned && neighborhoodAvgs.length > 0 ? neighborhoodAvgs : grid;
  const cellSize = gridSize === 10 ? "w-10 h-10 sm:w-12 sm:h-12" : "w-5 h-5 sm:w-6 sm:h-6";
  const fontSize = gridSize === 10 ? "text-xs" : "text-[8px]";

  return (
    <section id="simulator" className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-gradient-ocean">
            Reef Grid Simulator
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Generate a reef health map and explore individual sectors. {hasScanned && "(Showing 3×3 neighborhood averages)"}
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={() => onGenerate(10)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-medium text-sm transition-all ${
              grid.length === 10 && grid.length > 0
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            10 × 10 Grid
          </button>
          <button
            onClick={() => onGenerate(20)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-medium text-sm transition-all ${
              grid.length === 20
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            20 × 20 Grid
          </button>
          
        </div>

        {/* Grid Display */}
        {grid.length > 0 && (
          <div className="flex flex-col items-center gap-6">
            <div className="glass-card p-4 sm:p-6 overflow-x-auto max-w-full">
              <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {displayGrid.map((row, i) =>
                  row.map((val, j) => {
                    const isSelected = selectedCell?.row === i && selectedCell?.col === j;
                    return (
                      <motion.button
                        key={`${i}-${j}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i * gridSize + j) * 0.002 }}
                        onClick={() => onCellClick(i, j)}
                        className={`${cellSize} ${getCellColor(val)} rounded-sm flex items-center justify-center ${fontSize} font-mono font-bold transition-all duration-200 hover:scale-125 hover:z-10 relative ${
                          isSelected ? "ring-2 ring-foreground scale-125 z-10" : ""
                        }`}
                        title={`[${i},${j}] Health: ${grid[i][j]}${hasScanned ? ` | Avg: ${val}` : ""}`}
                      >
                        {gridSize === 10 ? val : ""}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Cell Info */}
            {selectedCell && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 flex items-center gap-4"
              >
                <Crosshair className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm text-muted-foreground">Sector </span>
                  <span className="font-display font-semibold">
                    [{selectedCell.row}, {selectedCell.col}]
                  </span>
                  <span className="text-sm text-muted-foreground ml-3">Health: </span>
                  <span className="font-display font-bold text-lg">{grid[selectedCell.row][selectedCell.col]}</span>
                  {hasScanned && neighborhoodAvgs.length > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground ml-3">Avg: </span>
                      <span className="font-display font-bold text-lg text-primary">
                        {neighborhoodAvgs[selectedCell.row][selectedCell.col]}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {[
                { label: "Critical (0–20)", cls: "reef-cell-danger" },
                { label: "Warning (21–40)", cls: "reef-cell-warning" },
                { label: "Moderate (41–60)", cls: "reef-cell-moderate" },
                { label: "Healthy (61–80)", cls: "reef-cell-healthy" },
                { label: "Pristine (81–100)", cls: "reef-cell-pristine" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-sm ${l.cls}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
