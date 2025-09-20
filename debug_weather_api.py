# File: debug_weather_api.py

import requests
import traceback # We will use this to get very detailed error messages
from datetime import date, timedelta

# --- Configuration ---
# These are the exact details for the failing API call for Nagpur
API_URL = "https://archive-api.open-meteo.com/v1/archive"
LATITUDE = 21.1498
LONGITUDE = 79.0821

# Calculate dates for the last 180 days
end_date = date.today()
start_date = end_date - timedelta(days=180)

PARAMS = {
    "latitude": LATITUDE,
    "longitude": LONGITUDE,
    "start_date": start_date.strftime('%Y-%m-%d'),
    "end_date": end_date.strftime('%Y-%m-%d'),
    "hourly": "temperature_2m,relative_humidity_2m,shortwave_radiation,cloud_cover",
    "timezone": "auto"
}

print("--- Starting Weather API Connection Test ---")
print(f"Attempting to connect to: {API_URL}")
print(f"Requesting data for Nagpur from {PARAMS['start_date']} to {PARAMS['end_date']}")

try:
    # Making the request with a 30-second timeout
    response = requests.get(API_URL, params=PARAMS, timeout=30)
    
    print(f"\nSUCCESS! Received a response.")
    print(f"HTTP Status Code: {response.status_code}")
    
    # This will raise an error for bad responses (like 4xx client errors or 5xx server errors)
    response.raise_for_status() 
    
    # Print a snippet of the data to confirm it's valid
    data = response.json()
    print("Successfully parsed JSON response.")
    print("Response snippet:")
    # Print the first 500 characters of the response
    print(str(data)[:500] + "...")

except Exception as e:
    print("\n--- ERROR! The connection failed. ---")
    print(f"An exception of type '{type(e).__name__}' occurred.")
    print("This is the detailed error information we need:")
    
    # This will print the full, detailed error traceback
    traceback.print_exc()

print("\n--- Test Finished ---")