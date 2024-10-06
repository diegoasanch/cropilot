export type ModelAnswer = {
  location: {
    latitude: number;
    longitude: number;
  };
  crop: string;
  date: string; // ISO 8601 format or specify Date if using Date objects
  language: string;
  stages: Stage[];
};

export type Stage = {
  stage: string;
  start_month: string; // Could be a number (1-12) or a string representing the month
  end_month: string; // Same as above
  optimal_conditions: OptimalConditions;
};

export type OptimalConditions = {
  T2M: string; // Temperature at 2 meters (°C)
  TS: string; // Earth Skin Temperature (°C)
  PRECTOTCORR: string; // Precipitation (mm/day)
  QV2M: string; // Specific Humidity at 2 meters (g/kg)
  WS2M: string; // Wind Speed at 2 meters (m/s)
  GWETTOP: string; // Surface Soil Wetness (1)
  GWETROOT: string; // Root Zone Soil Wetness (1)
  GWETPROF: string; // Profile Soil Moisture (1)
};
