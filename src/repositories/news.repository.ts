import mongoose from "mongoose";
import NewsModel, { INewsDocument } from "../models/news.model";
import { INewsQuery, NewsStatus } from "../types/news.type";

// Lean documents from Mongoose 9 are plain objects, not Document instances.
// We use this helper type throughout so TS is happy with .lean() returns.
type LeanNews = mongoose.FlattenMaps<INewsDocument> & { _id: mongoose.Types.ObjectId };

export class NewsRepository {
  // ─── Create ────────────────────────────────────────────────────────────────

  async create(data: Partial<INewsDocument>): Promise<INewsDocument> {
    const news = new NewsModel(data);
    return await news.save();
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<LeanNews | null> {
    return await NewsModel.findById(id)
      .populate("author", "name email")
      .lean<LeanNews>();
  }

  async findBySlug(slug: string): Promise<LeanNews | null> {
    return await NewsModel.findOne({ slug })
      .populate("author", "name email")
      .lean<LeanNews>();
  }

  async findAll(query: INewsQuery): Promise<{
    data: LeanNews[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      isFeatured,
      author,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    // Build filter as a plain object — no FilterQuery import needed
    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (author) filter.author = author;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      NewsModel.find(filter)
        .populate("author", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean<LeanNews[]>(),
      NewsModel.countDocuments(filter),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  // Landing page – latest 5 published news
  async findLatestPublished(limit: number = 5): Promise<LeanNews[]> {
    return await NewsModel.find({ status: NewsStatus.PUBLISHED })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean<LeanNews[]>();
  }

  // Featured news
  async findFeatured(limit: number = 5): Promise<LeanNews[]> {
    return await NewsModel.find({
      status: NewsStatus.PUBLISHED,
      isFeatured: true,
    })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean<LeanNews[]>();
  }

  // Latest per category
  async findLatestByCategory(
    limit: number = 5
  ): Promise<Record<string, LeanNews[]>> {
    const { NewsCategory } = await import("../types/news.type");
    const categories = Object.values(NewsCategory);

    const results = await Promise.all(
      categories.map(async (cat) => {
        const items = await NewsModel.find({
          status: NewsStatus.PUBLISHED,
          category: cat,
        })
          .populate("author", "name")
          .sort({ publishedAt: -1 })
          .limit(limit)
          .lean<LeanNews[]>();
        return { cat, items };
      })
    );

    return results.reduce(
      (acc, { cat, items }) => {
        acc[cat] = items;
        return acc;
      },
      {} as Record<string, LeanNews[]>
    );
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  async update(
    id: string,
    data: Record<string, any>
  ): Promise<LeanNews | null> {
    return await NewsModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("author", "name email")
      .lean<LeanNews>();
  }

  async incrementViews(id: string): Promise<void> {
    await NewsModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async delete(id: string): Promise<LeanNews | null> {
    return await NewsModel.findByIdAndDelete(id).lean<LeanNews>();
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: Record<string, any> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const doc = await NewsModel.findOne(filter).lean();
    return !!doc;
  }


}

export const newsRepository = new NewsRepository();