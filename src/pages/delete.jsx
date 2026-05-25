import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import closeIcon from "../assets/image/icon/곱표.png";
import backIcon from "../assets/image/icon/돌아가기.png";
import { deleteClothing, updateClothing } from "../api/clothes";

const typeOptions = ["상의", "하의", "아우터", "신발"];
const seasonOptions = ["봄", "여름", "가을", "겨울"];
const CLOSE_DISTANCE = 90;

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
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const yearMatch = value.match(/(\d{2,4})/);

  if (!yearMatch) {
    return new Date().toISOString().slice(0, 10);
  }

  const rawYear = yearMatch[1];
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;

  return `${year}-07-01`;
}

function Delete() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const startY = useRef(0);
  const previewImage = state?.image ?? state?.previewImage ?? "";
  const [form, setForm] = useState({
    title: state?.title ?? "스투시 반팔티",
    purchaseDate: state?.purchaseDate ?? "24년도 여름 구매",
    size: state?.size ?? "S",
    brand: state?.brand ?? "스투시",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [type, setType] = useState(state?.category ?? "상의");
  const [color, setColor] = useState(state?.colorName ?? state?.color ?? "흰색");
  const [seasons, setSeasons] = useState(state?.seasons ?? [state?.season ?? "여름"]);
  const [sheetMode, setSheetMode] = useState("");
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const isTypeSheetOpen = sheetMode === "type";
  const isSeasonSheetOpen = sheetMode === "season";
  const isSheetOpen = isTypeSheetOpen || isSeasonSheetOpen;

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  async function deleteItem() {
    if (isDeleting) return;

    setIsDeleting(true);

    const deleteId = state?.id;

    if (deleteId !== undefined && deleteId !== null) {
      try {
        await deleteClothing(deleteId);
      } catch (error) {
        console.log("의류 삭제 API 실패:", error.message);
      }

      const savedItems = JSON.parse(localStorage.getItem("closetItems") ?? "[]");
      const deletedItem = savedItems.find(
        (item) => String(item.id) === String(deleteId)
      );
      const nextSavedItems = savedItems.filter(
        (item) => String(item.id) !== String(deleteId)
      );
      localStorage.setItem("closetItems", JSON.stringify(nextSavedItems));

      if (deletedItem) {
        const deletedItems = JSON.parse(localStorage.getItem("deletedClosetItems") ?? "[]");
        const nextDeletedItems = deletedItems.some(
          (item) => String(item.id) === String(deleteId)
        )
          ? deletedItems
          : [deletedItem, ...deletedItems];
        localStorage.setItem("deletedClosetItems", JSON.stringify(nextDeletedItems));
      }

      const deletedIds = JSON.parse(localStorage.getItem("deletedClosetItemIds") ?? "[]");
      const nextDeletedIds = deletedIds.includes(String(deleteId))
        ? deletedIds
        : [...deletedIds, String(deleteId)];
      localStorage.setItem("deletedClosetItemIds", JSON.stringify(nextDeletedIds));
    }

    setIsDeleting(false);

    navigate("/closet", {
      state: {
        toast: "삭제가 완료되었습니다",
      },
    });
  }

  async function saveItem() {
    if (isSaving) return;

    setIsSaving(true);

    const nextItem = {
      ...state,
      title: form.title,
      category: type,
      color,
      colorName: color,
      seasons,
      season: seasons[0] ?? "여름",
      size: form.size,
      brand: form.brand,
      purchaseDate: form.purchaseDate,
      days: state?.days ?? "47일",
      image: previewImage,
      previewImage,
      from: state?.from ?? "closet",
    };

    const requestBody = {
      name: form.title,
      category: normalizeValue(type, categoryMap, "TOP"),
      color: normalizeValue(color, colorMap, "WHITE"),
      style: state?.style ?? "CASUAL",
      seasons: seasons.map((season) => normalizeValue(season, seasonMap, "SUMMER")),
      brand: form.brand,
      size: form.size,
      purchasedAt: normalizePurchaseDate(form.purchaseDate),
    };

    try {
      if (state?.id) {
        await updateClothing(state.id, requestBody);
      }
    } catch (error) {
      console.log("의류 수정 API 실패:", error.message);

      const savedItems = JSON.parse(localStorage.getItem("closetItems") ?? "[]");
      const nextSavedItems = savedItems.map((item) =>
        String(item.id) === String(state?.id) ? nextItem : item
      );
      localStorage.setItem("closetItems", JSON.stringify(nextSavedItems));
    } finally {
      setIsSaving(false);
    }

    navigate("/clothes-info", {
      state: nextItem,
    });
  }

  function closeSheet() {
    setSheetMode("");
    setDragY(0);
    setIsDragging(false);
  }

  function openSheet(mode) {
    setDragY(0);
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
    if (event.target.closest("button, input")) return;

    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSheetDragMove(event) {
    if (!isDragging) return;

    const nextDragY = event.clientY - startY.current;
    setDragY(Math.max(0, nextDragY));
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
  }

  return (
    <main className="mobile-page delete-page">
      <section className="phone-status delete-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <button
        className="add-clothes-back delete-back"
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
      >
        <img src={backIcon} alt="뒤로가기" />
      </button>

      <h1 className="delete-title">수정하기</h1>

      <section className="delete-preview-image" aria-label="옷 이미지 미리보기">
        {previewImage && (
          <img
            className="upload-preview-image"
            src={previewImage}
            alt="선택한 옷 미리보기"
          />
        )}
      </section>

      <section className="delete-tag-row" aria-label="옷 태그">
        <span>{type}</span>
        <span>{form.size}</span>
        <span>{color}</span>
        {seasons.map((season) => (
          <span key={season}>{season}</span>
        ))}
      </section>

      <form className="delete-form">
        <label>
          아이템 이름
          <div>
            <input name="title" value={form.title} onChange={handleFormChange} />
            <img src={closeIcon} alt="" />
          </div>
        </label>

        <label>
          구매 시기
          <div>
            <input
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleFormChange}
            />
            <img src={closeIcon} alt="" />
          </div>
        </label>

        <label>
          사이즈
          <div>
            <input name="size" value={form.size} onChange={handleFormChange} />
            <img src={closeIcon} alt="" />
          </div>
        </label>

        <label>
          브랜드
          <div>
            <input name="brand" value={form.brand} onChange={handleFormChange} />
            <img src={closeIcon} alt="" />
          </div>
        </label>
      </form>

      <h2 className="delete-section-title">AI 인식 정보 수정하기</h2>

      <form className="delete-ai-form">
        <button className="delete-select-row" type="button" onClick={() => openSheet("type")}>
          <span>종류</span>
          <strong>{type}</strong>
          <i aria-hidden="true" />
        </button>

        <label className="delete-input-row">
          <span>색상</span>
          <input value={color} onChange={(event) => setColor(event.target.value)} />
        </label>

        <button
          className="delete-select-row"
          type="button"
          onClick={() => openSheet("season")}
        >
          <span>계절 · 복수선택 가능</span>
          <strong>{seasons.length > 0 ? seasons.join(", ") : "선택해주세요"}</strong>
          <i aria-hidden="true" />
        </button>
      </form>

      <div className="delete-actions">
        <button
          className="delete-outline-button"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          삭제하기
        </button>
        <button
          className="primary-button delete-save-button"
          type="button"
          disabled={isSaving}
          onClick={saveItem}
        >
          {isSaving ? "수정 중" : "수정 완료"}
        </button>
      </div>

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
            style={{ transform: `translateX(-50%) translateY(${dragY}px)` }}
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

      {isModalOpen && (
        <section className="delete-modal-layer" aria-label="삭제 확인">
          <div className="delete-modal">
            <h2>정말 삭제할까요?</h2>
            <div className="delete-modal-actions">
              <button type="button" onClick={() => setIsModalOpen(false)}>
                돌아가기
              </button>
              <button
                className="danger"
                type="button"
                disabled={isDeleting}
                onClick={deleteItem}
              >
                {isDeleting ? "삭제 중" : "삭제하기"}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Delete;
