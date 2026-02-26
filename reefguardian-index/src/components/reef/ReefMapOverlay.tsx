import { useState } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, SVGOverlay, useMapEvents } from 'react-leaflet';
import { ScanSearch } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { GridSize, MapBounds } from "@/hooks/useReefGrid";

interface ReefMapOverlayProps {
  grid: number[][];
  gridSize: GridSize;
  neighborhoodAvgs: number[][];
  hasScanned: boolean;
  activeBounds: MapBounds | null;
  onScanArea: (bounds: MapBounds) => void;
  isLoading: boolean;
}

function MapBoundsTracker({ setViewBounds }: { setViewBounds: (b: MapBounds) => void }) {
  useMapEvents({
    moveend: (e) => {
      const bounds = e.target.getBounds();
      setViewBounds({
        min_lat: bounds.getSouth(),
        max_lat: bounds.getNorth(),
        min_lon: bounds.getWest(),
        max_lon: bounds.getEast()
      });
    },
  });
  return null;
}

export default function ReefMapOverlay({ 
  grid, gridSize, neighborhoodAvgs, hasScanned, activeBounds, onScanArea, isLoading 
}: ReefMapOverlayProps) {
  
  const [viewBounds, setViewBounds] = useState<MapBounds>({
    min_lat: 24.65, max_lat: 24.95,
    min_lon: -80.95, max_lon: -80.65
  });

  const displayGrid = hasScanned && neighborhoodAvgs.length > 0 ? neighborhoodAvgs : grid;

  const getMapColor = (health: number) => {
    if (health <= 20) return "#ef4444"; 
    if (health <= 40) return "#f97316"; 
    if (health <= 60) return "#facc15"; 
    if (health <= 80) return "#4ade80"; 
    return "#059669";                   
  };

  const handleScanClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const centerLat = (viewBounds.min_lat + viewBounds.max_lat) / 2;
    const centerLon = (viewBounds.min_lon + viewBounds.max_lon) / 2;
    const span = 0.30; 

    const targetedBounds = {
      min_lat: centerLat - span / 2,
      max_lat: centerLat + span / 2,
      min_lon: centerLon - span / 2,
      max_lon: centerLon + span / 2,
    };

    onScanArea(targetedBounds);
  };

  // We only want to draw the grid and text if we have bounds AND we are not currently loading new data
  const shouldDrawGrid = activeBounds && !isLoading && displayGrid.length > 0;

  return (
    <div className="glass-card p-4 rounded-xl overflow-hidden w-full h-[600px] sm:h-[750px] relative z-0">
      
      {/* SCAN BUTTON */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
        <button 
          onClick={handleScanClick}
          disabled={isLoading}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-display font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          <ScanSearch className="w-6 h-6" />
          {isLoading ? "Scanning Ocean..." : "Scan Current View"}
        </button>
      </div>

      <MapContainer 
        center={[24.8, -80.8]}
        zoom={11} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <MapBoundsTracker setViewBounds={setViewBounds} />
        
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {/* LAYER 1: The colored grid boxes and popups */}
        {shouldDrawGrid && displayGrid.map((row, rIndex) => 
          row.map((healthScore, cIndex) => {
            // Check to make sure activeBounds is not null to satisfy TypeScript
            if (!activeBounds) return null;

            const lat_step = (activeBounds.max_lat - activeBounds.min_lat) / gridSize;
            const lon_step = (activeBounds.max_lon - activeBounds.min_lon) / gridSize;

            const cell_min_lat = activeBounds.min_lat + (rIndex * lat_step);
            const cell_max_lat = activeBounds.min_lat + ((rIndex + 1) * lat_step);
            const cell_min_lon = activeBounds.min_lon + (cIndex * lon_step);
            const cell_max_lon = activeBounds.min_lon + ((cIndex + 1) * lon_step);

            return (
              <Rectangle
                key={`rect-${activeBounds.min_lat}-${rIndex}-${cIndex}`} // Added bounds to key to force redraw
                bounds={[[cell_min_lat, cell_min_lon], [cell_max_lat, cell_max_lon]]}
                pathOptions={{ 
                  color: getMapColor(healthScore), 
                  fillColor: getMapColor(healthScore), 
                  fillOpacity: 0.5, 
                  weight: 2 
                }}
              >
                <Popup>
                  <div className="text-center font-display text-lg">
                    <strong>Sector [{rIndex}, {cIndex}]</strong><br/>
                    {hasScanned ? "Avg Health: " : "Health Score: "} 
                    <span style={{color: getMapColor(healthScore), fontWeight: 'bold'}}>{healthScore}</span>
                  </div>
                </Popup>
              </Rectangle>
            );
          })
        )}

        {/* LAYER 2: The dynamically scaling text overlay */}
        {shouldDrawGrid && activeBounds && (
          <SVGOverlay 
            key={`svg-layer-${activeBounds.min_lat}-${activeBounds.min_lon}-${hasScanned}`} // THIS FIXES THE BUG: Forces React to destroy the old text layer entirely
            bounds={[[activeBounds.min_lat, activeBounds.min_lon], [activeBounds.max_lat, activeBounds.max_lon]]}
            attributes={{ viewBox: `0 0 ${gridSize * 100} ${gridSize * 100}` }}          >
            <g style={{ pointerEvents: "none" }}>
              {displayGrid.map((row, rIndex) => 
                row.map((healthScore, cIndex) => {
                  const x = cIndex * 100 + 50;
                  const y = (gridSize - 1 - rIndex) * 100 + 55;

                  return (
                    <text 
                      key={`txt-${rIndex}-${cIndex}`} 
                      x={x} 
                      y={y} 
                      fontSize="18" 
                      fill="white" 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      style={{ 
                        fontWeight: 'bold',
                        textShadow: "0px 0px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(0,0,0,0.8)" 
                      }}
                    >
                      {healthScore}
                    </text>
                  );
                })
              )}
            </g>
          </SVGOverlay>
        )}
      </MapContainer>
    </div>
  );
}