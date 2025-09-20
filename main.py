# File: main.py (The final, complete, and organized version)

# --- 1. Standard Library Imports ---
from typing import List, Optional
from datetime import datetime
import traceback
import pytz

# --- 2. Third-Party Imports ---
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from geopy.geocoders import Nominatim

# --- 3. Local Application Imports ---
from api.weather_api import WeatherAPI
from core.anomaly_detector import EnhancedAnomalyDetector
from core.data_generator import SolarDataGenerator
from core.predictor import load_model, SimpleSolarPredictor, train_and_save_model
from core.simulator import simulate_solar_output
from db.supabase_client import fetch_supabase_data

# --- App Initialization ---
app = FastAPI(
    title="SolarSmart API",
    description="API for solar performance forecasting and analysis.",
    version="1.0.0"
)

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class ForecastRequest(BaseModel):
    location: str
    forecast_days: int
    panel_capacity: float
    panel_efficiency: float

class PredictionRequest(BaseModel):
    lat: float
    lon: float

class SimulationRequest(BaseModel):
    num_panels: int
    panel_wattage: int
    tilt_angle: float
    latitude: float
    azimuth: float
    shading_factor: float
    cleaning_frequency: str
    degradation_rate: float

class RetrainRequest(BaseModel):
    location: str

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "SolarSmart API is running"}

@app.post("/api/forecast")
async def get_solar_forecast(request: ForecastRequest):
    """Accepts location and panel details, returns a weather and energy forecast."""
    try:
        # This logic is derived from the forecasting_page in the source file
        weather_data, _, _ = WeatherAPI.get_real_weather_forecast(request.location, request.forecast_days)
        if weather_data is None or weather_data.empty:
            raise HTTPException(status_code=404, detail="Could not retrieve weather data for the specified location.")

        model = load_model() 
        if model is None:
            raise HTTPException(status_code=500, detail="AI model is not available or failed to load.")

        predictor = SimpleSolarPredictor()
        predictor.model = model
        predictions = predictor.predict(weather_data)
        
        weather_data['predicted_output_kwh'] = (predictions * request.panel_capacity / 10 * request.panel_efficiency / 20)

        weather_results = weather_data[['date', 'temperature', 'irradiance', 'humidity', 'cloud_cover']].to_dict(orient='records')
        forecast_results = weather_data[['date', 'predicted_output_kwh']].to_dict(orient='records')

        for item in weather_results: item['date'] = str(item['date'])
        for item in forecast_results: item['date'] = str(item['date'])

        return { "location": request.location, "weather_data": weather_results, "energy_forecast": forecast_results }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard-summary")
async def get_dashboard_summary():
    """Generates and returns a summary of realistic demo data for the dashboard."""
    try:
        # Logic to generate data and calculate KPIs
        data = SolarDataGenerator.generate_realistic_data(num_panels=15, days=30)
        
        total_energy_kwh = data['energy_output'].sum() / 1000
        avg_daily_output_kwh = total_energy_kwh / 30
        peak_output_kwh = data['energy_output'].max() / 1000
        
        daily_output = data.groupby(data['datetime'].dt.date)['energy_output'].sum().div(1000).round(2).reset_index()
        daily_output.rename(columns={'datetime': 'date', 'energy_output': 'energy'}, inplace=True)
        daily_output['date'] = daily_output['date'].astype(str)

        panel_layout = []
        for i in range(15):
            status_roll = np.random.random()
            status = 'Normal'
            if status_roll < 0.05: status = 'Critical'
            elif status_roll < 0.15: status = 'Warning'
            panel_layout.append({
                "id": f"Panel_{i+1:02d}", "output": f"{np.random.uniform(4.5, 5.8):.1f} kWh",
                "status": status, "x": np.random.randint(10, 90), "y": np.random.randint(10, 90)
            })

        return {
            "kpi": { "total_energy": f"{total_energy_kwh:,.1f}", "avg_daily_output": f"{avg_daily_output_kwh:,.1f}", "peak_output": f"{peak_output_kwh:,.1f}", "uptime": "99.8%" },
            "energy_trend": daily_output.to_dict(orient='records'),
            "panel_layout": panel_layout
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard data: {str(e)}")

@app.get("/api/ai-twin-summary/{city_name}")
async def get_ai_twin_summary(city_name: str, price: float = 8.0):
    """A consolidated endpoint to provide all data for the AI Twin Command Center."""
    try:
        # Geocode the city to get lat/lon
        geolocator = Nominatim(user_agent="solar_smart_api", timeout=10)
        location_data = geolocator.geocode(city_name)
        if not location_data:
            raise HTTPException(status_code=404, detail=f"Location not found: {city_name}")
        lat, lon = location_data.latitude, location_data.longitude

        # Fetch Live Data from Supabase
        live_df = fetch_supabase_data(table_name="metrics", limit=200)
        
        latest_data = {}
        latest_power_mw = 0
        actual_energy_mwh_today = 0

        if not live_df.empty:
            live_df['created_at'] = pd.to_datetime(live_df['created_at'], utc=True)
            live_df['timestamp_kolkata'] = live_df['created_at'].dt.tz_convert('Asia/Kolkata')
            latest_data_row = live_df.iloc[-1]
            latest_power_mw = latest_data_row.get('power', 0) * 1000
            latest_data = {
                "voltage": latest_data_row.get('voltage', 0), "current": latest_data_row.get('current', 0) * 1000,
                "temperature": latest_data_row.get('temperature', 0), "humidity": latest_data_row.get('humidity', 0),
                "timestamp": latest_data_row['timestamp_kolkata'].isoformat()
            }
            power_mw_series = live_df['power'].fillna(0) * 1000
            delta_hours = live_df['timestamp_kolkata'].diff().dt.total_seconds().fillna(0) / 3600.0
            actual_energy_mwh_today = (power_mw_series * delta_hours).sum()

        # Get AI Prediction
        model = load_model()
        if model is None: raise HTTPException(status_code=500, detail="AI model not available.")
        
        current_weather = WeatherAPI.get_current_weather(lat, lon)
        predicted_power_w = model.predict(current_weather)[0]
        predicted_power_mw_raw = max(0, predicted_power_w * 1000)
        DEMO_SCALING_FACTOR = 10 / 7047 
        predicted_power_mw = predicted_power_mw_raw * DEMO_SCALING_FACTOR

        # Perform Performance & Impact Calculations
        power_loss_mw = max(0, predicted_power_mw - latest_power_mw)
        power_loss_percent = (power_loss_mw / predicted_power_mw) * 100 if predicted_power_mw > 0 else 0
        now_kolkata = datetime.now(pytz.timezone('Asia/Kolkata'))
        daylight_hours_so_far = max(0, (now_kolkata - now_kolkata.replace(hour=6, minute=0)).total_seconds() / 3600)
        predicted_energy_mwh_today = predicted_power_mw * daylight_hours_so_far
        revenue_loss_inr = (max(0, predicted_energy_mwh_today - actual_energy_mwh_today) / 1000 / 1000) * price
        phones_charged_hourly = (predicted_power_w / 15.0) if predicted_power_w else 0
        ev_km_per_hour = ((predicted_power_w / 1000) * 6) if predicted_power_w else 0
        co2_avoided_grams_today = (predicted_power_w * daylight_hours_so_far / 1000) * 475.0

        # Get 7-Day Forecast
        forecast_data = []
        try:
            forecast_weather, _, _ = WeatherAPI.get_real_weather_forecast(city_name, 7)
            if forecast_weather is not None and not forecast_weather.empty:
                daily_predictions_w = model.predict(forecast_weather[['temperature', 'irradiance', 'humidity', 'cloud_cover']])
                forecast_weather['predicted_power_mw'] = [max(0, p * 50) for p in daily_predictions_w]
                forecast_data = forecast_weather[['date', 'predicted_power_mw']].to_dict(orient='records')
                for item in forecast_data: item['date'] = str(item['date'])
        except Exception as forecast_error:
            print(f"Could not generate 7-day forecast: {forecast_error}")

        return {
            "city": city_name, "live_metrics": latest_data,
            "live_power_trend": live_df[['timestamp_kolkata', 'power']].rename(columns={'timestamp_kolkata': 'time', 'power': 'actual'}).to_dict(orient='records'),
            "prediction": { "predicted_power_mw": predicted_power_mw },
            "performance": { "power_difference_mw": power_loss_mw, "percent_difference": power_loss_percent, "est_revenue_loss": revenue_loss_inr },
            "impact": { "phones_charged_per_hour": phones_charged_hourly, "ev_range_added_per_hour_km": ev_km_per_hour, "co2_avoided_grams_today": co2_avoided_grams_today },
            "forecast_7_day": forecast_data,
            "raw_readings": live_df.sort_values('created_at', ascending=False).to_dict(orient='records')
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-performance")
async def analyze_uploaded_performance(file: UploadFile = File(...)):
    """Accepts a CSV file upload, runs analysis, and returns the report."""
    try:
        # Analysis logic from enhanced_efficiency_page
        df = pd.read_csv(file.file)
        if 'panel_power' not in df.columns and 'panel_voltage' in df.columns and 'panel_current' in df.columns:
            df['panel_power'] = df['panel_voltage'] * df['panel_current']
        detector = EnhancedAnomalyDetector(contamination=0.1)
        data_with_anomalies = detector.detect_anomalies(df)
        panel_health_report = detector.analyze_panel_health(data_with_anomalies)
        return {
            "health_report": panel_health_report,
            "analyzed_data": data_with_anomalies.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.get("/api/sample-analysis")
async def get_sample_analysis():
    """Generates realistic sample data and returns a full analysis report."""
    try:
        # Logic from enhanced_efficiency_page's "Generate Sample Data" option
        df = SolarDataGenerator.generate_realistic_data(num_panels=10, days=30)
        detector = EnhancedAnomalyDetector(contamination=0.1)
        data_with_anomalies = detector.detect_anomalies(df)
        panel_health_report = detector.analyze_panel_health(data_with_anomalies)
        return {
            "health_report": panel_health_report,
            "analyzed_data": data_with_anomalies.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sample analysis: {str(e)}")

@app.post("/api/simulate-scenario")
async def run_simulation(request: SimulationRequest):
    """Accepts configuration parameters and returns the simulated annual output."""
    try:
        # Logic from simulator_page
        annual_output_kwh = simulate_solar_output(**request.model_dump())
        return {"annual_output_kwh": annual_output_kwh}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during simulation: {str(e)}")

@app.post("/api/retrain-model")
async def retrain_ai_model(request: RetrainRequest):
    """Retrains the AI model for a specified location."""
    try:
        # Logic from train_and_save_model function
        geolocator = Nominatim(user_agent="solar_model_trainer_api", timeout=10)
        location_data = geolocator.geocode(request.location)
        if not location_data:
            raise HTTPException(status_code=404, detail="Could not find location")
        lat, lon = location_data.latitude, location_data.longitude
        historical_weather = WeatherAPI.get_historical_weather(lat, lon)
        result = train_and_save_model(request.location, historical_weather)
        if result:
            load_model.cache_clear()
            return {"status": "success", "message": f"Model retrained for {request.location}"}
        else:
            raise HTTPException(status_code=500, detail="Model training failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))