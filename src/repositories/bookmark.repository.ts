import mongoose from "mongoose";
import { BookmarkModel, IBookmarkDocument } from "../models/bookmark.model";

type LeanBookmark = mongoose.FlattenMaps<IBookmarkDocument> & {
  _id: mongoose.Types.ObjectId;
};

export class BookmarkRepository {
  // ─── Create ────────────────────────────────────────────────────────────────

  async create(userId: string, newsId: string): Promise<IBookmarkDocument> {
    const bookmark = new BookmarkModel({
      user: new mongoose.Types.ObjectId(userId),
      news: new mongoose.Types.ObjectId(newsId),
    });
    return await bookmark.save();
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  async findByUserAndNews(
    userId: string,
    newsId: string
  ): Promise<LeanBookmark | null> {
    return await BookmarkModel.findOne({
      user: userId,
      news: newsId,
    }).lean<LeanBookmark>();
  }

  async findAllByUser(userId: string): Promise<LeanBookmark[]> {
    return await BookmarkModel.find({ user: userId })
      .populate({
        path: "news",
        select:
          "title slug summary thumbnail category views publishedAt createdAt tags",
      })
      .sort({ createdAt: -1 })
      .lean<LeanBookmark[]>();
  }

  async getBookmarkedNewsIds(userId: string): Promise<string[]> {
    const bookmarks = await BookmarkModel.find({ user: userId })
      .select("news")
      .lean<LeanBookmark[]>();
    return bookmarks.map((b) => b.news.toString());
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async delete(userId: string, newsId: string): Promise<LeanBookmark | null> {
    return await BookmarkModel.findOneAndDelete({
      user: userId,
      news: newsId,
    }).lean<LeanBookmark>();
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  async exists(userId: string, newsId: string): Promise<boolean> {
    const doc = await BookmarkModel.findOne({
      user: userId,
      news: newsId,
    }).lean();
    return !!doc;
  }

  async countByUser(userId: string): Promise<number> {
    return await BookmarkModel.countDocuments({ user: userId });
  }
}

export const bookmarkRepository = new BookmarkRepository();