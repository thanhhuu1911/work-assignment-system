// src/components/Toast.jsx
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toast = () => {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar={false}
    />
  );
};

// Hàm tiện ích để gọi toast từ bất kỳ đâu
export const showToast = (type = "success", message = "") => {
  const options = {
    position: "top-center",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };

  switch (type) {
    case "Thành công":
      toast.success(message || "Thành công!", options);
      break;
    case "Có lỗi xảy ra":
      toast.error(message || "Có lỗi xảy ra!", options);
      break;
    case "Cảnh báo":
      toast.warning(message || "Cảnh báo!", options);
      break;
    case "Thông tin":
      toast.info(message || "Thông tin", options);
      break;
    default:
      toast(message);
  }
};

export default Toast;
