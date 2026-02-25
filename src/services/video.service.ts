import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { videoRepository } from "../repositories/video.repository";
import { CreateVideoDto, UpdateVideoDto } from "../dtos/video.dto";
import { IVideoQuery, VideoStatus } from "../types/video.type";
import { HttpError } from "../errors/http-error";
import { IVideoDocument } from "../models/video.model";
import mongoose from "mongoose";

type LeanVideo = mongoose.FlattenMaps<IVideoDocument> & { _id: mongoose.Types.ObjectId };

export class VideoService {

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    const exists = await videoRepository.slugExists(slug, excludeId);
    if (exists) {
      slug = `${slug}-${uuidv4().split("-")[0]}`;
    }
    return slug;
  }

  async createVideo(
    dto: CreateVideoDto,
    authorId: string,
    thumbnailPath?: string
  ): Promise<IVideoDocument> {
    const slug = await this.generateUniqueSlug(dto.title);

    return await videoRepository.create({
      ...dto,
      slug,
      author: new mongoose.Types.ObjectId(authorId),
      thumbnail: thumbnailPath,
      tags: dto.tags || [],
      status: dto.status || VideoStatus.DRAFT,
      isFeatured: dto.isFeatured || false,
      views: 0,
    });
  }

  async getVideoById(id: string): Promise<LeanVideo> {
    const video = await videoRepository.findById(id);
    if (!video) throw new HttpError(404, "Video not found");
    return video;
  }

  async getVideoBySlug(slug: string): Promise<LeanVideo> {
    const video = await videoRepository.findBySlug(slug);
    if (!video) throw new HttpError(404, "Video not found");
    videoRepository.incrementViews(video._id.toString()).catch(() => {});
    return video;
  }

  async getAllVideos(query: IVideoQuery) {
    return await videoRepository.findAll(query);
  }

  async getPublishedVideos(query: IVideoQuery) {
    return await videoRepository.findAll({
      ...query,
      status: VideoStatus.PUBLISHED,
    });
  }

  async getLatestVideos(limit: number = 5): Promise<LeanVideo[]> {
    return await videoRepository.findLatestPublished(limit);
  }

  async getFeaturedVideos(limit: number = 5): Promise<LeanVideo[]> {
    return await videoRepository.findFeatured(limit);
  }

  async getVideosByCategories(limit: number = 3) {
    return await videoRepository.findLatestByCategory(limit);
  }

  async updateVideo(
    id: string,
    dto: UpdateVideoDto,
    thumbnailPath?: string
  ): Promise<LeanVideo> {
    const existing = await videoRepository.findById(id);
    if (!existing) throw new HttpError(404, "Video not found");

    const updateData: Record<string, any> = { ...dto };

    if (dto.title) {
      updateData.slug = await this.generateUniqueSlug(dto.title, id);
    }

    if (thumbnailPath) {
      updateData.thumbnail = thumbnailPath;
    }

    if (dto.status === VideoStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await videoRepository.update(id, updateData);
    if (!updated) throw new HttpError(404, "Video not found after update");
    return updated;
  }

  async deleteVideo(id: string): Promise<void> {
    const existing = await videoRepository.findById(id);
    if (!existing) throw new HttpError(404, "Video not found");
    await videoRepository.delete(id);
  }

  async publishVideo(id: string): Promise<LeanVideo> {
    const existing = await videoRepository.findById(id);
    if (!existing) throw new HttpError(404, "Video not found");

    const updated = await videoRepository.update(id, {
      status: VideoStatus.PUBLISHED,
      publishedAt: existing.publishedAt || new Date(),
    });
    if (!updated) throw new HttpError(500, "Failed to publish video");
    return updated;
  }

  async archiveVideo(id: string): Promise<LeanVideo> {
    const existing = await videoRepository.findById(id);
    if (!existing) throw new HttpError(404, "Video not found");

    const updated = await videoRepository.update(id, {
      status: VideoStatus.ARCHIVED,
    });
    if (!updated) throw new HttpError(500, "Failed to archive video");
    return updated;
  }

  async toggleFeatured(id: string): Promise<LeanVideo> {
    const existing = await videoRepository.findById(id);
    if (!existing) throw new HttpError(404, "Video not found");

    const updated = await videoRepository.update(id, {
      isFeatured: !existing.isFeatured,
    });
    if (!updated) throw new HttpError(500, "Failed to update featured status");
    return updated;
  }
}

export const videoService = new VideoService();
