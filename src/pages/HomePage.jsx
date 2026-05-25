import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import heartIcon from "../assets/image/icon/Heart_01.png";
import toastIcon from "../assets/image/icon/Frame 2147227879.png";
import {
  getClothes,
  getCurrentTodayRecommendation,
  getNextTodayRecommendation,
} from "../api/clothes";
import { getWeeklyCarbonSavingsSummary } from "../api/reports";
import { getCurrentWeather } from "../api/weather";
import { createWearLog } from "../api/wearLogs";
import BottomNav from "../components/bottomNav.jsx";
import ClothingCard from "../components/clothingCard.jsx";

const recommendedItems = [
  { name: "상의", color: "#cbe6fb", shape: "shirt" },
  { name: "하의", color: "#73612e", shape: "pants" },
  { name: "아우터", color: "#6b5363", shape: "outer" },
];

const unwornClothes = [
  { id: 1, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
  { id: 2, title: "아디다스 반바지", category: "하의", days: "36일", season: "여름", size: "M" },
];

const weatherLatitude = import.meta.env.VITE_WEATHER_LATITUDE ?? 37.5665;
const weatherLongitude = import.meta.env.VITE_WEATHER_LONGITUDE ?? 126.978;

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [likedOutfit, setLikedOutfit] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [homeClothes, setHomeClothes] = useState([]);
  const [todayRecommendation, setTodayRecommendation] = useState(null);
  const [recommendedOutfitItems, setRecommendedOutfitItems] = useState([]);
  const [isLoadingNextRecommendation, setIsLoadingNextRecommendation] = useState(false);
  const [isSubmittingWearLog, setIsSubmittingWearLog] = useState(false);
  const [weeklyCarbonSummary, setWeeklyCarbonSummary] = useState(null);
  const [toastMessage, setToastMessage] = useState(location.state?.toast ?? "");
  const displayRecommendedItems =
    recommendedOutfitItems.length > 0 ? recommendedOutfitItems : recommendedItems;
  const displayClothes =
    homeClothes.length > 0
      ? homeClothes.filter((item) => item.unwornDays >= 30).slice(0, 2)
      : unwornClothes;

  useEffect(() => {
    getCurrentWeather({
      latitude: weatherLatitude,
      longitude: weatherLongitude,
    })
      .then((data) => {
        setTemperature(Math.round(data.temperature));
      })
      .catch((error) => {
        console.log("날씨 불러오기 실패:", error.message);
      });

    getCurrentTodayRecommendation({
      latitude: weatherLatitude,
      longitude: weatherLongitude,
    })
      .then((recommendation) => {
        setTodayRecommendation(recommendation);
        setRecommendedOutfitItems(recommendation.items);
      })
      .catch((error) => {
        console.log("AI recommendation load failed:", error.message);
      });

    getClothes()
      .then((items) => {
        setHomeClothes(items);
      })
      .catch((error) => {
        console.log("홈 의류 정보 불러오기 실패:", error.message);
      });

    getWeeklyCarbonSavingsSummary()
      .then((summary) => {
        setWeeklyCarbonSummary(summary);
      })
      .catch((error) => {
        console.log("주간 탄소 절감 요약 불러오기 실패:", error.message);
      });
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  function openClothesInfo(item) {
    navigate("/clothes-info", { state: { ...item, from: "home" } });
  }

  function openStyling(item) {
    navigate("/styling", { state: item });
  }

  async function showNextRecommendation() {
    if (isLoadingNextRecommendation) return;

    setIsLoadingNextRecommendation(true);

    try {
      const recommendation = await getNextTodayRecommendation();
      setTodayRecommendation(recommendation);
      setRecommendedOutfitItems(recommendation.items);
      setLikedOutfit(false);
    } catch (error) {
      console.log("다음 추천 코디 불러오기 실패:", error.message);
    } finally {
      setIsLoadingNextRecommendation(false);
    }
  }

  async function wearRecommendedOutfit() {
    if (isSubmittingWearLog || recommendedOutfitItems.length === 0) return;

    setIsSubmittingWearLog(true);

    try {
      await createWearLog({
        clothingIds: recommendedOutfitItems.map((item) => item.clothingId ?? item.id),
        outfitId: todayRecommendation?.id,
      });
      setToastMessage("오늘 입은 옷 업로드 완료");
    } catch (error) {
      console.log("추천 코디 착용 등록 실패:", error.message);
    } finally {
      setIsSubmittingWearLog(false);
    }
  }

  return (
    <main className="mobile-page home-page">
      <section className="phone-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <header className="home-header">
        <h1>홈</h1>
      </header>

      <section className="ai-card">
        <div className="ai-card__top">
          <div>
            <h2>오늘의 AI추천 스타일링</h2>
            <p>날씨에 맞는 옷을 추천드릴게요</p>
          </div>
          <button
            className={`like-button ${likedOutfit ? "is-liked" : ""}`}
            type="button"
            aria-label="좋아요"
            onClick={() => setLikedOutfit(!likedOutfit)}
          >
            <img src={heartIcon} alt="" />
          </button>
          <span className="weather-chip">
            {temperature !== null ? `${temperature}°C` : "--°C"}
          </span>
        </div>

        <div className="outfit-row">
          {displayRecommendedItems.map((item) => (
            <article className="outfit-item" key={item.name}>
              <div
                className={`outfit-visual outfit-visual--${item.shape} ${
                  item.image ? "has-image" : ""
                }`}
                style={{
                  background: item.image
                    ? `url(${item.image}) center / cover no-repeat`
                    : item.color,
                }}
              />
              <p>{item.name}</p>
            </article>
          ))}
        </div>

        <div className="dot-row" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>

        <div className="ai-card__actions">
          <button
            className="ghost-button"
            type="button"
            onClick={showNextRecommendation}
            disabled={isLoadingNextRecommendation}
          >
            {isLoadingNextRecommendation ? "불러오는 중..." : "다른 스타일링 보기"}
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={isSubmittingWearLog || recommendedOutfitItems.length === 0}
            onClick={wearRecommendedOutfit}
          >
            {isSubmittingWearLog ? "등록 중..." : "착용하기"}
          </button>
        </div>
      </section>

      <section className="question-card">
        <div>
          <h2>오늘은 어떤 옷을 입었나요?</h2>
          <p>오늘 입은 옷 3초면 등록완료!</p>
        </div>
        <Link to="/today-upload">3초만에 등록하기 &gt;</Link>
      </section>

      <section className="section-heading">
        <div>
          <h2>잘 입지 않는 옷들</h2>
          <p>옷들이 기다리고 있어요</p>
        </div>
        <Link to="/closet" state={{ sort: "unworn" }}>
          더보기
        </Link>
      </section>

      <section className="clothing-grid">
        {displayClothes.map((item) => (
          <ClothingCard
            key={item.id}
            title={item.title}
            category={item.category}
            colorName={item.colorName ?? item.color}
            season={item.season}
            seasons={item.seasons}
            days={item.days}
            image={item.image}
            onOpen={() => openClothesInfo(item)}
            onStyle={() => openStyling(item)}
          />
        ))}
      </section>

      <Link className="saving-banner" to="/report">
        일주일 동안 탄소배출량이 {weeklyCarbonSummary?.savedKgCo2 ?? 2.3}kg 감소했어요
        <span>&gt;</span>
      </Link>

      <Link className="floating-add" to="/add-clothes" aria-label="의류 업로드">
        <span>＋</span>
        <p>아이템 업로드</p>
      </Link>

      {toastMessage && (
        <div className="closet-toast" role="status">
          <img className="closet-toast__icon" src={toastIcon} alt="" />
          {toastMessage}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

export default HomePage;
