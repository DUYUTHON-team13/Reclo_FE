import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import heartIcon from "../assets/image/icon/Heart_01.png";
import { createRecommendationWithItem } from "../api/clothes";
import { createWearLog } from "../api/wearLogs";

const outfitItems = [
  { label: "상의", type: "shirt", color: "#cbe6fb" },
  { label: "아우터", type: "outer", color: "#7c5f6d" },
  { label: "하의", type: "pants", color: "#6f632d" },
  { label: "신발", type: "shoes", color: "#111111" },
];

const weatherLatitude = import.meta.env.VITE_WEATHER_LATITUDE ?? 37.5665;
const weatherLongitude = import.meta.env.VITE_WEATHER_LONGITUDE ?? 126.978;

function Styling() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const stylingCarouselRef = useRef(null);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationPages, setRecommendationPages] = useState([]);
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);
  const [isSubmittingWearLog, setIsSubmittingWearLog] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timerId;
    const clothingId = state?.clothingId ?? state?.id;

    setIsComplete(false);
    setRecommendation(null);
    setRecommendationPages([]);
    setActiveRecommendationIndex(0);

    async function loadRecommendation() {
      if (!clothingId) {
        timerId = window.setTimeout(() => {
          if (isMounted) setIsComplete(true);
        }, 1200);
        return;
      }

      try {
        const data = await createRecommendationWithItem({
          clothingId,
          latitude: weatherLatitude,
          longitude: weatherLongitude,
        });

        if (isMounted) {
          setRecommendation(data);
          setRecommendationPages([data]);
        }
      } catch (error) {
        console.log("선택 옷 포함 추천 코디 생성 실패:", error.message);
      } finally {
        if (isMounted) {
          setIsComplete(true);
        }
      }
    }

    loadRecommendation();

    return () => {
      isMounted = false;
      window.clearTimeout(timerId);
    };
  }, [state]);

  function mapOutfitItems(items) {
    return items?.length > 0
      ? items.map((item) => ({
          label: item.name,
          type: item.shape,
          image: item.image,
          color: "#e5e5e5",
        }))
      : outfitItems;
  }

  async function handleStylingScroll(event) {
    const { clientWidth, scrollLeft } = event.currentTarget;
    const nextIndex = Math.round(scrollLeft / clientWidth);
    const nextRecommendation = recommendationPages[nextIndex];

    if (nextRecommendation && nextIndex !== activeRecommendationIndex) {
      setActiveRecommendationIndex(nextIndex);
      setRecommendation(nextRecommendation);
    }
  }

  async function wearStylingOutfit() {
    const clothingIds =
      recommendation?.items?.map((item) => item.clothingId ?? item.id) ??
      (state?.id ? [state.id] : []);

    if (isSubmittingWearLog || clothingIds.length === 0) return;

    setIsSubmittingWearLog(true);

    try {
      await createWearLog({
        clothingIds,
        outfitId: recommendation?.id,
      });

      navigate("/home", {
        state: {
          toast: "오늘 입은 옷 업로드 완료",
        },
      });
    } catch (error) {
      console.log("스타일링 착용 등록 실패:", error.message);
    } finally {
      setIsSubmittingWearLog(false);
    }
  }

  return (
    <main className="mobile-page styling-page">
      <section className="phone-status styling-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <button
        className="add-clothes-back styling-back"
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
      >
        ←
      </button>

      {!isComplete ? (
        <section className="styling-loading">
          <h1>
            AI가 스타일링을
            <br />
            만들고 있어요
          </h1>

          <div className="styling-loading-dots" aria-label="로딩 중">
            <span className="active" />
            <span />
            <span />
          </div>
        </section>
      ) : (
        <section className="styling-result">
          <h1>
            AI가 스타일링을
            <br />
            완성했어요
          </h1>

          <div className="styling-result-title">
            <strong>스타일링 {recommendation?.recommendationOrder ?? 1}</strong>
            <button type="button" aria-label="스타일링 좋아요">
              <img src={heartIcon} alt="" />
            </button>
          </div>

          <section
            className="styling-carousel"
            ref={stylingCarouselRef}
            onScroll={handleStylingScroll}
          >
            {(recommendationPages.length > 0
              ? recommendationPages
              : [{ id: "fallback", items: [] }]
            ).map((page, pageIndex) => (
              <div className="styling-carousel-page" key={page.id ?? pageIndex}>
                <div className="styling-outfit-grid">
                  {mapOutfitItems(page.items).map((item, index) => (
                    <article className="styling-outfit-item" key={`${item.label}-${index}`}>
                      <div className="styling-outfit-image">
                        {item.image ? (
                          <img className="styling-outfit-photo" src={item.image} alt="" />
                        ) : (
                          <div
                            className={`styling-clothes-shape styling-clothes-shape--${item.type}`}
                            style={{ "--item-color": item.color }}
                          />
                        )}
                      </div>
                      <p>{item.label}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div className="styling-page-dots" aria-hidden="true">
            {(recommendationPages.length > 0 ? recommendationPages : [null]).map((_, index) => (
              <span
                className={index === activeRecommendationIndex ? "active" : ""}
                key={index}
              />
            ))}
          </div>

          {state?.title && (
            <p className="styling-source">선택한 옷: {state.title}</p>
          )}

          {recommendation?.reason && (
            <p className="styling-source">{recommendation.reason}</p>
          )}

          <div className="styling-actions">
            <button className="ghost-button" type="button" onClick={() => navigate(-1)}>
              나가기
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={isSubmittingWearLog}
              onClick={wearStylingOutfit}
            >
              {isSubmittingWearLog ? "등록 중..." : "착용하기"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Styling;
