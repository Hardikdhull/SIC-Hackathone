import random

GRID_DIMENSION = 10

def calculate_health_score(temp_c, coral_pct, species_count):
    """
    Calculates a 0-100 score. 
    Formula: (Coral% * 0.4) + (Species * 1.5) - (Deviance from ideal temp * 2)
    """
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
    lat_step = (max_lat - min_lat) / GRID_DIMENSION
    lon_step = (max_lon - min_lon) / GRID_DIMENSION
    for point in raw_points:
        lat = point.get('decimalLatitude')
        lon = point.get('decimalLongitude')
        if lat and lon:
            row_idx = int((lat - min_lat) / lat_step)
            col_idx = int((lon - min_lon) / lon_step)
            row_idx = max(0, min(GRID_DIMENSION - 1, row_idx))
            col_idx = max(0, min(GRID_DIMENSION - 1, col_idx))
            ocean_grid[row_idx][col_idx]["species_count"] += 1
            ocean_grid[row_idx][col_idx]["points"].append(point)
    final_grid = [[None for _ in range(GRID_DIMENSION)] for _ in range(GRID_DIMENSION)]
    for r in range(GRID_DIMENSION):
        for c in range(GRID_DIMENSION):
            cell_data = ocean_grid[r][c]
            count = cell_data["species_count"]
            sim_coral = random.uniform(5, 30) + (count * 2) 
            sim_coral = min(90, sim_coral)
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

    n = len(flat_list)
    for i in range(n):
        for j in range(0, n - i - 1):
            if flat_list[j]['health_score'] > flat_list[j + 1]['health_score']:
                flat_list[j], flat_list[j + 1] = flat_list[j + 1], flat_list[j]

    return flat_list
