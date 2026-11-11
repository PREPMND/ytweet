import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import env from "../env.js";

cloudinary.config({
    cloud_name: env.CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_SECRET_KEY,
});

export const isCloudinaryConfigured = Boolean(
    env.CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_SECRET_KEY
);

/** Delete the staged temp file; never let cleanup mask the real error. */
async function removeLocal(localfilepath) {
    if (!localfilepath) return;
    await fs.unlink(localfilepath).catch(() => {});
}

/**
 * Upload a staged local file and ALWAYS clean it up.
 * Returns the Cloudinary response, or null when there was nothing to upload.
 * Throws when the upload itself fails, so callers can report a real reason
 * (the old version swallowed the error and returned null).
 */
const uploadOnCloudinary = async (localfilepath, folder = "socialsphere") => {
    if (!localfilepath) return null;

    if (!isCloudinaryConfigured) {
        await removeLocal(localfilepath);
        throw new Error("Cloudinary is not configured (CLOUD_NAME / API key / secret missing)");
    }

    try {
        return await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
            folder,
        });
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    } finally {
        // `finally` runs on both paths -- the old code called unlinkSync twice
        // in some flows and threw ENOENT from inside the catch block.
        await removeLocal(localfilepath);
    }
};

/** Best-effort delete of an already-uploaded asset, by its secure URL. */
const destroyByUrl = async (url, resourceType = "image") => {
    if (!url || !isCloudinaryConfigured) return;

    // https://res.cloudinary.com/<cloud>/<type>/upload/v123456/<folder>/<id>.<ext>
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    if (!match) return;

    await cloudinary.uploader
        .destroy(match[1], { resource_type: resourceType })
        .catch((err) => console.warn(`[cloudinary] destroy failed: ${err.message}`));
};

export { uploadOnCloudinary, destroyByUrl };
