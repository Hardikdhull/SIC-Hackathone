import random

# CONFIGURATION
# We define a 10x10 grid.
GRID_DIMENSION = 10

def calculate_health_score(temp_c, coral_pct, species_count):
    """
    Calculates a 0-100 score. 
    Formula: (Coral% * 0.4) + (Species * 1.5) - (Deviance from ideal temp * 2)
    """
    # Ideal reef temp is roughly 26-28C. Higher is bad.
    temp_penalty = max(0, (temp_c - 27) * 5)
    
    score = (coral_pct * 0.6) + (species_count * 1.5) - temp_penalty
    return max(0, min(100, int(score)))

def gridify_ocean_data(raw_points, bounds):
    """
    MANUAL GRID LOGIC (Curriculum Requirement):
    Maps scattered API points into a 2D Matrix using nested loops/math.
    """
    ocean_grid = [[{"species_count": 0, "points": []} for _ in range(GRID_DIMENSION)] for _ in range(GRID_DIMENSION)]

    min_lat, max_lat = bounds['min_lat'], bounds['max_lat']
    min_lon, max_lon = bounds['min_lon'], bounds['max_lon']

    # Calculate the size of each "cell" in degrees
    lat_step = (max_lat - min_lat) / GRID_DIMENSION
    lon_step = (max_lon - min_lon) / GRID_DIMENSION

    # 2. Iterate through every point from the API
    for point in raw_points:
        lat = point.get('decimalLatitude')
        lon = point.get('decimalLongitude')
        
        if lat and lon:
            # Determine which [row][col] this point belongs to
            # (lat - min_lat) / step gives us the index
            row_idx = int((lat - min_lat) / lat_step)
            col_idx = int((lon - min_lon) / lon_step)

            # Clamp indices to 0-9 just in case of edge cases
            row_idx = max(0, min(GRID_DIMENSION - 1, row_idx))
            col_idx = max(0, min(GRID_DIMENSION - 1, col_idx))

            # Increment species count in that sector
            ocean_grid[row_idx][col_idx]["species_count"] += 1
            ocean_grid[row_idx][col_idx]["points"].append(point)

    # 3. Synthesize Environmental Data (Augmentation step from Prompt)
    # The API gives species, but we simulate Temp/Coral Coverage for the Health Score
    final_grid = [[None for _ in range(GRID_DIMENSION)] for _ in range(GRID_DIMENSION)]

    for r in range(GRID_DIMENSION):
        for c in range(GRID_DIMENSION):
            cell_data = ocean_grid[r][c]
            count = cell_data["species_count"]
            
            # Synthesis: Generate realistic looking data based on species count
            # More species usually implies better coral coverage
            sim_coral = random.uniform(5, 30) + (count * 2) 
            sim_coral = min(90, sim_coral)
            
            # Random temp between 26C and 33C
            sim_temp = random.uniform(26.0, 33.0)

            score = calculate_health_score(sim_temp, sim_coral, count)

            final_grid[r][c] = {
                "id": f"Sector-{r}-{c}",
                "coordinates": [r, c],
                "species_count": count,
                "water_temp_c": round(sim_temp, 1),
                "coral_coverage_pct": round(sim_coral, 1),
                "health_score": score
            }

    return final_grid

def bubble_sort_sectors(ocean_grid):
    """
    SORTING ALGORITHM (Curriculum Requirement):
    Flattens the grid and sorts sectors by Health Score (Ascending).
    """
    # Flatten
    flat_list = []
    for r in range(GRID_DIMENSION):
        for c in range(GRID_DIMENSION):
            flat_list.append(ocean_grid[r][c])

    # Bubble Sort Implementation
    n = len(flat_list)
    for i in range(n):
        for j in range(0, n - i - 1):
            if flat_list[j]['health_score'] > flat_list[j + 1]['health_score']:
                flat_list[j], flat_list[j + 1] = flat_list[j + 1], flat_list[j]

    return flat_list