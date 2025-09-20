# File: core/predictor.py

import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from functools import lru_cache

MODEL_FILE = 'solar_model.joblib'

class SimpleSolarPredictor:
    """A simple machine learning model to predict solar output."""
    # FIX: Correctly indented __init__ method
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.features = ['temperature', 'irradiance', 'humidity', 'cloud_cover']
        self.target = 'actual_output'

    # FIX: Correctly indented train method
    def train(self, historical_data):
        X = historical_data[self.features]
        y = historical_data[self.target]
        self.model.fit(X, y)
        return self.model

    # FIX: Correctly indented predict method
    def predict(self, weather_data):
        X_pred = weather_data[self.features]
        return self.model.predict(X_pred)

@lru_cache(maxsize=1)
def load_model():
    """Loads the pre-trained model from disk."""
    print("Attempting to load model from disk...")
    if os.path.exists(MODEL_FILE):
        try:
            model = joblib.load(MODEL_FILE)
            print("Model loaded successfully.")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    print("Model file not found.")
    return None
    
def train_and_save_model(location, historical_weather):
    """Trains and saves the model for a given location using provided weather data."""
    try:
        if historical_weather.empty:
            print("Failed to use historical data, cannot train model.")
            return None
        
        df = historical_weather.copy()
        panel_area = 1.7
        panel_efficiency = 0.20
        temp_coeff = -0.004
        df['actual_output'] = (df['irradiance'] * panel_area * panel_efficiency * (1 + (df['temperature'] - 25) * temp_coeff))
        df.loc[df['irradiance'] < 50, 'actual_output'] = 0
        df['actual_output'] = df['actual_output'].clip(lower=0)
        
        predictor = SimpleSolarPredictor()
        trained_model = predictor.train(df)
        
        joblib.dump(trained_model, MODEL_FILE)
        
        print(f"Model successfully trained and saved for {location}.")
        return location
    except Exception as e:
        print(f"An error occurred during model training: {e}")
        return None