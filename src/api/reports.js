import { apiFetch } from "./client";

export async function getCarbonSavingsReport() {
  return apiFetch("/api/reports/carbon-savings");
}
