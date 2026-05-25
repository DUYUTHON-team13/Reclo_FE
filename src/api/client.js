export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_TOKEN = import.meta.env.VITE_API_TOKEN;
export const USER_ID = import.meta.env.VITE_USER_ID ?? "1";

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL이 설정되지 않았어요.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      ...(USER_ID ? { "X-User-Id": USER_ID } : {}),
      ...options.headers,
    },
    ...options,
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.error?.message ?? "API 요청에 실패했어요.");
  }

  return result.data;
}
