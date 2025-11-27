import multer from "multer";
import path from "path";

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // TẠO TÊN MỚI = TÊN GỐC + TIMESTAMP + EXT
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // Làm sạch tên file (loại bỏ ký tự đặc biệt nếu cần)
    const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `${cleanName}-${Date.now()}${ext}`;

    // LƯU TÊN GỐC VÀO FILE OBJECT ĐỂ DÙNG SAU
    file.displayName = file.originalname;
    file.storedName = uniqueName;

    cb(null, uniqueName);
  },
});

// Filter chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  // Cho phép tất cả file dưới 10MB
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép ảnh và tài liệu!"), false);
  }
};

// Cập nhật limits
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
