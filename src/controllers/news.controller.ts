import { Request, Response, NextFunction } from "express";
import { newsService } from "../services/news.service";
import { validateCreateNewsDto, validateUpdateNewsDto } from "../dtos/news.dto";
import { INewsQuery, NewsCategory } from "../types/news.type";
import { HttpError } from "../errors/http-error";
import { IUser } from "../models/user.model";

export class NewsController {

  // ─── Public Endpoints ──────────────────────────────────────────────────────

  /**
   * GET /api/news/landing
   * Latest 5 published articles for the landing page
   */
  getLandingNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const latest = await newsService.getLatestNews(5);
      res.status(200).json({ success: true, data: { latest } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/news/categories-preview?limit=5
   * Latest news grouped by each category
   */
  getCategoryPreviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await newsService.getNewsByCategories(limit);
      res.status(200).json({
        success: true,
        data,
        categories: Object.values(NewsCategory),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/news?page=1&limit=10&category=sports&search=keyword
   * Paginated published news (public feed)
   */
  getPublishedNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: INewsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 10, 50),
        category: req.query.category as NewsCategory,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as any) || "publishedAt",
        sortOrder: (req.query.sortOrder as any) || "desc",
      };

      const result = await newsService.getPublishedNews(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: query.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/news/slug/:slug
   * Single published article by slug (increments views)
   */
  getNewsBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const news = await newsService.getNewsBySlug(req.params.slug);
      res.status(200).json({ success: true, data: news });
    } catch (error) {
      next(error);
    }
  };

  // ─── Admin Endpoints ───────────────────────────────────────────────────────

  /**
   * GET /api/news/admin/all
   * All news regardless of status with full filter support
   */
  getAllNewsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: INewsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 10, 50),
        category: req.query.category as NewsCategory,
        status: req.query.status as any,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as any) || "createdAt",
        sortOrder: (req.query.sortOrder as any) || "desc",
      };

      const result = await newsService.getAllNews(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/news/admin/:id
   * Get article by ID for edit form
   */
  getNewsById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const news = await newsService.getNewsById(req.params.id);
      res.status(200).json({ success: true, data: news });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/news
   * Admin – create article (multipart/form-data for thumbnail)
   */
  createNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Normalize tags from FormData — can arrive as:
      // 1. Already an array (tags[]=a&tags[]=b)
      // 2. JSON string '["a","b"]'
      // 3. Plain comma-separated string "a,b,c" (Postman form-data)
      if (req.body.tags !== undefined) {
        if (Array.isArray(req.body.tags)) {
          // already fine — keep as is
        } else if (typeof req.body.tags === "string") {
          const str = req.body.tags.trim();
          if (str.startsWith("[")) {
            // JSON string
            try { req.body.tags = JSON.parse(str); } catch { req.body.tags = []; }
          } else {
            // comma separated
            req.body.tags = str.split(",").map((t: string) => t.trim()).filter(Boolean);
          }
        }
      }

      const { valid, errors } = validateCreateNewsDto(req.body);
      if (!valid) throw new HttpError(400, errors.join(", "));

      const user = req.user as IUser;
      const thumbnailPath = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const news = await newsService.createNews(
        req.body,
        (user as any)._id.toString(),
        thumbnailPath
      );

      res.status(201).json({
        success: true,
        message: "News article created successfully",
        data: news,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/news/:id
   * Admin – update any article
   */
  updateNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Normalize tags same as createNews
      if (req.body.tags !== undefined) {
        if (Array.isArray(req.body.tags)) {
          // already fine
        } else if (typeof req.body.tags === "string") {
          const str = req.body.tags.trim();
          if (str.startsWith("[")) {
            try { req.body.tags = JSON.parse(str); } catch { req.body.tags = []; }
          } else {
            req.body.tags = str.split(",").map((t: string) => t.trim()).filter(Boolean);
          }
        }
      }

      const { valid, errors } = validateUpdateNewsDto(req.body);
      if (!valid) throw new HttpError(400, errors.join(", "));

      const thumbnailPath = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const news = await newsService.updateNews(
        req.params.id,
        req.body,
        thumbnailPath
      );

      res.status(200).json({
        success: true,
        message: "News article updated successfully",
        data: news,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/news/:id
   * Admin – delete any article
   */
  deleteNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await newsService.deleteNews(req.params.id);
      res.status(200).json({
        success: true,
        message: "News article deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/news/:id/publish
   * Admin – publish a draft article
   */
  publishNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const news = await newsService.publishNews(req.params.id);
      res.status(200).json({
        success: true,
        message: "News published successfully",
        data: news,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/news/:id/archive
   * Admin – archive a published article
   */
  archiveNews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const news = await newsService.archiveNews(req.params.id);
      res.status(200).json({
        success: true,
        message: "News archived successfully",
        data: news,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/news/:id/toggle-featured
   * Admin – toggle featured flag
   */
  toggleFeatured = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const news = await newsService.toggleFeatured(req.params.id);
      res.status(200).json({
        success: true,
        message: `News ${news.isFeatured ? "marked as featured" : "removed from featured"}`,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const newsController = new NewsController();