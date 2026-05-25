import { apiFetch } from "./client";

export async function getCarbonSavingsReport() {
  return apiFetch("/api/reports/carbon-savings");
}

export async function getWeeklyCarbonSavingsSummary() {
  return apiFetch("/api/reports/carbon-savings/weekly-summary");
}
