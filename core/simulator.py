# File: core/simulator.py

import math

def simulate_solar_output(num_panels, panel_wattage, tilt_angle, latitude, 
                         azimuth, shading_factor, cleaning_frequency, degradation_rate):
    peak_sun_hours = 6.5 - 4 * (abs(latitude) / 90)
    base_output_per_panel = panel_wattage * peak_sun_hours 

    tilt_difference = abs(tilt_angle - latitude)
    tilt_efficiency = math.cos(math.radians(tilt_difference))
    
    optimal_azimuth = 180 if latitude >= 0 else 0
    azimuth_difference = abs(azimuth - optimal_azimuth)
    if azimuth_difference > 90:
        azimuth_difference = 90
    azimuth_efficiency = math.cos(math.radians(azimuth_difference))
    
    shading_efficiency = 1 - (shading_factor / 100)
    
    cleaning_efficiency_map = {'Weekly': 0.98, 'Monthly': 0.95, 'Quarterly': 0.90, 'Annually': 0.85}
    cleaning_efficiency = cleaning_efficiency_map.get(cleaning_frequency, 0.95)
    
    annual_efficiency = 1 - (degradation_rate / 100)
    
    total_efficiency = (tilt_efficiency * azimuth_efficiency * shading_efficiency * cleaning_efficiency * annual_efficiency)
    annual_output = (base_output_per_panel * num_panels * 365 * total_efficiency) / 1000
    
    return annual_output