import { Request, Response, NextFunction } from "express";
import { bookmarkService } from "../services/bookmark.service";
import { validateNewsId } from "../dtos/bookmark.dto";
import { IUser } from "../models/user.model";

export class BookmarkController {

  /**
   * POST /api/bookmarks/:newsId
   */
  addBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { valid, error } = validateNewsId(req.params.newsId);
      if (!valid) { res.status(400).json({ success: false, message: error }); return; }

      const user = req.user as IUser;
      const bookmark = await bookmarkService.addBookmark(user._id.toString(), req.params.newsId);

      res.status(201).json({ success: true, message: "Bookmarked successfully", data: bookmark });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/bookmarks/:newsId
   */
  removeBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { valid, error } = validateNewsId(req.params.newsId);
      if (!valid) { res.status(400).json({ success: false, message: error }); return; }

      const user = req.user as IUser;
      await bookmarkService.removeBookmark(user._id.toString(), req.params.newsId);

      res.status(200).json({ success: true, message: "Bookmark removed successfully" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/bookmarks
   */
  getUserBookmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser;
      const bookmarks = await bookmarkService.getUserBookmarks(user._id.toString());

      res.status(200).json({ success: true, data: bookmarks, total: bookmarks.length });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/bookmarks/:newsId/status
   */
  checkBookmarkStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { valid, error } = validateNewsId(req.params.newsId);
      if (!valid) { res.status(400).json({ success: false, message: error }); return; }

      const user = req.user as IUser;
      const isBookmarked = await bookmarkService.isBookmarked(user._id.toString(), req.params.newsId);

      res.status(200).json({ success: true, data: { isBookmarked } });
    } catch (error) {
      next(error);
    }
  };
}

export const bookmarkController = new BookmarkController();
