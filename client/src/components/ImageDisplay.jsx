// client/src/components/ImageDisplay.jsx
const ImageDisplay = ({ imageField, attachedFile, type = "before" }) => {
  const isBefore = type === "before";

  // 1. Có ảnh thật → dùng class Bootstrap có sẵn
  if (imageField) {
    return (
      <img
        src={`/uploads/${imageField}`}
        alt={isBefore ? "Before" : "After"}
        className="w-100 h-100 img-fluid object-fit-contain bg-white p-1"
        onError={(e) => {
          e.target.src = "/no-image.jpg";
          e.target.onerror = null;
          e.target.alt = "No image";
        }}
      />
    );
  }

  // 2. Ảnh trước + có file → hiện logo công ty
  if (isBefore && attachedFile && attachedFile.length > 0) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-white h-100">
        <img
          src="/logo-company.png"
          alt="Company Logo"
          className="img-fluid"
          style={{ maxHeight: "75%", maxWidth: "75%" }}
        />
      </div>
    );
  }

  // 3. Placeholder
  return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light text-muted">
      <i
        className={`bi ${
          isBefore ? "bi-image" : "bi-camera-fill text-success"
        } fs-1 opacity-50`}
      />
      <small className="mt-2">No image</small>
    </div>
  );
};

export default ImageDisplay;
