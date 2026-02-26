import { useState, useCallback } from "react";
import { toast } from "sonner";

export type GridSize = 10 | 20;

export interface Sector {
  row: number;
  col: number;
  health: number;
  species?: number;
  temp?: number;
}

export interface SortStep {
  array: Sector[];
  comparing: [number, number];
  swapped: boolean;
}

// Data format coming from your Python Backend
interface BackendCell {
  coordinates: [number, number];
  health_score: number;
  species_count: number;
  water_temp_c: number;
}

// NEW: Interface for the GPS Map Bounds
export interface MapBounds {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export function useReefGrid() {
  const [gridSize, setGridSize] = useState<GridSize>(10);
  const [grid, setGrid] = useState<number[][]>([]);
  const [neighborhoodAvgs, setNeighborhoodAvgs] = useState<number[][]>([]);
  const [sortedSectors, setSortedSectors] = useState<Sector[]>([]);
  const [sortSteps, setSortSteps] = useState<SortStep[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [hasSorted, setHasSorted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: Track the currently scanned map area
  const [activeBounds, setActiveBounds] = useState<MapBounds | null>(null);

  const generateGrid = useCallback(async (size: GridSize, bounds?: MapBounds) => {
    // If no bounds are provided, do nothing (wait for map click)
    if (!bounds) return;

    setIsLoading(true);
    setGridSize(10); // Force 10x10 to match Python PoC
    setActiveBounds(bounds); 
    
    try {
      // Fetch dynamic area from Python Backend
      const url = `http://127.0.0.1:8000/ocean-matrix?min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lon=${bounds.min_lon}&max_lon=${bounds.max_lon}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Failed to connect to Python Backend");
      
      const data = await response.json();
      
      // Map Python structure to Frontend format
      const newGrid: number[][] = data.grid.map((row: BackendCell[]) => 
        row.map((cell) => cell.health_score)
      );

      setGrid(newGrid);
      
      // Reset UI states for the new scan
      setNeighborhoodAvgs([]);
      setSortedSectors([]);
      setSortSteps([]);
      setHasScanned(false);
      setHasSorted(false);
      setSelectedCell(null);
      
      toast.success("Ocean Area Scanned!", {
        description: `Found ${data.raw_point_count} marine records in this sector.`,
      });

    } catch (error) {
      console.error(error);
      toast.error("Scan Failed", {
        description: "Make sure your Python backend is running.",
      });
      // Clear grid on error so we don't show old data
      setGrid([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sortSectors = useCallback(async () => {
    // We need both the grid and the exact bounds to ask Python to sort it
    if (grid.length === 0 || !activeBounds) return;
    setIsLoading(true);

    try {
      const url = `http://127.0.0.1:8000/restoration-roadmap?min_lat=${activeBounds.min_lat}&max_lat=${activeBounds.max_lat}&min_lon=${activeBounds.min_lon}&max_lon=${activeBounds.max_lon}`;
      const response = await fetch(url);
      const data = await response.json();

      // The backend returns the list fully sorted by Bubble Sort
      const sorted: Sector[] = data.urgent_restoration_needed.map((item: BackendCell) => ({
        row: item.coordinates[0],
        col: item.coordinates[1],
        health: item.health_score,
        species: item.species_count,
        temp: item.water_temp_c
      }));

      setSortedSectors(sorted);
      setHasSorted(true);
      setSortSteps([]); 
      
      toast.success("Restoration Roadmap Generated", {
        description: "Priority dead-zones identified by Python.",
      });

    } catch (error) {
      console.error(error);
      toast.error("Sorting Failed");
    } finally {
      setIsLoading(false);
    }
  }, [grid, activeBounds]);

  const runNeighborhoodScan = useCallback(() => {
    if (grid.length === 0) return;
    const size = grid.length;
    const avgs: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        let sum = 0;
        let count = 0;
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const ni = i + di;
            const nj = j + dj;
            if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
              sum += grid[ni][nj];
              count++;
            }
          }
        }
        row.push(Math.round(sum / count));
      }
      avgs.push(row);
    }
    setNeighborhoodAvgs(avgs);
    setHasScanned(true);
  }, [grid]);

  const insertDeadZone = useCallback(() => {
     toast.info("Read-Only Mode", {
         description: "Cannot manually insert dead zones into live API data."
     });
  }, []);

  const getCellColor = (value: number): string => {
    if (value <= 20) return "bg-red-500 text-white";       
    if (value <= 40) return "bg-orange-400 text-white";    
    if (value <= 60) return "bg-yellow-300 text-black";    
    if (value <= 80) return "bg-green-400 text-black";     
    return "bg-emerald-600 text-white";                    
  };

  const getStats = useCallback(() => {
    if (grid.length === 0) return null;
    const allValues = grid.flat();
    const avg = Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
    let minVal = 101, minR = 0, minC = 0;
    
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] < minVal) {
                minVal = grid[i][j];
                minR = i;
                minC = j;
            }
        }
    }

    const distribution = {
      critical: allValues.filter((v) => v <= 20).length,
      warning: allValues.filter((v) => v > 20 && v <= 40).length,
      moderate: allValues.filter((v) => v > 40 && v <= 60).length,
      healthy: allValues.filter((v) => v > 60 && v <= 80).length,
      pristine: allValues.filter((v) => v > 80).length,
    };
    return { avg, mostCritical: { row: minR, col: minC, value: minVal }, distribution };
  }, [grid]);

  const exportHealthMap = useCallback(() => {
    if (grid.length === 0) return;
    let content = "Reef Health Map\n" + "=".repeat(40) + "\n\n";
    for (let i = 0; i < grid.length; i++) {
      content += grid[i].map((v) => String(v).padStart(4)).join("") + "\n";
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reef_health_map.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [grid]);

  const exportPriorityCSV = useCallback(() => {
    if (sortedSectors.length === 0) return;
    let csv = "Rank,Row,Col,Health Score\n";
    sortedSectors.forEach((s, i) => {
      csv += `${i + 1},${s.row},${s.col},${s.health}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restoration_priority.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedSectors]);

  return {
    gridSize,
    grid,
    neighborhoodAvgs,
    sortedSectors,
    sortSteps,
    selectedCell,
    hasScanned,
    hasSorted,
    activeBounds, // Exported so MapPage knows what bounds are currently drawn
    isLoading,    // Exported to show loading states on UI
    setSelectedCell,
    generateGrid,
    insertDeadZone,
    runNeighborhoodScan,
    sortSectors,
    getCellColor,
    getStats,
    exportHealthMap,
    exportPriorityCSV,
  };
}