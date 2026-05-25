import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import cameraIcon from "../assets/image/icon/Camera.png";
import closeIcon from "../assets/image/icon/곱표.png";

function AddClothes() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const hasImage = Boolean(previewImage && imageFile);

  function openFilePicker() {
    fileInputRef.current.click();
  }

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setPreviewImage("");
    setImageFile(null);
    fileInputRef.current.value = "";
  }

  function goNext() {
    if (!hasImage) return;

    navigate("/add-clothes/next", {
      state: {
        previewImage,
        imageFile,
      },
    });
  }

  return (
    <main className="mobile-page add-clothes-page">
      <section className="phone-status add-clothes-status" aria-label="상태바">
        <strong></strong>
        <span></span>
      </section>

      <button
        className="add-clothes-back"
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate("/closet")}
      >
        ←
      </button>

      <h1 className="add-clothes-title">
        아이템을
        <br />
        등록해주세요
      </h1>

      <section className="upload-preview-box">
        {previewImage && (
          <img
            className="upload-preview-image"
            src={previewImage}
            alt="업로드한 옷 미리보기"
          />
        )}
        <button
          className="upload-clear-button"
          type="button"
          aria-label="사진 삭제"
          onClick={clearImage}
        >
          <img src={closeIcon} alt="" />
        </button>
      </section>

      <input
        ref={fileInputRef}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      <button className="photo-upload-button" type="button" onClick={openFilePicker}>
        <img src={cameraIcon} alt="" />
        사진 업로드 하기
      </button>

      <button
        className={`add-next-button ${hasImage ? "is-active" : ""}`}
        type="button"
        disabled={!hasImage}
        onClick={goNext}
      >
        다음
      </button>
    </main>
  );
}

export default AddClothes;
