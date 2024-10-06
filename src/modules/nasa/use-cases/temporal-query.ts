import { TGetWeatherPointDataParams } from "../infra/t-temporal-api.js";
import { TemporalApi } from "../infra/temporal-api.js";

export function queryTemporalData(temporalApi: TemporalApi) {
  return async (params: TGetWeatherPointDataParams) => {
    return temporalApi.getWeatherPointData(params);
  };
}
