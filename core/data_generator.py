# File: core/data_generator.py

import pandas as pd
import numpy as np

class SolarDataGenerator:
    @staticmethod
    def generate_realistic_data(num_panels=10, days=30):
        dates = pd.date_range(start='2025-01-01', periods=days, freq='D')
        data = []
        panel_base_efficiency = np.random.normal(0.20, 0.015, num_panels)
        panel_degradation_rate = np.random.normal(0.5, 0.1, num_panels) / 100 / 365
        panel_soiling_factor = np.ones(num_panels)
        panel_health_status = np.ones(num_panels)

        for i, date in enumerate(dates):
            season_factor = 0.85 + 0.35 * np.sin(2 * np.pi * (date.dayofyear - 80) / 365)
            daily_cloud_factor = np.random.beta(a=5, b=2) * season_factor
            base_temp = 18 + 12 * season_factor
            if np.random.random() < 0.1:
                panel_soiling_factor[:] = 1.0
            panel_soiling_factor *= (1 - np.random.uniform(0.001, 0.003, num_panels))

            for hour in range(5, 20):
                hour_factor = max(0, np.sin(np.pi * (hour - 5) / 14))
                hourly_cloud_noise = max(0, 1 + np.random.normal(0, 0.2))
                current_cloud_factor = min(1, daily_cloud_factor * hourly_cloud_noise)
                base_irradiance = 1100 * hour_factor * current_cloud_factor
                irradiance = max(0, base_irradiance + np.random.normal(0, 20))
                temperature = base_temp + (15 * hour_factor * current_cloud_factor) + np.random.normal(0, 1.5)
                humidity = max(20, min(95, 80 - (temperature - 20) * 2 + np.random.normal(0, 5)))

                for panel_idx in range(num_panels):
                    if panel_health_status[panel_idx] == 1.0 and np.random.random() < 0.0001:
                        panel_health_status[panel_idx] = np.random.uniform(0.1, 0.5)
                    degradation = (1 - panel_degradation_rate[panel_idx]) ** i
                    current_efficiency = (panel_base_efficiency[panel_idx] * degradation * panel_soiling_factor[panel_idx] * panel_health_status[panel_idx])
                    if np.random.random() < 0.001:
                        current_efficiency *= np.random.uniform(0.2, 0.7)
                    panel_area = 1.7
                    energy_output = irradiance * current_efficiency * panel_area
                    voltage = 24.0 + (temperature - 25) * -0.1 + np.random.normal(0, 0.5)
                    current = max(0, energy_output / voltage if voltage > 0 else 0)
                    power = voltage * current
                    data.append({
                        'datetime': date + pd.Timedelta(hours=hour, minutes=np.random.randint(0, 60)),
                        'panel_id': f'Panel_{panel_idx+1:02d}',
                        'irradiance': irradiance, 'temperature': temperature, 'humidity': humidity,
                        'energy_output': max(0, energy_output), 'panel_voltage': voltage,
                        'panel_current': current, 'panel_power': max(0, power),
                        'ambient_temp': temperature - np.random.uniform(2, 5),
                        'wind_speed': max(0, np.random.normal(10, 5))
                    })
        return pd.DataFrame(data)