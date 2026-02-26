import { Link } from "react-router-dom";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import { useReefGrid } from "@/hooks/useReefGrid";
import ReefMapOverlay from "@/components/reef/ReefMapOverlay";
import NeighborhoodScan from "@/components/reef/NeighborhoodScan";
import RestorationPriority from "@/components/reef/RestorationPriority";
import DataVisualization from "@/components/reef/DataVisualization";
import OutputSection from "@/components/reef/OutputSection";

export default function MapPage() {
  const reef = useReefGrid();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 mb-4">
        <Link to="/" className="inline-flex items-center text-primary hover:underline font-display">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>

      {/* --- REAL WORLD SATELLITE MAP --- */}
      <section className="py-12 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold mb-4 flex items-center justify-center gap-3 text-gradient-ocean">
            <MapIcon className="w-8 h-8 text-primary" />
            Live Satellite GPS Mapping
          </h2>
          <p className="text-muted-foreground">
            Pan the map to any ocean region and click "Scan Current View" to fetch real OBIS data.
          </p>
        </div>
        
        {/* HERE IS THE FIX: We are now passing onScanArea to the map! */}
        <ReefMapOverlay 
          grid={reef.grid} 
          gridSize={reef.gridSize} 
          neighborhoodAvgs={reef.neighborhoodAvgs} 
          hasScanned={reef.hasScanned} 
          activeBounds={reef.activeBounds}
          isLoading={reef.isLoading}
          onScanArea={(bounds) => reef.generateGrid(10, bounds)} 
        />
      </section>

      {/* Only show these analysis tools IF a scan has been completed successfully */}
      {reef.grid.length > 0 && (
        <>
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
            isLoading={reef.isLoading}
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
        </>
      )}
    </div>
  );
}