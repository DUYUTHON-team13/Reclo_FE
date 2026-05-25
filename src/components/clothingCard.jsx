import { useState } from "react";
import heartIcon from "../assets/image/icon/Heart_01.png";

function ClothingCard({
  title,
  category,
  colorName,
  season,
  seasons,
  days,
  image,
  color = "#e5e5e5",
  liked: likedProp,
  onLikeToggle,
  onOpen,
  onStyle,
}) {
  const [internalLiked, setInternalLiked] = useState(false);
  const liked = likedProp ?? internalLiked;
  const seasonText = seasons?.length ? seasons.join(" ") : season;
  const detailText = [category, colorName, seasonText].filter(Boolean).join("   ");

  function handleLikeClick(event) {
    event.stopPropagation();

    if (onLikeToggle) {
      onLikeToggle();
      return;
    }

    setInternalLiked(!internalLiked);
  }

  function handleButtonClick(event) {
    event.stopPropagation();

    if (onStyle) {
      onStyle();
    }
  }

  function handleKeyDown(event) {
    if ((event.key === "Enter" || event.key === " ") && onOpen) {
      event.preventDefault();
      onOpen();
    }
  }

  return (
    <article
      className="clothing-card"
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="clothing-card__image" style={{ background: color }}>
        {image && <img src={image} alt="" />}
        <span>{days}</span>
      </div>

      <div className="clothing-card__body">
        <div>
          <h3>{title}</h3>
          <p>{detailText}</p>
        </div>

        <button
          className={`clothing-card__heart ${liked ? "is-liked" : ""}`}
          type="button"
          aria-label={`${title} 좋아요`}
          onClick={handleLikeClick}
        >
          <img className="clothing-card__heart-icon" src={heartIcon} alt="" />
        </button>
      </div>

      <button
        className="clothing-card__button"
        type="button"
        onClick={handleButtonClick}
      >
        스타일링 하기
      </button>
    </article>
  );
}

export default ClothingCard;
