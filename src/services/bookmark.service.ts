
import { bookmarkRepository } from "../repositories/bookmark.repository";
import { HttpError } from "../errors/http-error";
import NewsModel from "../models/news.model";
import { IBookmarkDocument } from "../models/bookmark.model";
import mongoose from "mongoose";

type LeanBookmark = mongoose.FlattenMaps<IBookmarkDocument> & {
  _id: mongoose.Types.ObjectId;
};

export class BookmarkService {

  // ─── Add Bookmark ──────────────────────────────────────────────────────────

  async addBookmark(userId: string, newsId: string): Promise<IBookmarkDocument> {
    const newsExists = await NewsModel.findById(newsId).lean();
    if (!newsExists) throw new HttpError(404, "News not found");

    const alreadyBookmarked = await bookmarkRepository.exists(userId, newsId);
    if (alreadyBookmarked) throw new HttpError(409, "News already bookmarked");

    return await bookmarkRepository.create(userId, newsId);
  }

  // ─── Remove Bookmark ───────────────────────────────────────────────────────

  async removeBookmark(userId: string, newsId: string): Promise<void> {
    const deleted = await bookmarkRepository.delete(userId, newsId);
    if (!deleted) throw new HttpError(404, "Bookmark not found");
  }

  // ─── Get User Bookmarks ────────────────────────────────────────────────────

  async getUserBookmarks(userId: string): Promise<LeanBookmark[]> {
    const bookmarks = await bookmarkRepository.findAllByUser(userId);
    return bookmarks.filter((b) => b.news !== null);
  }

  // ─── Check Bookmark Status ─────────────────────────────────────────────────

  async isBookmarked(userId: string, newsId: string): Promise<boolean> {
    return await bookmarkRepository.exists(userId, newsId);
  }

  // ─── Get Bookmarked News IDs ───────────────────────────────────────────────

  async getBookmarkedNewsIds(userId: string): Promise<string[]> {
    return await bookmarkRepository.getBookmarkedNewsIds(userId);
  }
}

export const bookmarkService = new BookmarkService();