# File: train_initial_model.py (Final Version)

import os
import pandas as pd
from api.weather_api import WeatherAPI
from core.predictor import train_and_save_model

def create_initial_model(location: str, lat: float, lon: float):
    """
    A one-time script to train the initial AI model using pre-defined coordinates,
    bypassing the unreliable geocoding network call.
    """
    print(f"--- Starting initial model training for {location} ---")
    print(f"Using known coordinates: Lat={lat}, Lon={lon}")

    # Step 1 (Geocoding) is now skipped.

    # Step 2: Fetch historical weather data.
    print("Step 2: Fetching historical weather data (this may take a moment)...")
    
    # We call the weather API function directly, which we know works.
    historical_weather = WeatherAPI.get_historical_weather(lat, lon, days=180)
    
    if historical_weather is None or historical_weather.empty:
        print("\n--- FAILED! ---")
        print("ERROR: Failed to fetch historical data, even though the connection is okay.")
        print("This could be a temporary issue with the weather API server. Please try again in a few minutes.")
        return
        
    print(f"Successfully fetched {len(historical_weather)} rows of historical data.")

    # Step 3: Train and save the model
    print("Step 3: Training AI model and saving to 'solar_model.joblib'...")
    
    result = train_and_save_model(location, historical_weather)
    
    if result and os.path.exists('solar_model.joblib'):
        print("\n--- SUCCESS! ---")
        print("Model file 'solar_model.joblib' has been created in your project directory.")
    else:
        print("\n--- FAILED! ---")
        print("Model training failed. Please check for errors in the logs above.")

if __name__ == "__main__":
    # We will train the initial model for Nagpur using its known coordinates.
    initial_location = "Nagpur"
    nagpur_lat = 21.1498134
    nagpur_lon = 79.0820556
    create_initial_model(initial_location, nagpur_lat, nagpur_lon)