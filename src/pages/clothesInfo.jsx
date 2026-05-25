import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getClothing } from "../api/clothes";

const CLOSE_DISTANCE = 170;
const EDIT_DISTANCE = 80;

const colorLabelMap = {
  BLACK: "검정",
  WHITE: "흰색",
  GRAY: "회색",
  BLUE: "파랑",
  NAVY: "남색",
  BROWN: "갈색",
  BEIGE: "베이지",
  RED: "빨강",
  PINK: "분홍",
  YELLOW: "노랑",
  GREEN: "초록",
  PURPLE: "보라",
};

function ClothesInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpeningEdit, setIsOpeningEdit] = useState(false);
  const [detailItem, setDetailItem] = useState(state);

  const item = detailItem ?? {
    title: "스투시 반팔 티셔츠",
    category: "상의",
    days: "47일",
    season: "여름",
    size: "S",
  };
  const from = state?.from ?? "closet";
  const hasBackgroundLocation = Boolean(state?.backgroundLocation);
  const closePath = from === "home" ? "/home" : from === "report" ? "/report" : "/closet";

  useEffect(() => {
    if (!state?.id) return;

    getClothing(state.id)
      .then((data) => {
        setDetailItem({ ...state, ...data });
      })
      .catch((error) => {
        console.log("의류 상세 조회 실패:", error.message);
      });
  }, [state]);

  const selectedSeasons = item.seasons ?? [item.season ?? "여름"];
  const normalizedColor = item.color
    ? colorLabelMap[item.color.toUpperCase()] ?? item.color
    : item.colorName ?? "흰색";
  const tags = [
    item.category,
    normalizedColor,
    ...selectedSeasons,
    item.size ?? "S",
    item.purchaseDate ?? "24년 여름 구매",
    item.brand ?? "스투시",
  ];

  function closeInfo() {
    if (hasBackgroundLocation) {
      navigate(-1);
      return;
    }

    navigate(closePath);
  }

  function openEditPage() {
    setIsOpeningEdit(true);
    setDragY(-110);

    window.setTimeout(() => {
      navigate("/delete", { state: item });
    }, 180);
  }

  function handleBackgroundKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      closeInfo();
    }
  }

  function handleDragStart(event) {
    if (event.target.closest("button, a, input")) return;

    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event) {
    if (!isDragging) return;

    const nextDragY = event.clientY - startY.current;
    setDragY(Math.max(-110, nextDragY));
  }

  function handleDragEnd(event) {
    if (!isDragging) return;

    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (dragY > CLOSE_DISTANCE) {
      closeInfo();
      return;
    }

    if (dragY < -EDIT_DISTANCE) {
      openEditPage();
      return;
    }

    setDragY(0);
  }

  return (
    <main className={`mobile-page clothes-info-page ${hasBackgroundLocation ? "is-modal" : ""}`}>
      <button
        className="clothes-info-backdrop"
        type="button"
        aria-label="상세보기 닫기"
        onClick={closeInfo}
        onKeyDown={handleBackgroundKeyDown}
      />

      <section
        className={`clothes-bottom-sheet ${isDragging ? "is-dragging" : ""} ${
          isOpeningEdit ? "is-opening-edit" : ""
        }`}
        style={{ transform: `translateY(${dragY}px)` }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="sheet-handle" />

        <div className="sheet-item-image">
          {item.image && <img src={item.image} alt="" />}
          <span>{item.days}</span>
        </div>

        <h2>{item.title}</h2>

        <div className="sheet-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="sheet-actions">
          <button className="ghost-button sheet-link" type="button" onClick={openEditPage}>
            수정하기
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/styling", { state: item })}
          >
            스타일링 하기
          </button>
        </div>

        <div className="home-indicator" />
      </section>
    </main>
  );
}

export default ClothesInfo;
