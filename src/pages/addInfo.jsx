import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import closeIcon from "../assets/image/icon/곱표.png";
import { createClothing } from "../api/clothes";

const categoryMap = {
  상의: "TOP",
  하의: "BOTTOM",
  아우터: "OUTER",
  신발: "SHOES",
};

const seasonMap = {
  봄: "SPRING",
  여름: "SUMMER",
  가을: "FALL",
  겨울: "WINTER",
};

const colorMap = {
  검정: "BLACK",
  검은색: "BLACK",
  흰색: "WHITE",
  하얀색: "WHITE",
  회색: "GRAY",
  파랑: "BLUE",
  파란색: "BLUE",
  남색: "NAVY",
  갈색: "BROWN",
  베이지: "BEIGE",
  빨강: "RED",
  빨간색: "RED",
  분홍: "PINK",
  노랑: "YELLOW",
  초록: "GREEN",
  보라: "PURPLE",
};

function normalizeValue(value, map, fallback) {
  return map[value] ?? value ?? fallback;
}

function normalizePurchaseDate(value) {
  const yearMatch = value.match(/(\d{2,4})/);

  if (!yearMatch) {
    return new Date().toISOString().slice(0, 10);
  }

  const rawYear = yearMatch[1];
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;

  return `${year}-07-01`;
}

function AddInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const previewImage = state?.previewImage ?? "";
  const imageUrl = state?.imageUrl ?? "";
  const category = state?.category ?? "상의";
  const color = state?.color ?? "흰색";
  const seasons = state?.seasons ?? ["여름"];
  const tags = [category, "S", color, ...seasons];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    purchaseDate: "",
    size: "",
    brand: "",
  });

  const isComplete = Object.values(form).every((value) => value.trim() !== "");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  async function completeRegister() {
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);

    const requestBody = {
      name: form.name,
      imageUrl: imageUrl || previewImage || "https://cdn.example.com/clothes/1.jpg",
      category: normalizeValue(category, categoryMap, "TOP"),
      seasons: seasons.map((season) => normalizeValue(season, seasonMap, "SUMMER")),
      color: normalizeValue(color, colorMap, "WHITE"),
      style: "CASUAL",
      purchasedAt: normalizePurchaseDate(form.purchaseDate),
      brand: form.brand,
      size: form.size,
    };

    const fallbackItem = {
      id: Date.now(),
      title: form.name,
      category,
      days: "0일",
      season: seasons[0] ?? "여름",
      seasons,
      size: form.size,
      color,
      colorName: color,
      brand: form.brand,
      purchaseDate: form.purchaseDate,
      image: imageUrl || previewImage,
    };

    try {
      await createClothing(requestBody);
    } catch (error) {
      console.log("의류 등록 API 실패:", error.message);

      const savedItems = JSON.parse(localStorage.getItem("closetItems") ?? "[]");
      localStorage.setItem("closetItems", JSON.stringify([fallbackItem, ...savedItems]));
    } finally {
      setIsSubmitting(false);
    }

    navigate("/closet", {
      state: {
        toast: `${category} 1개 등록이 완료됐어요`,
      },
    });
  }

  return (
    <main className="mobile-page add-clothes-page add-info-page">
      <section className="phone-status add-clothes-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <button
        className="add-clothes-back"
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate("/add-clothes/next", { state: { previewImage } })}
      >
        ←
      </button>

      <h1 className="add-clothes-title">
        AI가 정보를
        <br />
        확인했어요
      </h1>

      <section className="info-preview-image">
        {previewImage && (
          <img
            className="upload-preview-image"
            src={previewImage}
            alt="업로드한 옷 미리보기"
          />
        )}
      </section>

      <section className="info-tag-row" aria-label="AI 확인 태그">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </section>

      <form className="item-info-form">
        <label>
          아이템 이름
          <div>
            <input
              name="name"
              value={form.name}
              placeholder="이름을 입력해주세요"
              onChange={handleChange}
            />
            <img src={closeIcon} alt="" />
          </div>
        </label>

        <label>
          구매 시기
          <div>
            <input
              name="purchaseDate"
              value={form.purchaseDate}
              placeholder="구매 시기를 입력하세요 (ex. 24년 구매)"
              onChange={handleChange}
            />
            <img src={closeIcon} alt="" />
          </div>
        </label>

        <label>
          사이즈
          <div>
            <input
              name="size"
              value={form.size}
              placeholder="사이즈를 입력해주세요 (ex. S)"
              onChange={handleChange}
            />
            <img src={closeIcon} alt="" />
          </div>
        </label>

        <label>
          브랜드
          <div>
            <input
              name="brand"
              value={form.brand}
              placeholder="제품 브랜드를 입력하세요 (ex. 스투시)"
              onChange={handleChange}
            />
            <img src={closeIcon} alt="" />
          </div>
        </label>
      </form>

      <div className="add-info-actions">
        <button
          className="ghost-button add-info-other"
          type="button"
          onClick={() => navigate("/add-clothes")}
        >
          다른 제품 등록하기
        </button>
        <button
          className={`primary-button add-info-next ${isComplete ? "is-complete" : ""}`}
          type="button"
          disabled={!isComplete || isSubmitting}
          onClick={completeRegister}
        >
          {isSubmitting ? "등록 중" : isComplete ? "완료" : "다음"}
        </button>
      </div>

      <div className="home-indicator add-home-indicator" />
    </main>
  );
}

export default AddInfo;
