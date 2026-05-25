import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import searchIcon from "../assets/image/icon/Search_Magnifying_Glass.png";
import toastIcon from "../assets/image/icon/Frame 2147227879.png";
import triangleIcon from "../assets/image/icon/세모 아이콘.png";
import { getClothes } from "../api/clothes";
import BottomNav from "../components/bottomNav.jsx";
import ClothingCard from "../components/clothingCard.jsx";

const fallbackClothes = [
  { id: 1, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
  { id: 2, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
  { id: 3, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
  { id: 4, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
  { id: 5, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
  { id: 6, title: "스투시 반팔티", category: "상의", days: "47일", season: "여름", size: "S" },
];

function Closet() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [filterMode, setFilterMode] = useState("all");
  const [sortMode, setSortMode] = useState("default");
  const [filterLabel, setFilterLabel] = useState("All");
  const [likedIds, setLikedIds] = useState([]);
  const [apiClothes, setApiClothes] = useState([]);
  const [savedClothes, setSavedClothes] = useState(() =>
    JSON.parse(localStorage.getItem("closetItems") ?? "[]")
  );
  const [deletedIds, setDeletedIds] = useState(() =>
    JSON.parse(localStorage.getItem("deletedClosetItemIds") ?? "[]")
  );
  const [deletedItems, setDeletedItems] = useState(() =>
    JSON.parse(localStorage.getItem("deletedClosetItems") ?? "[]")
  );
  const [restoreMenuOpen, setRestoreMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(location.state?.toast ?? "");

  const categoryList = [
    { label: "상의", value: "상의" },
    { label: "하의", value: "하의" },
    { label: "신발", value: "신발" },
    { label: "아우터", value: "아우터" },
  ];

  function getSortTimestamp(item) {
    const rawValue = item.lastWornAt ?? item.purchaseDate ?? item.purchasedAt ?? "";

    if (!rawValue) return 0;

    const parsed = Date.parse(rawValue);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const serverClothes = apiClothes.length > 0 ? apiClothes : fallbackClothes;
  const closetItems = [...savedClothes, ...serverClothes].filter(
    (item) => !deletedIds.includes(String(item.id))
  );
  const categoryCounts = closetItems.reduce((counts, item) => {
    const category = item.category;

    return {
      ...counts,
      [category]: (counts[category] ?? 0) + 1,
    };
  }, {});
  function handleCategoryFilter(category) {
    setFilterMode(category);
    setSortMenuOpen(false);
  }

  const restorableItems = [
    ...deletedItems,
    ...fallbackClothes.filter(
      (item) =>
        deletedIds.includes(String(item.id)) &&
        !deletedItems.some((deletedItem) => String(deletedItem.id) === String(item.id))
    ),
  ];
  const filteredClothes =
    filterMode === "liked"
      ? closetItems.filter((item) => likedIds.includes(item.id))
      : filterMode === "all"
      ? closetItems
      : closetItems.filter((item) => item.category === filterMode);
  const visibleClothes = [...filteredClothes].sort((a, b) => {
    if (sortMode === "latest") {
      return getSortTimestamp(b) - getSortTimestamp(a);
    }

    if (location.state?.sort === "unworn") {
      return (b.unwornDays ?? 0) - (a.unwornDays ?? 0);
    }

    return 0;
  });

  useEffect(() => {
    getClothes()
      .then((items) => {
        setApiClothes(items);
      })
      .catch((error) => {
        console.log("의류 리스트 불러오기 실패:", error.message);
      });
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  function toggleLike(id) {
    setLikedIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((likedId) => likedId !== id)
        : [...prevIds, id]
    );
  }

  function openClothesInfo(item) {
    navigate("/clothes-info", { state: { ...item, from: "closet" } });
  }

  function openStyling(item) {
    navigate("/styling", { state: item });
  }

  function selectFilter(mode, label) {
    if (mode === "latest") {
      setFilterMode("all");
      setSortMode("latest");
      setFilterLabel("최신순");
    } else if (mode === "liked") {
      setFilterMode("liked");
      setSortMode("default");
      setFilterLabel("좋아요만");
    } else {
      setFilterMode("all");
      setSortMode("default");
      setFilterLabel(label);
    }

    setSortMenuOpen(false);
  }

  function restoreItem(itemToRestore) {
    const storedItems = JSON.parse(localStorage.getItem("closetItems") ?? "[]");
    const nextSavedItems = fallbackClothes.some(
      (item) => String(item.id) === String(itemToRestore.id)
    )
      ? storedItems
      : [
          itemToRestore,
          ...storedItems.filter((item) => String(item.id) !== String(itemToRestore.id)),
        ];
    const nextDeletedIds = deletedIds.filter(
      (deletedId) => String(deletedId) !== String(itemToRestore.id)
    );
    const nextDeletedItems = deletedItems.filter(
      (item) => String(item.id) !== String(itemToRestore.id)
    );

    localStorage.setItem("closetItems", JSON.stringify(nextSavedItems));
    localStorage.setItem("deletedClosetItems", JSON.stringify(nextDeletedItems));
    localStorage.setItem("deletedClosetItemIds", JSON.stringify(nextDeletedIds));

    setSavedClothes(nextSavedItems);
    setDeletedIds(nextDeletedIds);
    setDeletedItems(nextDeletedItems);
    setRestoreMenuOpen(nextDeletedItems.length + nextDeletedIds.length > 0);
    setToastMessage(`${itemToRestore.title}을 다시 불러왔어요`);
  }

  return (
    <main className="mobile-page closet-page">
      <section className="phone-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <header className="closet-header">
        <h1>나의 옷장</h1>
      </header>

      <label className="closet-search">
        <span>
          <img src={searchIcon} alt="" />
        </span>
        <input type="search" placeholder="옷 검색하기" />
      </label>

      <section className="filter-row" aria-label="옷 필터">
        <div className="filter-menu">
          <button
            className="filter-chip filter-chip--sort active"
            type="button"
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
          >
            {filterLabel}
            <img className="filter-chip__icon" src={triangleIcon} alt="" />
          </button>

          {sortMenuOpen && (
            <div className="filter-dropdown">
              <button type="button" onClick={() => selectFilter("all", "All")}>
                All
              </button>
              <button type="button" onClick={() => selectFilter("latest", "최신순")}>
                최신순
              </button>
              <button type="button" onClick={() => selectFilter("liked", "좋아요만")}>
                좋아요만
              </button>
            </div>
          )}
        </div>
          {/* 카테고리 chips */}
          <button
            className={`filter-chip${filterMode === "all" && sortMode === "default" ? " active" : ""}`}
            type="button"
            onClick={() => {
              setFilterMode("all");
              setSortMode("default");
              setFilterLabel("All");
            }}
          >
            All
          </button>
          {categoryList.map((cat) => (
            <button
              className={`filter-chip${filterMode === cat.value ? " active" : ""}`}
              type="button"
              key={cat.value}
              onClick={() => handleCategoryFilter(cat.value)}
            >
              {cat.label} <b>{categoryCounts[cat.value] ?? 0}</b>
            </button>
          ))}
      </section>

      <section className="clothing-grid closet-grid">
        {visibleClothes.map((item) => (
          <ClothingCard
            key={item.id}
            title={item.title}
            category={item.category}
            colorName={item.colorName ?? item.color}
            season={item.season}
            seasons={item.seasons}
            days={item.days}
            image={item.image}
            liked={likedIds.includes(item.id)}
            onLikeToggle={() => toggleLike(item.id)}
            onOpen={() => openClothesInfo(item)}
            onStyle={() => openStyling(item)}
          />
        ))}
      </section>

      <section className="restore-clothes-section">
        <button
          className="restore-clothes-button"
          type="button"
          onClick={() => setRestoreMenuOpen(!restoreMenuOpen)}
        >
          삭제 복구하기
        </button>

        {restoreMenuOpen && (
          <div className="restore-clothes-panel">
            {restorableItems.length > 0 ? (
              restorableItems.map((item) => (
                <button
                  className="restore-clothes-item"
                  type="button"
                  key={item.id}
                  onClick={() => restoreItem(item)}
                >
                  <span>{item.title}</span>
                  <small>
                    {[item.category, item.colorName ?? item.color, item.season]
                      .filter(Boolean)
                      .join("   ")}
                  </small>
                </button>
              ))
            ) : (
              <p>복구할 아이템이 없어요</p>
            )}
          </div>
        )}
      </section>

      <Link className="floating-add closet-add" to="/add-clothes" aria-label="의류 업로드">
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

export default Closet;
