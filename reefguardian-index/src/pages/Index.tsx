import { useRef, useCallback } from "react";
import { useReefGrid } from "@/hooks/useReefGrid";
import HeroSection from "@/components/reef/HeroSection";
import AboutSection from "@/components/reef/AboutSection";
import ReefGrid from "@/components/reef/ReefGrid";
import NeighborhoodScan from "@/components/reef/NeighborhoodScan";
import RestorationPriority from "@/components/reef/RestorationPriority";
import DataVisualization from "@/components/reef/DataVisualization";
import OutputSection from "@/components/reef/OutputSection";
import Footer from "@/components/reef/Footer";

export default function Index() {
  const reef = useReefGrid();
  const simulatorRef = useRef<HTMLDivElement>(null);

  const handleSimulate = useCallback(() => {
    reef.generateGrid(10);
    setTimeout(() => {
      simulatorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [reef]);

  const handleInsertDeadZone = useCallback(() => {
    const max = reef.gridSize - 3;
    const row = Math.floor(Math.random() * max);
    const col = Math.floor(Math.random() * max);
    reef.insertDeadZone(row, col);
  }, [reef]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onSimulate={handleSimulate} />
      <AboutSection />
      <div ref={simulatorRef}>
        <ReefGrid
          grid={reef.grid}
          gridSize={reef.gridSize}
          selectedCell={reef.selectedCell}
          neighborhoodAvgs={reef.neighborhoodAvgs}
          hasScanned={reef.hasScanned}
          getCellColor={reef.getCellColor}
          onGenerate={reef.generateGrid}
          onCellClick={(r, c) => reef.setSelectedCell({ row: r, col: c })}
          onInsertDeadZone={handleInsertDeadZone}
        />
      </div>
      <NeighborhoodScan
        gridExists={reef.grid.length > 0}
        hasScanned={reef.hasScanned}
        onScan={reef.runNeighborhoodScan}
      />
      <RestorationPriority
        gridExists={reef.grid.length > 0}
        hasSorted={reef.hasSorted}
        sortedSectors={reef.sortedSectors}
        sortSteps={reef.sortSteps}
        getCellColor={reef.getCellColor}
        onSort={reef.sortSectors}
      />
      <DataVisualization
        grid={reef.grid}
        sortedSectors={reef.sortedSectors}
        hasSorted={reef.hasSorted}
        stats={reef.getStats()}
      />
      <OutputSection
        gridExists={reef.grid.length > 0}
        hasSorted={reef.hasSorted}
        onExportMap={reef.exportHealthMap}
        onExportCSV={reef.exportPriorityCSV}
      />
      <Footer />
    </div>
  );
}
