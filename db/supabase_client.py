# File: db/supabase_client.py

import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from cachetools import cached, TTLCache

# --- Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# --- Supabase Connection ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Successfully connected to Supabase client.")
except Exception as e:
    logger.error(f"Error initializing Supabase client: {e}")
    supabase = None

# Create a cache that expires every 5 seconds
supabase_cache = TTLCache(maxsize=10, ttl=5)

@cached(cache=supabase_cache)
def fetch_supabase_data(table_name: str, limit: int = 200):
    """Fetches the last N rows of data from the Supabase table."""
    if supabase is None:
        logger.error("Supabase client is not initialized. Cannot fetch data.")
        return pd.DataFrame()
        
    try:
        response = supabase.table(table_name).select("*").order("created_at", desc=True).limit(limit).execute()
        
        if response.data:
            df = pd.DataFrame(response.data)
            df['created_at'] = pd.to_datetime(df['created_at'])
            df = df.sort_values('created_at').reset_index(drop=True)
            return df
        return pd.DataFrame()
        
    except Exception as e:
        logger.error(f"Error fetching data from Supabase: {e}")
        return pd.DataFrame()