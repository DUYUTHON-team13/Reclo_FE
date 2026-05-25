import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import heartIcon from "../assets/image/icon/Heart_01.png";

const outfitItems = [
  { label: "상의", type: "shirt", color: "#cbe6fb" },
  { label: "아우터", type: "outer", color: "#7c5f6d" },
  { label: "하의", type: "pants", color: "#6f632d" },
  { label: "신발", type: "shoes", color: "#111111" },
];

function Styling() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsComplete(true);
    }, 1200);

    return () => window.clearTimeout(timerId);
  }, []);

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
            <strong>스타일링 1</strong>
            <button type="button" aria-label="스타일링 좋아요">
              <img src={heartIcon} alt="" />
            </button>
          </div>

          <section className="styling-outfit-grid">
            {outfitItems.map((item) => (
              <article className="styling-outfit-item" key={item.label}>
                <div className="styling-outfit-image">
                  <div
                    className={`styling-clothes-shape styling-clothes-shape--${item.type}`}
                    style={{ "--item-color": item.color }}
                  />
                </div>
                <p>{item.label}</p>
              </article>
            ))}
          </section>

          <div className="styling-page-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>

          {state?.title && (
            <p className="styling-source">선택한 옷: {state.title}</p>
          )}

          <div className="styling-actions">
            <button className="ghost-button" type="button" onClick={() => navigate(-1)}>
              나가기
            </button>
            <button className="primary-button" type="button" onClick={() => navigate("/home")}>
              착용하기
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Styling;
