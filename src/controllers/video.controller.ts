import { Request, Response, NextFunction } from "express";
import { videoService } from "../services/video.service";
import { validateCreateVideoDto, validateUpdateVideoDto } from "../dtos/video.dto";
import { IVideoQuery, VideoCategory } from "../types/video.type";
import { HttpError } from "../errors/http-error";
import { IUser } from "../models/user.model";

export class VideoController {

  // ─── Public Endpoints ──────────────────────────────────────────────────────

  getLatestVideos = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const latest = await videoService.getLatestVideos(limit);
      res.status(200).json({ success: true, data: { latest } });
    } catch (error) {
      next(error);
    }
  };

  getCategoryPreviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const data = await videoService.getVideosByCategories(limit);
      res.status(200).json({
        success: true,
        data,
        categories: Object.values(VideoCategory),
      });
    } catch (error) {
      next(error);
    }
  };

  getPublishedVideos = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: IVideoQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 12, 50),
        category: req.query.category as VideoCategory,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as any) || "publishedAt",
        sortOrder: (req.query.sortOrder as any) || "desc",
      };

      const result = await videoService.getPublishedVideos(query);

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

  getVideoBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const video = await videoService.getVideoBySlug(req.params.slug);
      res.status(200).json({ success: true, data: video });
    } catch (error) {
      next(error);
    }
  };

  // ─── Admin Endpoints ───────────────────────────────────────────────────────

  getAllVideosAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: IVideoQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 10, 50),
        category: req.query.category as VideoCategory,
        status: req.query.status as any,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as any) || "createdAt",
        sortOrder: (req.query.sortOrder as any) || "desc",
      };

      const result = await videoService.getAllVideos(query);

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

  getVideoById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.id);
      res.status(200).json({ success: true, data: video });
    } catch (error) {
      next(error);
    }
  };

  createVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Normalize tags
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

      // Parse duration if string
      if (req.body.duration && typeof req.body.duration === "string") {
        req.body.duration = parseInt(req.body.duration);
      }

      const { valid, errors } = validateCreateVideoDto(req.body);
      if (!valid) throw new HttpError(400, errors.join(", "));

      const user = req.user as IUser;
      const thumbnailPath = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const video = await videoService.createVideo(
        req.body,
        (user as any)._id.toString(),
        thumbnailPath
      );

      res.status(201).json({
        success: true,
        message: "Video created successfully",
        data: video,
      });
    } catch (error) {
      next(error);
    }
  };

  updateVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Normalize tags
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

      // Parse duration if string
      if (req.body.duration && typeof req.body.duration === "string") {
        req.body.duration = parseInt(req.body.duration);
      }

      const { valid, errors } = validateUpdateVideoDto(req.body);
      if (!valid) throw new HttpError(400, errors.join(", "));

      const thumbnailPath = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const video = await videoService.updateVideo(
        req.params.id,
        req.body,
        thumbnailPath
      );

      res.status(200).json({
        success: true,
        message: "Video updated successfully",
        data: video,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await videoService.deleteVideo(req.params.id);
      res.status(200).json({
        success: true,
        message: "Video deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  publishVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const video = await videoService.publishVideo(req.params.id);
      res.status(200).json({
        success: true,
        message: "Video published successfully",
        data: video,
      });
    } catch (error) {
      next(error);
    }
  };

  archiveVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const video = await videoService.archiveVideo(req.params.id);
      res.status(200).json({
        success: true,
        message: "Video archived successfully",
        data: video,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleFeatured = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const video = await videoService.toggleFeatured(req.params.id);
      res.status(200).json({
        success: true,
        message: `Video ${video.isFeatured ? "marked as featured" : "removed from featured"}`,
        data: video,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const videoController = new VideoController();
