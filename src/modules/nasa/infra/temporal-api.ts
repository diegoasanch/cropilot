import dayjs from "dayjs";
import { TClimateData, TTimeSeriesData } from "./t-temporal-api.js";

interface FilterCriteria {
  year?: string;
  month?: string;
  day?: string;
}

export class NasaApi {
  constructor(private readonly baseUrl: string) {}

  private dateFormat = "YYYYMMDD";

  private parameterNames: { [key: string]: string } = {
    T2M: "Temperature at 2 meters (°C)",
    TS: "Earth Skin Temperature (°C)",
    PRECTOTCORR: "Precipitation (mm/day)",
    QV2M: "Specific Humidity at 2 meters (g/kg)",
    WS2M: "Wind Speed at 2 meters (m/s)",
    GWETTOP: "Surface Soil Wetness (1)",
    GWETROOT: "Root Zone Soil Wetness (1)",
    GWETPROF: "Profile Soil Moisture (1)",
  };

  public getCommonName(key: string): string {
    return this.parameterNames[key] ?? "Unknown parameter";
  }

  public async getWeatherPointData(
    params: string[],
    latitude: number,
    longitude: number,
    start: Date,
    end: Date,
    interval: "daily"
  ) {
    try {
      const searchParams = new URLSearchParams({
        params: params.join(","),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        start: dayjs(start).format(this.dateFormat),
        end: dayjs(end).format(this.dateFormat),
      });

      const url = `${
        this.baseUrl
      }/temporal/${interval}/point?${searchParams.toString()}`;

      const response = await fetch(url);
      const json = await response.json();

      return json as TClimateData;
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  /**
   * Filters time series data based on year, month, or specific day using a FilterCriteria object.
   * @param data - The time series data to filter.
   * @param criteria - The FilterCriteria object containing year, month, and/or day.
   * @returns A filtered TimeSeriesData object based on the provided criteria.
   */
  public filterTimeSeries(
    data: TTimeSeriesData,
    criteria: FilterCriteria
  ): TTimeSeriesData {
    const filteredData: TTimeSeriesData = {};

    for (const date in data) {
      const dateYear = date.substring(0, 4); // Extract the year (first 4 characters)
      const dateMonth = date.substring(4, 6); // Extract the month (next 2 characters)
      const dateDay = date.substring(6, 8); // Extract the day (last 2 characters)

      const matchesYear = !criteria.year || dateYear === criteria.year;
      const matchesMonth = !criteria.month || dateMonth === criteria.month;
      const matchesDay = !criteria.day || dateDay === criteria.day;

      // Simplified condition where all must match if provided
      if (matchesYear && matchesMonth && matchesDay) {
        filteredData[date] = data[date];
      }
    }

    return filteredData;
  }
}
