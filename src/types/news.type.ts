import mongoose from "mongoose";

export enum NewsCategory {
  NATIONAL = "national",
  POLITICS = "politics",
  SPORTS = "sports",
  TECHNOLOGY = "technology",
  ENTERTAINMENT = "entertainment",
  BUSINESS = "business",
  HEALTH = "health",
  WORLD = "world",
}

export enum NewsStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// Plain data shape — no _id, no createdAt/updatedAt
// Mirrors how UserType is defined in your project
export interface INews {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  thumbnail?: string;
  author: mongoose.Types.ObjectId;
  status: NewsStatus;
  isFeatured: boolean;
  views: number;
  publishedAt?: Date;
}

export interface INewsQuery {
  page?: number;
  limit?: number;
  category?: NewsCategory;
  status?: NewsStatus;
  search?: string;
  isFeatured?: boolean;
  author?: string;
  sortBy?: "createdAt" | "publishedAt" | "views";
  sortOrder?: "asc" | "desc";
}