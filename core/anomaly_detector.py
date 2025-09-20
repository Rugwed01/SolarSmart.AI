# File: core/anomaly_detector.py

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd

class EnhancedAnomalyDetector:
    """Enhanced anomaly detection with multiple methods"""
    
    # FIX: Correctly indented __init__ method
    def __init__(self, contamination=0.1):
        self.contamination = contamination
        self.detector = IsolationForest(contamination=contamination, random_state=42)
        self.scaler = StandardScaler()
        
    # FIX: Correctly indented detect_anomalies method
    def detect_anomalies(self, data):
        """Detect anomalies using multiple features"""
        features = ['energy_output', 'panel_voltage', 'panel_current', 'panel_power']
        available_features = [f for f in features if f in data.columns]
        
        if len(available_features) < 2:
            print("Warning: Insufficient features for anomaly detection.")
            return data
        
        feature_data = self.scaler.fit_transform(data[available_features].fillna(0))
        self.detector.fit(feature_data)
        
        anomalies = self.detector.predict(feature_data)
        anomaly_scores = self.detector.score_samples(feature_data)
        
        data_copy = data.copy()
        data_copy['anomaly'] = anomalies
        data_copy['anomaly_score'] = anomaly_scores
        data_copy['is_anomaly'] = anomalies == -1
        
        return data_copy
    
    # FIX: Correctly indented analyze_panel_health method
    def analyze_panel_health(self, data):
        """Analyze individual panel health"""
        panel_health = {}
        
        if 'is_anomaly' not in data.columns:
            data = self.detect_anomalies(data)

        if 'is_anomaly' not in data.columns:
            return {}

        for panel_id in data['panel_id'].unique():
            panel_data = data[data['panel_id'] == panel_id]
            
            anomaly_rate = (panel_data['is_anomaly'].sum() / len(panel_data)) * 100 if len(panel_data) > 0 else 0
            
            if anomaly_rate > 15:
                health_status = "Critical"
                priority = 1
            elif anomaly_rate > 8:
                health_status = "Poor"
                priority = 2
            elif anomaly_rate > 3:
                health_status = "Fair"
                priority = 3
            else:
                health_status = "Good"
                priority = 4
            
            panel_health[panel_id] = {
                'health_status': health_status,
                'anomaly_rate': anomaly_rate,
                'avg_output': panel_data['energy_output'].mean(),
                'output_stability': panel_data['energy_output'].std(),
                'voltage_stability': panel_data['panel_voltage'].std(),
                'priority': priority,
                'total_readings': len(panel_data),
                'anomaly_count': panel_data['is_anomaly'].sum()
            }
        
        return panel_health