import { apiFetch } from "./client";

export async function createDonation(clothingId) {
  return apiFetch("/api/donations", {
    method: "POST",
    body: JSON.stringify({ clothingId }),
  });
}
