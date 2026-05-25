import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heartIcon from "../assets/image/icon/Heart_01.png";
import searchIcon from "../assets/image/icon/Search_Magnifying_Glass.png";
import backIcon from "../assets/image/icon/돌아가기.png";
import { getClothes } from "../api/clothes";
import { createWearLog } from "../api/wearLogs";

const todayItems = [
  {
    id: 1,
    title: "흰색 원피스",
    category: "상의",
    color: "흰색",
    season: "여름",
    days: "0일",
    shape: "dress",
  },
  {
    id: 2,
    title: "블루 캐미솔",
    category: "상의",
    color: "파란색",
    season: "여름",
    days: "1일",
    shape: "sleeveless",
  },
  {
    id: 3,
    title: "꽃무늬 반팔티",
    category: "상의",
    color: "흰색",
    season: "여름",
    days: "4일",
    shape: "flowerTee",
  },
  {
    id: 4,
    title: "줄무늬 가디건",
    category: "상의",
    color: "검정색",
    season: "가을",
    days: "13일",
    shape: "cardigan",
  },
];

function getItemShape(item) {
  if (item.shape) return item.shape;
  if (item.apiCategory === "BOTTOM" || item.category === "하의") return "pants";
  if (item.apiCategory === "OUTER" || item.category === "아우터") return "outer";
  if (item.apiCategory === "SHOES" || item.category === "신발") return "shoes";
  return "shirt";
}

function TodayUpload() {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isSubmittingWearLog, setIsSubmittingWearLog] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const hasSelectedItems = selectedIds.length > 0;
  const displayItems = clothes.length > 0 ? clothes : todayItems;

  const filters = useMemo(() => {
    const countByCategory = displayItems.reduce((counts, item) => {
      if (!item.category) return counts;

      return {
        ...counts,
        [item.category]: (counts[item.category] ?? 0) + 1,
      };
    }, {});

    return [
      `All ${displayItems.length}`,
      ...Object.entries(countByCategory).map(([category, count]) => `${category} ${count}`),
    ];
  }, [displayItems]);

  const filteredItems = useMemo(() => {
    const filterName = activeFilter.split(" ").slice(0, -1).join(" ");
    const keyword = searchKeyword.trim().toLowerCase();

    return displayItems.filter((item) => {
      const matchesFilter =
        activeFilter === "All" || activeFilter.startsWith("All ") || item.category === filterName;
      const itemText = [item.title, item.category, item.colorName, item.color, item.season]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesKeyword = !keyword || itemText.includes(keyword);

      return matchesFilter && matchesKeyword;
    });
  }, [activeFilter, displayItems, searchKeyword]);

  const selectedItems = displayItems.filter((item) => selectedIds.includes(item.id));

  useEffect(() => {
    getClothes()
      .then((items) => {
        setClothes(items);
      })
      .catch((error) => {
        console.log("오늘 입은 옷 목록 불러오기 실패:", error.message);
      });
  }, []);

  function toggleItem(id) {
    setSubmitError("");
    setSelectedIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((selectedId) => selectedId !== id)
        : [...prevIds, id]
    );
  }

  async function completeTodayLook() {
    if (!hasSelectedItems || isSubmittingWearLog) return;

    if (!isConfirmStep) {
      setSubmitError("");
      setIsConfirmStep(true);
      return;
    }

    setIsSubmittingWearLog(true);
    setSubmitError("");

    try {
      await createWearLog({ clothingIds: selectedIds });

      navigate("/home", {
        state: {
          toast: "오늘 입은 옷 등록 완료",
        },
      });
    } catch (error) {
      console.log("착용 의류 등록 실패:", error.message);

      if (error.message?.includes("동일 날짜에 이미 착용 기록이 존재합니다")) {
        navigate("/home");
        return;
      }

      setSubmitError(error.message ?? "등록에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmittingWearLog(false);
    }
  }

  return (
    <main className="mobile-page today-upload-page">
      <section className="phone-status today-upload-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <Link className="today-upload-back" to="/home" aria-label="뒤로가기">
        <img src={backIcon} alt="뒤로가기" />
      </Link>

      {isConfirmStep ? (
        <section className="today-selected-step">
          <h1 className="today-upload-title">
            오늘 입은 코디는
            <br />
            어떤건가요?
          </h1>

          <section className="today-selected-grid">
            {selectedItems.map((item) => (
              <article className="today-selected-card" key={item.id}>
                <button
                  className="today-selected-remove"
                  type="button"
                  aria-label={`${item.title} 선택 해제`}
                  onClick={() => toggleItem(item.id)}
                >
                  ×
                </button>
                {item.image ? (
                  <img className="today-selected-card__photo" src={item.image} alt="" />
                ) : (
                  <div className={`today-clothes-shape today-clothes-shape--${getItemShape(item)}`} />
                )}
              </article>
            ))}
          </section>

          <button
            className="today-add-more-button"
            type="button"
            onClick={() => {
              setSubmitError("");
              setIsConfirmStep(false);
            }}
          >
            <span>+</span>
            새로운 아이템이에요
          </button>
        </section>
      ) : (
        <>
          <h1 className="today-upload-title">
            오늘 입은 코디는
            <br />
            어떤건가요?
          </h1>

          <label className="today-upload-search">
            <img src={searchIcon} alt="" />
            <input
              type="search"
              placeholder="옷 검색하기"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </label>

          <section className="today-upload-filters" aria-label="옷 필터">
            {filters.map((filter) => (
              <button
                className={
                  filter === activeFilter ||
                  (activeFilter === "All" && filter.startsWith("All "))
                    ? "active"
                    : ""
                }
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </section>

          <section className="today-upload-grid">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <article
                  className={`today-clothing-card ${isSelected ? "is-selected" : ""}`}
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleItem(item.id);
                    }
                  }}
                >
                  <div className="today-clothing-card__image">
                    {item.image ? (
                      <img className="today-clothing-card__photo" src={item.image} alt="" />
                    ) : (
                      <div className={`today-clothes-shape today-clothes-shape--${getItemShape(item)}`} />
                    )}
                    <span>{item.days}</span>
                  </div>

                  <div className="today-clothing-card__body">
                    <div>
                      <h2>{item.title}</h2>
                      <p>
                        {item.category} &nbsp; {item.colorName ?? item.color} &nbsp; {item.season}
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
                </article>
              );
            })}
          </section>
        </>
      )}

      <div className="today-complete-area">
        {submitError && <p className="today-submit-error">{submitError}</p>}
        <button
          className={`today-complete-button ${hasSelectedItems ? "is-active" : ""}`}
          type="button"
          disabled={!hasSelectedItems || isSubmittingWearLog}
          onClick={completeTodayLook}
        >
          {isSubmittingWearLog ? "등록 중..." : isConfirmStep ? "등록 완료" : "선택 완료"}
        </button>
      </div>
    </main>
  );
}

export default TodayUpload;
