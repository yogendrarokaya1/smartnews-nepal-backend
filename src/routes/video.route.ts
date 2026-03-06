import { Router } from "express";
import { videoController } from "../controllers/video.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES – No auth required
// ─────────────────────────────────────────────────────────────────────────────

// Latest videos
router.get("/latest", videoController.getLatestVideos);

// Latest videos grouped by category
router.get("/categories-preview", videoController.getCategoryPreviews);

// Paginated published videos feed
router.get("/", videoController.getPublishedVideos);

// Single video by slug (increments views)
router.get("/slug/:slug", videoController.getVideoBySlug);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ONLY – authorizedMiddleware + adminMiddleware on every route
// ─────────────────────────────────────────────────────────────────────────────

// Get ALL videos (any status) with full filters
router.get(
  "/admin/all",
  authorizedMiddleware,
  adminMiddleware,
  videoController.getAllVideosAdmin
);

// Get single video by ID (for edit form)
router.get(
  "/admin/:id",
  authorizedMiddleware,
  adminMiddleware,
  videoController.getVideoById
);

// Create video
router.post(
  "/admin",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("thumbnail"),
  videoController.createVideo
);

// Update video
router.patch(
  "/admin/:id",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("thumbnail"),
  videoController.updateVideo
);

// Delete video
router.delete(
  "/admin/:id",
  authorizedMiddleware,
  adminMiddleware,
  videoController.deleteVideo
);

// Publish draft → sets publishedAt
router.patch(
  "/admin/:id/publish",
  authorizedMiddleware,
  adminMiddleware,
  videoController.publishVideo
);

// Archive published video
router.patch(
  "/admin/:id/archive",
  authorizedMiddleware,
  adminMiddleware,
  videoController.archiveVideo
);

// Toggle isFeatured flag
router.patch(
  "/admin/:id/toggle-featured",
  authorizedMiddleware,
  adminMiddleware,
  videoController.toggleFeatured
);

export default router;
