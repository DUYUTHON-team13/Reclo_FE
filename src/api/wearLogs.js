import { apiFetch } from "./client";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function createWearLog({
  clothingIds,
  outfitId,
  wornDate = getTodayDateString(),
}) {
  const body = {
    clothingIds,
    wornDate,
  };

  if (outfitId !== undefined && outfitId !== null) {
    body.outfitId = outfitId;
  }

  return apiFetch("/api/wear-logs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
