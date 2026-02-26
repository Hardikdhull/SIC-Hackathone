from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from logic import gridify_ocean_data, bubble_sort_sectors

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_obis_data(bounds):
    """Fetches real occurrence data for the GIVEN bounds."""
    url = "https://api.obis.org/v3/occurrence"
    
    geometry = f"POLYGON(({bounds['min_lon']} {bounds['min_lat']}, {bounds['max_lon']} {bounds['min_lat']}, {bounds['max_lon']} {bounds['max_lat']}, {bounds['min_lon']} {bounds['max_lat']}, {bounds['min_lon']} {bounds['min_lat']}))"
    
    params = {
        "geometry": geometry,
        "size": 500, 
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get('results', [])
    except Exception as e:
        print(f"Error fetching OBIS data: {e}")
        return []

@app.get("/ocean-matrix")
def get_matrix(
    min_lat: float = Query(...), 
    max_lat: float = Query(...), 
    min_lon: float = Query(...), 
    max_lon: float = Query(...)
):
    bounds = {"min_lat": min_lat, "max_lat": max_lat, "min_lon": min_lon, "max_lon": max_lon}
    raw_points = fetch_obis_data(bounds)
    grid = gridify_ocean_data(raw_points, bounds)
    return {"grid": grid, "raw_point_count": len(raw_points)}

@app.get("/restoration-roadmap")
def get_roadmap(
    min_lat: float = Query(...), 
    max_lat: float = Query(...), 
    min_lon: float = Query(...), 
    max_lon: float = Query(...)
):
    bounds = {"min_lat": min_lat, "max_lat": max_lat, "min_lon": min_lon, "max_lon": max_lon}
    raw_points = fetch_obis_data(bounds)
    grid = gridify_ocean_data(raw_points, bounds)
    sorted_sectors = bubble_sort_sectors(grid)
    
    return {
        "urgent_restoration_needed": sorted_sectors[:10],
        "healthy_sectors": sorted_sectors[-10:]
    }