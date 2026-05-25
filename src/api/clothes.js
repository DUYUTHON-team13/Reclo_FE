import { API_BASE_URL, API_TOKEN, USER_ID, apiFetch } from "./client";

const categoryLabelMap = {
  TOP: "상의",
  BOTTOM: "하의",
  OUTER: "아우터",
  SHOES: "신발",
};

const colorLabelMap = {
  BLACK: "검정",
  WHITE: "흰색",
  GRAY: "회색",
  NAVY: "남색",
  BLUE: "파랑",
  BROWN: "갈색",
  BEIGE: "베이지",
  RED: "빨강",
  PINK: "분홍",
  LIGHT_PINK: "연분홍",
  BURGUNDY: "버건디",
  YELLOW: "노랑",
  GREEN: "초록",
  OLIVE: "올리브",
  TEAL: "청록",
  MINT: "민트",
  PURPLE: "보라",
  ORANGE: "주황",
  CORAL: "코랄",
  SKY_BLUE: "하늘색",
  MULTI: "혼합색",
  OTHER: "기타",
};

const seasonLabelMap = {
  SPRING: "봄",
  SUMMER: "여름",
  FALL: "가을",
  WINTER: "겨울",
};

function toLabel(value, map) {
  return map[value] ?? value;
}

function mapClothingItem(item) {
  const seasons = item.seasons?.map((season) => toLabel(season, seasonLabelMap));

  return {
    id: item.id,
    title: item.name,
    image: item.imageUrl,
    category: toLabel(item.category, categoryLabelMap),
    apiCategory: item.category,
    shape: toOutfitShape(item.category),
    color: item.color,
    colorName: toLabel(item.color, colorLabelMap),
    style: item.style,
    seasons,
    apiSeasons: item.seasons,
    season: seasons?.[0],
    days: `${item.unwornDays ?? 0}일`,
    brand: item.brand,
    size: item.size,
    purchaseDate: item.purchasedAt,
    lastWornAt: item.lastWornAt,
    unwornDays: item.unwornDays,
    wearCount: item.wearCount,
    aiTagged: item.aiTagged,
  };
}

function toOutfitShape(slot) {
  if (slot === "BOTTOM") return "pants";
  if (slot === "OUTER") return "outer";
  if (slot === "SHOES") return "shoes";
  return "shirt";
}

function mapRecommendedOutfitItem(item) {
  return {
    id: item.clothingId,
    clothingId: item.clothingId,
    name: item.name,
    image: item.imageUrl,
    imageUrl: item.imageUrl,
    slot: item.slot,
    category: toLabel(item.slot, categoryLabelMap),
    shape: toOutfitShape(item.slot),
  };
}

function mapTodayRecommendation(data) {
  return {
    ...data,
    recommendationOrder: data.recommendationOrder,
    isCurrent: data.isCurrent,
    reason: data.reason,
    score: data.score,
    items: data.items?.map(mapRecommendedOutfitItem) ?? [],
  };
}

export async function getCurrentTodayRecommendation({
  latitude = 37.5665,
  longitude = 126.978,
} = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  const data = await apiFetch(`/outfits/recommendations/today/current?${params.toString()}`);

  return mapTodayRecommendation(data);
}

export async function getNextTodayRecommendation() {
  const data = await apiFetch("/outfits/recommendations/today/next", {
    method: "POST",
  });

  return mapTodayRecommendation(data);
}

export async function getClothes(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const data = await apiFetch(`/api/clothes${queryString ? `?${queryString}` : ""}`);

  return data.map(mapClothingItem);
}

export async function getClothing(clothingId) {
  const data = await apiFetch(`/api/clothes/${clothingId}`);

  return mapClothingItem(data);
}

export async function createClothing(item) {
  const data = await apiFetch("/api/clothes", {
    method: "POST",
    body: JSON.stringify(item),
  });

  return mapClothingItem(data);
}

export async function updateClothing(clothingId, item) {
  const data = await apiFetch(`/api/clothes/${clothingId}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });

  return mapClothingItem(data);
}

export async function deleteClothing(clothingId) {
  await apiFetch(`/api/clothes/${clothingId}`, {
    method: "DELETE",
  });
}

export async function uploadClothingImage(imageFile) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL이 설정되지 않았어요.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/api/clothes/images`, {
    method: "POST",
    headers: {
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      ...(USER_ID ? { "X-User-Id": USER_ID } : {}),
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error?.message ?? "이미지 업로드에 실패했어요.");
  }

  return {
    ...mapClothingItem(result.data),
    confidence: result.data.confidence,
    failureReason: result.data.failureReason,
  };
}
