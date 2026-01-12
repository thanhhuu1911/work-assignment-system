import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import fsSync from "fs";
import iconv from "iconv-lite";

const TEMP_DIR = "temp_uploads";
const FINAL_DIR = "uploads";

// Tạo thư mục nếu chưa tồn tại
if (!fsSync.existsSync(TEMP_DIR)) {
  fsSync.mkdirSync(TEMP_DIR, { recursive: true });
}
if (!fsSync.existsSync(FINAL_DIR)) {
  fsSync.mkdirSync(FINAL_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
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
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
}).fields([
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage", maxCount: 1 },
  { name: "attachedFile", maxCount: 10 },
  { name: "completedFile", maxCount: 15 },
]);

async function processAndSaveFile(file, prefix, requestTimestamp) {
  const isImage = file.mimetype.startsWith("image/");
  const tempPath = file.path;
  let filename, finalPath;

  // FIX encoding tên file gốc (rất quan trọng cho tiếng Việt)
  let originalName = file.originalname;
  try {
    // Browser thường gửi sai encoding (latin1 thay vì utf8)
    const buffer = Buffer.from(originalName, "latin1");
    originalName = iconv.decode(buffer, "utf8");
  } catch (e) {
    console.warn(`Không fix encoding được cho file: ${file.originalname}`);
  }

  try {
    if (isImage) {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`Ảnh "${originalName}" vượt quá 10MB`);
      }

      let image = sharp(tempPath);
      const meta = await image.metadata();

      if (!["jpeg", "png", "webp"].includes(meta.format)) {
        throw new Error(`File "${originalName}" không phải ảnh hợp lệ`);
      }

      image = image.rotate();

      if (meta.width && meta.width > 1280) {
        image = image.resize(1280, null, {
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      const buffer = await image.webp({ quality: 72, effort: 4 }).toBuffer();
      filename = `${prefix}-${requestTimestamp}-${Math.floor(
        Math.random() * 10000
      )}.webp`;
      finalPath = path.join(FINAL_DIR, filename);

      await fs.writeFile(finalPath, buffer);
      await fs.unlink(tempPath).catch(() => {});
    } else {
      const ext = path.extname(originalName);
      let base = path
        .basename(originalName, ext)
        .replace(/[\/\\:*?"<>|]/g, "_")
        .replace(/\s+/g, " ")
        .trim();

      if (base.length > 200) {
        base = base.slice(0, 200);
      }

      filename = `${base}-${requestTimestamp}-${Math.floor(
        Math.random() * 10000
      )}${ext}`;
      finalPath = path.join(FINAL_DIR, filename);

      await fs.rename(tempPath, finalPath);
    }

    const finalSize = (await fs.stat(finalPath)).size;

    return {
      original: originalName, // Tên gốc đã fix để lưu DB hoặc trả về client
      stored: filename,
      mimetype: isImage ? "image/webp" : file.mimetype,
      size: finalSize,
    };
  } catch (err) {
    await fs.unlink(tempPath).catch(() => {});
    throw err;
  }
}

function cleanupTempFiles(filesObj) {
  if (!filesObj) return;
  Object.values(filesObj)
    .flat()
    .forEach((file) => {
      setTimeout(() => fs.unlink(file.path).catch(() => {}), 800);
    });
}

export const uploadWithCompress = (req, res, next) => {
  const requestTimestamp = Date.now();
  req.savedFinalFiles = []; // Scoped theo request

  upload(req, res, async (multerErr) => {
    if (multerErr) {
      cleanupTempFiles(req.files);
      if (multerErr.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File quá lớn! Ảnh ≤ 10MB, tài liệu & nén ≤ 200MB.",
        });
      }
      return res.status(400).json({
        message: multerErr.message || "Lỗi upload file",
      });
    }

    try {
      const processed = {};

      const saveAndTrack = async (file, prefix) => {
        const result = await processAndSaveFile(file, prefix, requestTimestamp);
        req.savedFinalFiles.push(path.join(FINAL_DIR, result.stored));
        return result;
      };

      if (req.files?.beforeImage?.[0]) {
        processed.beforeImage = await saveAndTrack(
          req.files.beforeImage[0],
          "before"
        );
      }

      if (req.files?.afterImage?.[0]) {
        processed.afterImage = await saveAndTrack(
          req.files.afterImage[0],
          "after"
        );
      }

      if (req.files?.attachedFile?.length) {
        processed.attachedFiles = await Promise.all(
          req.files.attachedFile.map((f, i) =>
            saveAndTrack(f, `attach-${i + 1}`)
          )
        );
      }

      if (req.files?.completedFile?.length) {
        processed.completedFiles = await Promise.all(
          req.files.completedFile.map((f, i) =>
            saveAndTrack(f, `complete-${i + 1}`)
          )
        );
      }

      req.processedFiles = processed;
      next();
    } catch (err) {
      console.error("[Upload Processing Error]", {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        ip: req.ip || "unknown",
        filesCount: req.files ? Object.keys(req.files).length : 0,
      });

      cleanupTempFiles(req.files);

      // Cleanup file final đã lưu nếu có lỗi
      if (req.savedFinalFiles?.length) {
        await Promise.allSettled(
          req.savedFinalFiles.map((p) => fs.unlink(p).catch(() => {}))
        );
      }

      return res.status(500).json({
        message: "Lỗi xử lý file: " + err.message,
      });
    }
  });
};
