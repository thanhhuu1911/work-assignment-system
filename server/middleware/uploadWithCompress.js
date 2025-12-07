// server/middleware/uploadWithCompress.js
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";

// Đảm bảo thư mục uploads tồn tại
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage(); // Dùng memory để xử lý trước khi lưu

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Chỉ cho phép ảnh (JPG, PNG, WebP) và tài liệu (PDF, DOCX, XLSX, ZIP...)"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).fields([
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage", maxCount: 1 },
  { name: "attachedFile", maxCount: 10 },
  { name: "completedFile", maxCount: 15 },
]);

// Hàm xử lý nén ảnh và lưu file
const processAndSaveFile = async (file, fieldName) => {
  const isImage = file.mimetype.startsWith("image/");
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  let filename, buffer;

  if (isImage) {
    // Nén ảnh bằng sharp
    let image = sharp(file.buffer);
    const metadata = await image.metadata();

    // Resize nếu lớn hơn 1280px
    if (metadata.width > 1280) {
      image = image.resize(1280, null, { withoutEnlargement: true });
    }

    // Chuyển sang WebP nếu không phải WebP gốc, nếu là PNG → WebP, JPG → WebP
    const ext = metadata.format === "png" ? "webp" : "webp";
    const quality = 70;

    buffer = await image
      .webp({ quality }) // Luôn xuất WebP để tối ưu nhất
      .toBuffer();

    filename = `${fieldName}-${timestamp}-${random}.webp`;
  } else {
    // File tài liệu → lưu nguyên bản
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File "${file.originalname}" quá lớn (>10MB)`);
    }
    buffer = file.buffer;
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    filename = `${name}-${timestamp}-${random}${ext}`;
  }

  const filepath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filepath, buffer);

  return {
    original: file.originalname,
    stored: filename,
    mimetype: isImage ? "image/webp" : file.mimetype,
    size: buffer.length,
  };
};

// Middleware chính
export const uploadWithCompress = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "File quá lớn! Tối đa 10MB/file" });
        }
      }
      return res
        .status(400)
        .json({ message: err.message || "Lỗi upload file" });
    }

    try {
      const processedFiles = {};

      // Xử lý beforeImage / afterImage
      if (req.files?.beforeImage?.[0]) {
        processedFiles.beforeImage = await processAndSaveFile(
          req.files.beforeImage[0],
          "before"
        );
      }
      if (req.files?.afterImage?.[0]) {
        processedFiles.afterImage = await processAndSaveFile(
          req.files.afterImage[0],
          "after"
        );
      }

      // Xử lý attachedFile (nhiều file)
      if (req.files?.attachedFile) {
        const files = Array.isArray(req.files.attachedFile)
          ? req.files.attachedFile
          : [req.files.attachedFile[0]].filter(Boolean);
        processedFiles.attachedFiles = await Promise.all(
          files.map((f, i) => processAndSaveFile(f, `attach-${i}`))
        );
      }

      // Xử lý completedFile (nhiều file)
      if (req.files?.completedFile) {
        const files = Array.isArray(req.files.completedFile)
          ? req.files.completedFile
          : [req.files.completedFile[0]].filter(Boolean);
        processedFiles.completedFiles = await Promise.all(
          files.map((f, i) => processAndSaveFile(f, `complete-${i}`))
        );
      }

      // Gắn vào req để controller dùng
      req.processedFiles = processedFiles;

      next();
    } catch (error) {
      console.error("Lỗi xử lý file:", error);
      res.status(500).json({ message: "Lỗi xử lý file: " + error.message });
    }
  });
};
