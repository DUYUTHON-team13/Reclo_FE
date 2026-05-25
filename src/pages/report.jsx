import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dragIcon from "../assets/image/icon/Drag_Horizontal.png";
import heartIcon from "../assets/image/icon/Heart_01.png";
import infoIcon from "../assets/image/icon/Info.png";
import leafIcon from "../assets/image/icon/Leaf.png";
import { getClothes } from "../api/clothes";
import BottomNav from "../components/bottomNav.jsx";

const unwornItems = [
  { id: 1, title: "스투시 반팔티", category: "상의", season: "여름", size: "S", days: "47일" },
  { id: 2, title: "스투시 반팔티", category: "상의", season: "여름", size: "S", days: "47일" },
];

function Report() {
  const navigate = useNavigate();
  const [isUsageGuideOpen, setIsUsageGuideOpen] = useState(false);
  const [isCarbonGuideOpen, setIsCarbonGuideOpen] = useState(false);
  const [isUnwornGuideOpen, setIsUnwornGuideOpen] = useState(false);
  const [reportClothes, setReportClothes] = useState([]);
  const displayUnwornItems =
    reportClothes.length > 0
      ? reportClothes.filter((item) => item.unwornDays >= 30).slice(0, 2)
      : unwornItems;

  useEffect(() => {
    getClothes()
      .then((items) => {
        setReportClothes(items);
      })
      .catch((error) => {
        console.log("리포트 의류 정보 불러오기 실패:", error.message);
      });
  }, []);

  function openClothesInfo(item) {
    navigate("/clothes-info", { state: { ...item, from: "report" } });
  }

  function openStyling(item) {
    navigate("/styling", { state: item });
  }

  return (
    <main className="mobile-page report-page">
      <section className="phone-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <header className="closet-header report-header">
        <h1>리포트</h1>
      </header>

      <section className="report-usage-card">
        <div className="report-card-title">
          <h2>옷장 활용률</h2>
          <p>기존 아이템을 잘 사용하고 있어요</p>
        </div>

        <button
          className="usage-donut"
          type="button"
          aria-label="옷장 활용률 설명 보기"
          onClick={() => setIsUsageGuideOpen(true)}
        >
          <div>
            <strong>60%</strong>
            <span>활용도</span>
          </div>
        </button>
      </section>

      {isUsageGuideOpen && (
        <section
          className="carbon-guide-layer"
          role="button"
          tabIndex={0}
          aria-label="옷장 활용률 설명 닫기"
          onClick={() => setIsUsageGuideOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsUsageGuideOpen(false);
            }
          }}
        >
          <article className="carbon-guide-card" onClick={(event) => event.stopPropagation()}>
            <h2>옷장 활용률 기준</h2>
            <p>
              옷장 활용률은 전체 의류 중 30일 동안 실제로 활용한 의류의 비율이에요.
            </p>
            <p>
              계산 방식: 30일 동안 활용한 의류 수 ÷ 옷장 전체 의류 수 × 100
            </p>
            <p>
              예를 들어 옷장 전체 의류가 48벌이고, 30일 동안 29벌을 활용했다면 약 60%로 표시돼요.
            </p>
          </article>
        </section>
      )}

      <section className="report-stat-row" aria-label="옷장 통계">
        <article className="report-stat-card">
          <div className="report-stat-card__top">
            <span>옷장 아이템</span>
            <button
              className="report-stat-icon-button"
              type="button"
              aria-label="나의 옷장으로 이동"
              onClick={() => navigate("/closet")}
            >
              <img src={dragIcon} alt="" />
            </button>
          </div>
          <strong>48</strong>
        </article>
        <article className="report-stat-card">
          <div className="report-stat-card__top">
            <span>미착용 아이템</span>
            <button
              className="report-stat-icon-button"
              type="button"
              aria-label="미착용 아이템 설명 보기"
              onClick={() => setIsUnwornGuideOpen(true)}
            >
              <img src={infoIcon} alt="" />
            </button>
          </div>
          <strong>12</strong>
        </article>
      </section>

      {isUnwornGuideOpen && (
        <section
          className="carbon-guide-layer"
          role="button"
          tabIndex={0}
          aria-label="미착용 아이템 설명 닫기"
          onClick={() => setIsUnwornGuideOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsUnwornGuideOpen(false);
            }
          }}
        >
          <article className="carbon-guide-card" onClick={(event) => event.stopPropagation()}>
            <h2>미착용 아이템 기준</h2>
            <p>
              30일 기준으로 착용 기록이 없는 옷을 미착용 아이템으로 선정했어요.
            </p>
            <p>
              이 목록은 옷장에서 오래 기다리고 있는 옷을 다시 활용할 수 있도록 보여주는 영역이에요.
            </p>
          </article>
        </section>
      )}

      <section className="carbon-card">
        <div className="report-card-title">
          <h2>탄소절감량 추이</h2>
          <p>
            기존 의류 36벌을 재사용하여
            <br />새 의류 생산 기준 약 <strong>90kg CO₂e</strong>를 절감했어요
          </p>
        </div>
        <button
          className="carbon-card__leaf-button"
          type="button"
          aria-label="탄소절감량 계산 설명 보기"
          onClick={() => setIsCarbonGuideOpen(true)}
        >
          <img className="carbon-card__leaf" src={leafIcon} alt="" />
        </button>
      </section>

      {isCarbonGuideOpen && (
        <section
          className="carbon-guide-layer"
          role="button"
          tabIndex={0}
          aria-label="탄소절감량 설명 닫기"
          onClick={() => setIsCarbonGuideOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsCarbonGuideOpen(false);
            }
          }}
        >
          <article className="carbon-guide-card" onClick={(event) => event.stopPropagation()}>
            <h2>탄소절감량 계산 방식</h2>
            <p>
              탄소절감량 = 재사용한 의류 수 × 의류 1벌당 탄소배출량
            </p>
            <p>
              예시 기존 의류 재사용: 48벌 / 의류 1벌 생산 탄소배출: 2.5kg CO₂e
            </p>
            <strong>48 × 2.5 = 120</strong>
            <p>
              기존 옷을 계속 입음 = 새 옷 생산을 대체함
            </p>
            <p>
              즉, 약 120kg CO₂e 절감
            </p>
            <p>
              방식 1) “구매 회피(Avoided Purchase)” 모델을 사용했어요. 사용자가 기존 옷을 다시 활용하면 새 옷 구매를 줄였다고 보고, 따라서 생산 탄소 발생을 방지한 것으로 계산해요.
            </p>
            <p>
              기존 의류 48벌을 재사용하여 새 의류 생산 기준 약 120kg CO₂e를 절감했어요.
            </p>
          </article>
        </section>
      )}

      <section className="unworn-section">
        <div className="section-heading report-section-heading">
          <div>
            <h2>30일 내 미착용 아이템</h2>
            <p>옷장에서 기다리는 아이템이 많아요</p>
          </div>
        </div>

        <div className="report-item-grid">
          {displayUnwornItems.map((item) => (
            <article
              className="report-item-card"
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => openClothesInfo(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openClothesInfo(item);
                }
              }}
            >
              <div className="report-item-card__image">
                {item.image && <img src={item.image} alt="" />}
                <span>{item.days}</span>
              </div>
              <div className="report-item-card__body">
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {[item.category, item.colorName ?? item.color, item.season ?? item.size]
                      .filter(Boolean)
                      .join("   ")}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`${item.title} 좋아요`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <img src={heartIcon} alt="" />
                </button>
              </div>
              <div className="report-item-card__actions">
                <button
                  className="donate-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  기부하기
                </button>
                <button
                  className="style-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openStyling(item);
                  }}
                >
                  스타일링 하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

export default Report;
