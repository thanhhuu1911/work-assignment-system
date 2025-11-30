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
    case "success":
      toast.success(message || "Thành công!", options);
      break;
    case "error":
      toast.error(message || "Có lỗi xảy ra!", options);
      break;
    case "warning":
      toast.warning(message || "Cảnh báo!", options);
      break;
    case "info":
      toast.info(message || "Thông tin", options);
      break;
    default:
      toast(message);
  }
};

export default Toast;
