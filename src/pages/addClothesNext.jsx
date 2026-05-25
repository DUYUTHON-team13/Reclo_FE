import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import closeIcon from "../assets/image/icon/곱표.png";
import { uploadClothingImage } from "../api/clothes";

const categoryLabelMap = {
  TOP: "상의",
  BOTTOM: "하의",
  OUTER: "아우터",
  SHOES: "신발",
};

const seasonLabelMap = {
  SPRING: "봄",
  SUMMER: "여름",
  FALL: "가을",
  WINTER: "겨울",
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
  YELLOW: "노랑",
  GREEN: "초록",
  PURPLE: "보라",
};

function toLabel(value, map, fallback) {
  return map[value] ?? value ?? fallback;
}

function AddClothesNext() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const previewImage = state?.previewImage ?? "";
  const imageFile = state?.imageFile ?? null;
  const [aiResult, setAiResult] = useState({
    imageUrl: "",
    category: "상의",
    color: "흰색",
    seasons: ["여름"],
  });
  const [isLoading, setIsLoading] = useState(Boolean(imageFile));

  useEffect(() => {
    if (!imageFile) return;

    setIsLoading(true);

    uploadClothingImage(imageFile)
      .then((data) => {
        setAiResult({
          imageUrl: data.image,
          category: toLabel(data.category, categoryLabelMap, "상의"),
          color: toLabel(data.color, colorLabelMap, "흰색"),
          seasons: (data.seasons?.length ? data.seasons : ["SUMMER"]).map((season) =>
            toLabel(season, seasonLabelMap, "여름")
          ),
          confidence: data.confidence,
          failureReason: data.failureReason,
        });
      })
      .catch((error) => {
        console.log("의류 이미지 업로드 API 실패:", error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [imageFile]);

  function goNext() {
    navigate("/add-clothes/info", {
      state: {
        previewImage,
        imageUrl: aiResult.imageUrl,
        category: aiResult.category,
        color: aiResult.color,
        seasons: aiResult.seasons,
      },
    });
  }

  return (
    <main className="mobile-page add-clothes-page add-ai-page">
      <section className="phone-status add-clothes-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <button
        className="add-clothes-back"
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate("/add-clothes")}
      >
        ←
      </button>

      <h1 className="add-clothes-title">
        AI가 정보를
        <br />
        확인했어요
      </h1>

      <section className="ai-check-preview">
        {previewImage && (
          <img
            className="upload-preview-image"
            src={previewImage}
            alt="업로드한 옷 미리보기"
          />
        )}
        <button className="upload-clear-button" type="button" aria-label="사진 삭제">
          <img src={closeIcon} alt="" />
        </button>
      </section>

      <section className="ai-result-card">
        <p>
          <span>종류</span>
          <strong>{isLoading ? "확인 중" : aiResult.category}</strong>
        </p>
        <p>
          <span>계절</span>
          <strong>{isLoading ? "확인 중" : aiResult.seasons.join(", ")}</strong>
        </p>
        <p>
          <span>색상</span>
          <strong>{isLoading ? "확인 중" : aiResult.color}</strong>
        </p>
      </section>

      <div className="add-ai-actions">
        <button
          className="ghost-button add-ai-edit"
          type="button"
          onClick={() =>
            navigate("/change", {
              state: {
                previewImage,
                category: aiResult.category,
                color: aiResult.color,
                seasons: aiResult.seasons,
              },
            })
          }
        >
          수정이 필요해요
        </button>
        <button
          className="primary-button add-ai-next"
          type="button"
          disabled={isLoading}
          onClick={goNext}
        >
          다음
        </button>
      </div>
    </main>
  );
}

export default AddClothesNext;
