import mongoose from "mongoose";

export enum VideoCategory {
  NATIONAL = "national",
  POLITICS = "politics",
  SPORTS = "sports",
  TECHNOLOGY = "technology",
  ENTERTAINMENT = "entertainment",
  BUSINESS = "business",
  HEALTH = "health",
  WORLD = "world",
}

export enum VideoStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface IVideo {
  title: string;
  slug: string;
  description: string;
  videoUrl: string; // YouTube URL or uploaded file path
  thumbnail?: string;
  category: VideoCategory;
  tags: string[];
  author: mongoose.Types.ObjectId;
  status: VideoStatus;
  isFeatured: boolean;
  views: number;
  duration?: number; // in seconds
  publishedAt?: Date;
}

export interface IVideoQuery {
  page?: number;
  limit?: number;
  category?: VideoCategory;
  status?: VideoStatus;
  search?: string;
  isFeatured?: boolean;
  author?: string;
  sortBy?: "createdAt" | "publishedAt" | "views";
  sortOrder?: "asc" | "desc";
}
