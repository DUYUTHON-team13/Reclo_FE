import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import backIcon from "../assets/image/icon/돌아가기.png";

const typeOptions = ["상의", "하의", "아우터", "신발"];
const seasonOptions = ["봄", "여름", "가을", "겨울"];
const CLOSE_DISTANCE = 90;
const MAX_EXPAND_DISTANCE = 160;

function Change() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const startY = useRef(0);
  const previewImage = state?.previewImage ?? "";
  const [type, setType] = useState(state?.category ?? "상의");
  const [color, setColor] = useState(state?.color ?? "흰색");
  const [seasons, setSeasons] = useState(state?.seasons ?? ["여름"]);
  const [sheetMode, setSheetMode] = useState("");
  const [dragY, setDragY] = useState(0);
  const [sheetExpandY, setSheetExpandY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const isTypeSheetOpen = sheetMode === "type";
  const isSeasonSheetOpen = sheetMode === "season";
  const isSheetOpen = isTypeSheetOpen || isSeasonSheetOpen;

  function goNext() {
    navigate("/add-clothes/info", {
      state: {
        previewImage,
        category: type,
        color,
        seasons,
      },
    });
  }

  function closeSheet() {
    setSheetMode("");
    setDragY(0);
    setSheetExpandY(0);
    setIsDragging(false);
  }

  function openSheet(mode) {
    setDragY(0);
    setSheetExpandY(0);
    setSheetMode(mode);
  }

  function toggleSeason(season) {
    setSeasons((prevSeasons) => {
      if (prevSeasons.includes(season)) {
        return prevSeasons.filter((item) => item !== season);
      }

      return [...prevSeasons, season];
    });
  }

  function handleSheetDragStart(event) {
    if (event.target.closest("button")) return;

    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSheetDragMove(event) {
    if (!isDragging) return;

    const nextDragY = event.clientY - startY.current;

    if (nextDragY < 0) {
      setDragY(0);
      setSheetExpandY(Math.min(MAX_EXPAND_DISTANCE, Math.abs(nextDragY)));
      return;
    }

    setSheetExpandY(0);
    setDragY(nextDragY);
  }

  function handleSheetDragEnd(event) {
    if (!isDragging) return;

    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (dragY > CLOSE_DISTANCE) {
      closeSheet();
      return;
    }

    setDragY(0);
    setSheetExpandY(sheetExpandY > 60 ? MAX_EXPAND_DISTANCE : 0);
  }

  return (
    <main className="mobile-page change-page">
      <section className="phone-status change-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <button
        className="add-clothes-back change-back"
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
      >
        <img src={backIcon} alt="뒤로가기" />
      </button>

      <h1 className="change-title">
        AI가 정보를
        <br />
        확인했어요
      </h1>

      <section className="change-preview-image" aria-label="옷 이미지 미리보기">
        {previewImage && (
          <img
            className="upload-preview-image"
            src={previewImage}
            alt="업로드한 옷 미리보기"
          />
        )}
      </section>

      <h2 className="change-section-title">수정하기</h2>

      <form className="change-form">
        <button className="change-select-row" type="button" onClick={() => openSheet("type")}>
          <span>종류</span>
          <strong>{type}</strong>
          <i aria-hidden="true" />
        </button>

        <label className="change-input-row">
          <span>색상</span>
          <input value={color} onChange={(event) => setColor(event.target.value)} />
        </label>

        <button
          className="change-select-row"
          type="button"
          onClick={() => openSheet("season")}
        >
          <span>계절 · 복수선택 가능</span>
          <strong>{seasons.length > 0 ? seasons.join(", ") : "선택해주세요"}</strong>
          <i aria-hidden="true" />
        </button>
      </form>

      <button className="primary-button change-next-button" type="button" onClick={goNext}>
        다음
      </button>

      {isSheetOpen && (
        <>
          <button
            className="change-sheet-backdrop"
            type="button"
            aria-label="선택창 닫기"
            onClick={closeSheet}
          />
          <section
            className={`change-sheet ${isDragging ? "is-dragging" : ""}`}
            style={{
              minHeight: `${221 + sheetExpandY}px`,
              transform: `translateY(${dragY}px)`,
            }}
            onPointerDown={handleSheetDragStart}
            onPointerMove={handleSheetDragMove}
            onPointerUp={handleSheetDragEnd}
            onPointerCancel={handleSheetDragEnd}
          >
            <div className="sheet-handle" />

            {isTypeSheetOpen && (
              <>
                <h2>종류</h2>
                <div className="change-sheet-options">
                  {typeOptions.map((option) => (
                    <button
                      className={type === option ? "is-selected" : ""}
                      type="button"
                      key={option}
                      onClick={() => {
                        setType(option);
                        closeSheet();
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}

            {isSeasonSheetOpen && (
              <>
                <h2>계절</h2>
                <div className="change-sheet-options">
                  {seasonOptions.map((option) => (
                    <button
                      className={seasons.includes(option) ? "is-selected" : ""}
                      type="button"
                      key={option}
                      onClick={() => toggleSeason(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="home-indicator change-sheet-indicator" />
          </section>
        </>
      )}

      <div className="home-indicator change-home-indicator" />
    </main>
  );
}

export default Change;
