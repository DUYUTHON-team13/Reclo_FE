import { useNavigate } from "react-router-dom";
import recloLogo from "../assets/image/icon/RECLO.png";
import onboardingImage from "../assets/image/icon/온보딩이미지.png";

function Start() {
  const navigate = useNavigate();

  return (
    <main className="mobile-page start-page">
      <section className="start-status" aria-label="상태바">
        <span></span>
      </section>

      <section className="start-content">
        <img className="start-onboarding-image" src={onboardingImage} alt="" />
        <img className="start-logo" src={recloLogo} alt="RECLO" />
        <p>
          AI와 함께 옷장 속 아이템들을
          <br />
          조합하여 새롭게 코디해봐요
        </p>
      </section>

      <button className="start-button" type="button" onClick={() => navigate("/home")}>
        시작하기
      </button>
    </main>
  );
}

export default Start;
