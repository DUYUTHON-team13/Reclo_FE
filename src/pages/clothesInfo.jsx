import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import heartIcon from "../assets/image/icon/Heart_01.png";
import { getClothing } from "../api/clothes";

const CLOSE_DISTANCE = 170;
const EDIT_DISTANCE = 80;
const previewCards = [1, 2, 3, 4];

function ClothesInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpeningEdit, setIsOpeningEdit] = useState(false);
  const [detailItem, setDetailItem] = useState(state);

  const item = detailItem ?? {
    title: "스투시 반팔티",
    category: "상의",
    days: "47일",
    season: "여름",
    size: "S",
  };
  const from = state?.from ?? "closet";
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
  const tags = [
    item.category,
    item.color ?? "흰색",
    ...selectedSeasons,
    item.size ?? "S",
    item.purchaseDate ?? "24년 여름 구매",
    item.brand ?? "스투시",
  ];

  function closeInfo() {
    navigate(closePath);
  }

  function openEditPage() {
    setIsOpeningEdit(true);
    setDragY(-110);

    setTimeout(() => {
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
    <main className="mobile-page add-preview-page">
      <section
        className="add-preview-bg clothes-info-bg"
        role="button"
        tabIndex={0}
        aria-label="상세보기 닫기"
        onClick={closeInfo}
        onKeyDown={handleBackgroundKeyDown}
      >
        {from === "home" && <HomePreview />}
        {from === "report" && <ReportPreview />}
        {from === "closet" && <ClosetPreview />}
      </section>

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
          <button
            className="ghost-button sheet-link"
            type="button"
            onClick={openEditPage}
          >
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

function ClosetPreview() {
  return (
    <>
      <section className="phone-status add-preview-status">
        <strong></strong>
        <span></span>
      </section>

      <header className="closet-header">
        <h1>나의 옷장</h1>
      </header>

      <label className="closet-search">
        <span>⌕</span>
        <input type="search" placeholder="옷 검색하기" readOnly />
      </label>

      <section className="filter-row">
        <button className="filter-chip active" type="button" tabIndex={-1}>
          All
        </button>
        <button className="filter-chip" type="button" tabIndex={-1}>
          상의 18
        </button>
        <button className="filter-chip" type="button" tabIndex={-1}>
          하의 11
        </button>
        <button className="filter-chip" type="button" tabIndex={-1}>
          신발 14
        </button>
      </section>

      <PreviewGrid />
    </>
  );
}

function HomePreview() {
  return (
    <>
      <section className="phone-status add-preview-status">
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
            <p>날씨와 맞는 옷을 추천해드릴게요</p>
          </div>
          <button className="like-button" type="button" tabIndex={-1}>
            <img src={heartIcon} alt="" />
          </button>
          <span className="weather-chip">15°C</span>
        </div>
        <div className="outfit-row">
          <article className="outfit-item">
            <div className="outfit-visual outfit-visual--shirt" style={{ background: "#cbe6fb" }} />
            <p>상의</p>
          </article>
          <article className="outfit-item">
            <div className="outfit-visual outfit-visual--pants" style={{ background: "#73612e" }} />
            <p>하의</p>
          </article>
          <article className="outfit-item">
            <div className="outfit-visual outfit-visual--outer" style={{ background: "#6b5363" }} />
            <p>아우터</p>
          </article>
        </div>
      </section>

      <section className="question-card">
        <div>
          <h2>오늘은 어떤 옷을 입었나요?</h2>
          <p>오늘 입은 옷 3초면 등록완료!</p>
        </div>
        <span>3초만에 등록하기 &gt;</span>
      </section>

      <section className="section-heading">
        <div>
          <h2>잘 입지 않는 옷들</h2>
          <p>옷들이 기다리고 있어요</p>
        </div>
      </section>

      <PreviewGrid />
    </>
  );
}

function ReportPreview() {
  return (
    <>
      <section className="phone-status add-preview-status">
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
        <div className="usage-donut">
          <div>
            <strong>60%</strong>
            <span>활용도</span>
          </div>
        </div>
      </section>

      <section className="report-stat-row">
        <article className="report-stat-card">
          <span>옷장 아이템</span>
          <strong>48</strong>
        </article>
        <article className="report-stat-card">
          <span>미착용 아이템</span>
          <strong>12</strong>
        </article>
      </section>

      <section className="section-heading report-section-heading">
        <div>
          <h2>30일 내 미착용 아이템</h2>
          <p>옷장에서 기다리는 아이템이 많아요</p>
        </div>
      </section>

      <PreviewGrid />
    </>
  );
}

function PreviewGrid() {
  return (
    <section className="add-preview-grid">
      {previewCards.map((card) => (
        <article className="add-preview-card" key={card}>
          <div>
            <span>47일</span>
          </div>
          <section>
            <strong>스투시 반팔티</strong>
            <img src={heartIcon} alt="" />
            <p>상의 &nbsp; 흰색 &nbsp; 여름</p>
          </section>
        </article>
      ))}
    </section>
  );
}

export default ClothesInfo;
