import mongoose from "mongoose";
import VideoModel, { IVideoDocument } from "../models/video.model";
import { IVideoQuery, VideoStatus } from "../types/video.type";

type LeanVideo = mongoose.FlattenMaps<IVideoDocument> & { _id: mongoose.Types.ObjectId };

export class VideoRepository {

  async create(data: Partial<IVideoDocument>): Promise<IVideoDocument> {
    const video = new VideoModel(data);
    return await video.save();
  }

  async findById(id: string): Promise<LeanVideo | null> {
    return await VideoModel.findById(id).populate("author", "fullName email").lean<LeanVideo>();
  }

  async findBySlug(slug: string): Promise<LeanVideo | null> {
    return await VideoModel.findOne({ slug, status: VideoStatus.PUBLISHED })
      .populate("author", "fullName email")
      .lean<LeanVideo>();
  }

  async findAll(query: IVideoQuery): Promise<{
    data: LeanVideo[];
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

    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (author) filter.author = new mongoose.Types.ObjectId(author);
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [data, total] = await Promise.all([
      VideoModel.find(filter)
        .populate("author", "fullName email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<LeanVideo[]>(),
      VideoModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findLatestPublished(limit: number = 5): Promise<LeanVideo[]> {
    return await VideoModel.find({ status: VideoStatus.PUBLISHED })
      .populate("author", "fullName email")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean<LeanVideo[]>();
  }

  async findFeatured(limit: number = 5): Promise<LeanVideo[]> {
    return await VideoModel.find({
      status: VideoStatus.PUBLISHED,
      isFeatured: true,
    })
      .populate("author", "fullName email")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean<LeanVideo[]>();
  }

  async findLatestByCategory(limit: number = 3) {
    const categories = Object.values(VideoStatus);
    const results = await Promise.all(
      categories.map(async (cat) => {
        const videos = await VideoModel.find({
          status: VideoStatus.PUBLISHED,
          category: cat,
        })
          .populate("author", "fullName email")
          .sort({ publishedAt: -1 })
          .limit(limit)
          .lean<LeanVideo[]>();
        return { category: cat, videos };
      })
    );

    return results.reduce((acc, { category, videos }) => {
      acc[category] = videos;
      return acc;
    }, {} as Record<string, LeanVideo[]>);
  }

  async update(id: string, data: Record<string, any>): Promise<LeanVideo | null> {
    return await VideoModel.findByIdAndUpdate(id, data, { new: true })
      .populate("author", "fullName email")
      .lean<LeanVideo>();
  }

  async incrementViews(id: string): Promise<void> {
    await VideoModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  async delete(id: string): Promise<LeanVideo | null> {
    return await VideoModel.findByIdAndDelete(id).lean<LeanVideo>();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: Record<string, any> = { slug };
    if (excludeId) filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    const count = await VideoModel.countDocuments(filter);
    return count > 0;
  }
}

export const videoRepository = new VideoRepository();
