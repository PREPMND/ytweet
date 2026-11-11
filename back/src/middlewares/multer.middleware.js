import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Uploads are staged on disk, pushed to Cloudinary, then deleted. Keep them
// out of ./public so they are never web-servable.
const UPLOAD_DIR = path.resolve("tmp", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename(req, file, cb) {
        // The old code used `file.originalname` verbatim: two users uploading
        // "video.mp4" at the same time overwrote each other, and a crafted
        // name could escape the directory. Use a random name + safe extension.
        const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
        const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : "";
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`);
    },
});

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"]);

export const upload = multer({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB
        files: 2,
    },
    fileFilter(req, file, cb) {
        const isVideoField = file.fieldname === "videoFile";
        const allowed = isVideoField ? VIDEO_TYPES : IMAGE_TYPES;

        if (allowed.has(file.mimetype)) return cb(null, true);

        cb(new Error(`Unsupported file type "${file.mimetype}" for field "${file.fieldname}"`));
    },
});

export { UPLOAD_DIR };
