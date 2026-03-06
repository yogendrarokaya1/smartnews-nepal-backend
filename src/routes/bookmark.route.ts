import { Router } from "express";
import { bookmarkController } from "../controllers/bookmark.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const bookmarkRouter = Router();

// All bookmark routes require authentication
bookmarkRouter.use(authorizedMiddleware);

// GET    /api/bookmarks              — get all user bookmarks
bookmarkRouter.get("/", bookmarkController.getUserBookmarks);

// POST   /api/bookmarks/:newsId      — add bookmark
bookmarkRouter.post("/:newsId", bookmarkController.addBookmark);

// DELETE /api/bookmarks/:newsId      — remove bookmark
bookmarkRouter.delete("/:newsId", bookmarkController.removeBookmark);

// GET    /api/bookmarks/:newsId/status — check if bookmarked
bookmarkRouter.get("/:newsId/status", bookmarkController.checkBookmarkStatus);

export default bookmarkRouter;
