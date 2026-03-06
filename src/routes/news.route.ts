import { Router } from "express";
import { newsController } from "../controllers/news.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES – No auth required
// ─────────────────────────────────────────────────────────────────────────────

// Landing page – latest 5 published
router.get("/landing", newsController.getLandingNews);

// Latest news grouped by category
router.get("/categories-preview", newsController.getCategoryPreviews);

// Paginated published news feed
router.get("/", newsController.getPublishedNews);

// Single article by slug (increments views)
router.get("/slug/:slug", newsController.getNewsBySlug);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ONLY – authorizedMiddleware + adminMiddleware on every route
// ─────────────────────────────────────────────────────────────────────────────

// Get ALL news (any status) with full filters
router.get(
  "/admin/all",
  authorizedMiddleware,
  adminMiddleware,
  newsController.getAllNewsAdmin
);

// Get single article by ID (for edit form)
router.get(
  "/admin/:id",
  authorizedMiddleware,
  adminMiddleware,
  newsController.getNewsById
);

// Create article
router.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("thumbnail"),
  newsController.createNews
);

// Update article
router.patch(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("thumbnail"),
  newsController.updateNews
);

// Delete article
router.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  newsController.deleteNews
);

// Publish draft → sets publishedAt
router.patch(
  "/:id/publish",
  authorizedMiddleware,
  adminMiddleware,
  newsController.publishNews
);

// Archive published article
router.patch(
  "/:id/archive",
  authorizedMiddleware,
  adminMiddleware,
  newsController.archiveNews
);

// Toggle isFeatured flag
router.patch(
  "/:id/toggle-featured",
  authorizedMiddleware,
  adminMiddleware,
  newsController.toggleFeatured
);

export default router;