export type TTimeSeriesData = {
  [date: string]: number; // key is the date, value is the measurement for that parameter
};

export type TClimateParameters = {
  T2M: TTimeSeriesData; // Temperature at 2 meters (°C)
  TS: TTimeSeriesData; // Earth Skin Temperature (°C)
  PRECTOTCORR: TTimeSeriesData; // Precipitation (mm/day)
  QV2M: TTimeSeriesData; // Specific Humidity at 2 meters (g/kg)
  WS2M: TTimeSeriesData; // Wind Speed at 2 meters (m/s)
  GWETTOP: TTimeSeriesData; // Surface Soil Wetness (1)
  GWETROOT: TTimeSeriesData; // Root Zone Soil Wetness (1)
  GWETPROF: TTimeSeriesData; // Profile Soil Moisture (1)
};

export type TClimateData = {
  type: string; // Feature type, e.g., "Feature"
  geometry: {
    type: string; // Geometry type, e.g., "Point"
    coordinates: [number, number, number]; // Longitude, Latitude, and Elevation
  };
  properties: {
    parameter: TClimateParameters; // Contains all the time series data for the parameters
  };
  header: {
    title: string; // Title of the dataset
    api: {
      version: string; // API version
      name: string; // API name
    };
    sources: string[]; // Data sources
    fill_value: number; // Fill value for missing data
    start: string; // Start date for the time series
    end: string; // End date for the time series
  };
  messages: string[]; // Any messages associated with the data retrieval
};

export type TGetWeatherPointDataParams = {
  parameters: (keyof TClimateParameters)[];
  latitude: number;
  longitude: number;
  start: Date;
  end: Date;
  interval: "daily";
};
