# File: api/weather_api.py

import pandas as pd
import requests
from datetime import date, timedelta
from geopy.geocoders import Nominatim
import logging
from cachetools import cached, TTLCache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caches for each API function
forecast_cache = TTLCache(maxsize=128, ttl=3600)
historical_cache = TTLCache(maxsize=128, ttl=86400)
current_weather_cache = TTLCache(maxsize=128, ttl=900)

class WeatherAPI:
    @staticmethod
    @cached(cache=forecast_cache)
    def get_real_weather_forecast(location, forecast_days):
        """ Fetches real weather forecast data from Open-Meteo API.  """
        try:
            geolocator = Nominatim(user_agent="solar_forecaster_app", timeout=10)
            location_data = geolocator.geocode(location)
            if location_data is None:
                logger.error(f"Could not find coordinates for '{location}'.")
                return None, None, None

            lat, lon = location_data.latitude, location_data.longitude
            api_url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat, "longitude": lon,
                "daily": "temperature_2m_max,relative_humidity_2m_mean,shortwave_radiation_sum,cloud_cover_mean",
                "forecast_days": forecast_days, "timezone": "auto"
            }
            response = requests.get(api_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            daily_data = data['daily']
            df = pd.DataFrame()
            df['date'] = pd.to_datetime(daily_data['time'])
            df['temperature'] = daily_data['temperature_2m_max']
            df['irradiance'] = [(val * 1000000) / 86400 for val in daily_data['shortwave_radiation_sum']]
            df['humidity'] = daily_data['relative_humidity_2m_mean']
            df['cloud_cover'] = daily_data['cloud_cover_mean']
            return df, lat, lon
        except Exception as e:
            logger.error(f"An error occurred while fetching forecast data: {e}")
            return None, None, None

    @staticmethod
    @cached(cache=historical_cache)
    def get_historical_weather(lat, lon, days=365):
        """ Fetches historical weather data from the Open-Meteo Archive API.  """
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            api_url = "https://archive-api.open-meteo.com/v1/archive"
            params = {
                "latitude": lat, "longitude": lon,
                "start_date": start_date.strftime('%Y-%m-%d'),
                "end_date": end_date.strftime('%Y-%m-%d'),
                "hourly": "temperature_2m,relative_humidity_2m,shortwave_radiation,cloud_cover",
                "timezone": "auto"
            }
            response = requests.get(api_url, params=params, timeout=60) # Longer timeout for large data
            response.raise_for_status()
            data = response.json()

            df = pd.DataFrame(data['hourly'])
            df = df.rename(columns={
                'time': 'date', 'temperature_2m': 'temperature',
                'relative_humidity_2m': 'humidity', 'shortwave_radiation': 'irradiance',
                'cloud_cover': 'cloud_cover'
            })
            df['date'] = pd.to_datetime(df['date'])
            df = df.dropna()
            return df
        except Exception as e:
            logger.error(f"Failed to fetch historical weather data: {e}")
            return pd.DataFrame()

    @staticmethod
    @cached(cache=current_weather_cache)
    def get_current_weather(lat, lon):
        """ Fetches current weather for real-time prediction.  """
        try:
            api_url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat, "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,cloud_cover,shortwave_radiation",
                "timezone": "auto"
            }
            response = requests.get(api_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()['current']
            
            current_weather = pd.DataFrame([{
                'temperature': data['temperature_2m'],
                'humidity': data['relative_humidity_2m'],
                'irradiance': data['shortwave_radiation'],
                'cloud_cover': data['cloud_cover']
            }])
            feature_order = ['temperature', 'irradiance', 'humidity', 'cloud_cover']
            current_weather = current_weather[feature_order]
            return current_weather
        except Exception as e:
            logger.error(f"Could not fetch current weather: {e}")
            return None