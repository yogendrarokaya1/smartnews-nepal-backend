import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { newsRepository } from "../repositories/news.repository";
import { CreateNewsDto, UpdateNewsDto } from "../dtos/news.dto";
import { INewsQuery, NewsStatus } from "../types/news.type";
import { HttpError } from "../errors/http-error";
import { INewsDocument } from "../models/news.model";
import mongoose from "mongoose";

type LeanNews = mongoose.FlattenMaps<INewsDocument> & { _id: mongoose.Types.ObjectId };

export class NewsService {

  // ─── Slug Generation ───────────────────────────────────────────────────────

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    const exists = await newsRepository.slugExists(slug, excludeId);
    if (exists) {
      slug = `${slug}-${uuidv4().split("-")[0]}`;
    }
    return slug;
  }

  // ─── Create ────────────────────────────────────────────────────────────────

  async createNews(
    dto: CreateNewsDto,
    authorId: string,
    thumbnailPath?: string
  ): Promise<INewsDocument> {
    const slug = await this.generateUniqueSlug(dto.title);

    return await newsRepository.create({
      ...dto,
      slug,
      author: new mongoose.Types.ObjectId(authorId),
      thumbnail: thumbnailPath,
      tags: dto.tags || [],
      status: dto.status || NewsStatus.DRAFT,
      isFeatured: false,
      views: 0,
    });
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  async getNewsById(id: string): Promise<LeanNews> {
    const news = await newsRepository.findById(id);
    if (!news) throw new HttpError(404, "News not found");
    return news;
  }

  async getNewsBySlug(slug: string): Promise<LeanNews> {
    const news = await newsRepository.findBySlug(slug);
    if (!news) throw new HttpError(404, "News not found");
    newsRepository.incrementViews(news._id.toString()).catch(() => {});
    return news;
  }

  async getAllNews(query: INewsQuery) {
    return await newsRepository.findAll(query);
  }

  async getPublishedNews(query: INewsQuery) {
    return await newsRepository.findAll({
      ...query,
      status: NewsStatus.PUBLISHED,
    });
  }

  async getLatestNews(limit: number = 5): Promise<LeanNews[]> {
    return await newsRepository.findLatestPublished(limit);
  }

  async getFeaturedNews(limit: number = 5): Promise<LeanNews[]> {
    return await newsRepository.findFeatured(limit);
  }

  async getNewsByCategories(limit: number = 5) {
    return await newsRepository.findLatestByCategory(limit);
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  // No ownership check — only admin reaches this via route middleware
  async updateNews(
    id: string,
    dto: UpdateNewsDto,
    thumbnailPath?: string
  ): Promise<LeanNews> {
    const existing = await newsRepository.findById(id);
    if (!existing) throw new HttpError(404, "News not found");

    const updateData: Record<string, any> = { ...dto };

    if (dto.title) {
      updateData.slug = await this.generateUniqueSlug(dto.title, id);
    }

    if (thumbnailPath) {
      updateData.thumbnail = thumbnailPath;
    }

    if (dto.status === NewsStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await newsRepository.update(id, updateData);
    if (!updated) throw new HttpError(404, "News not found after update");
    return updated;
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  // No ownership check — only admin reaches this via route middleware
  async deleteNews(id: string): Promise<void> {
    const existing = await newsRepository.findById(id);
    if (!existing) throw new HttpError(404, "News not found");
    await newsRepository.delete(id);
  }

  // ─── Admin Actions ─────────────────────────────────────────────────────────

  async publishNews(id: string): Promise<LeanNews> {
    const existing = await newsRepository.findById(id);
    if (!existing) throw new HttpError(404, "News not found");

    const updated = await newsRepository.update(id, {
      status: NewsStatus.PUBLISHED,
      publishedAt: existing.publishedAt || new Date(),
    });
    if (!updated) throw new HttpError(500, "Failed to publish news");
    return updated;
  }

  async archiveNews(id: string): Promise<LeanNews> {
    const existing = await newsRepository.findById(id);
    if (!existing) throw new HttpError(404, "News not found");

    const updated = await newsRepository.update(id, {
      status: NewsStatus.ARCHIVED,
    });
    if (!updated) throw new HttpError(500, "Failed to archive news");
    return updated;
  }

  async toggleFeatured(id: string): Promise<LeanNews> {
    const existing = await newsRepository.findById(id);
    if (!existing) throw new HttpError(404, "News not found");

    const updated = await newsRepository.update(id, {
      isFeatured: !existing.isFeatured,
    });
    if (!updated) throw new HttpError(500, "Failed to update featured status");
    return updated;
  }
}

export const newsService = new NewsService();