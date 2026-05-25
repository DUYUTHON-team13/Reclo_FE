import { apiFetch } from "./client";

export function getCurrentWeather({
  latitude = 37.5665,
  longitude = 126.978,
} = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  return apiFetch(`/weather/current?${params.toString()}`);
}
