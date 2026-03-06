import { NewsCategory, NewsStatus } from "../types/news.type";

export interface CreateNewsDto {
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  tags?: string[];
  status?: NewsStatus;
  isFeatured?: boolean;
}

export interface UpdateNewsDto {
  title?: string;
  summary?: string;
  content?: string;
  category?: NewsCategory;
  tags?: string[];
  status?: NewsStatus;
  isFeatured?: boolean;
}

// Validation helpers
export const validateCreateNewsDto = (
  data: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (data.title.trim().length > 200) {
    errors.push("Title cannot exceed 200 characters");
  }

  if (!data.summary || typeof data.summary !== "string" || data.summary.trim().length === 0) {
    errors.push("Summary is required");
  } else if (data.summary.trim().length > 500) {
    errors.push("Summary cannot exceed 500 characters");
  }

  if (!data.content || typeof data.content !== "string" || data.content.trim().length === 0) {
    errors.push("Content is required");
  }

  if (!data.category || !Object.values(NewsCategory).includes(data.category)) {
    errors.push(
      `Category must be one of: ${Object.values(NewsCategory).join(", ")}`
    );
  }

  if (data.status && !Object.values(NewsStatus).includes(data.status)) {
    errors.push(
      `Status must be one of: ${Object.values(NewsStatus).join(", ")}`
    );
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array of strings");
  }

  return { valid: errors.length === 0, errors };
};

export const validateUpdateNewsDto = (
  data: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("Title cannot be empty");
    } else if (data.title.trim().length > 200) {
      errors.push("Title cannot exceed 200 characters");
    }
  }

  if (data.summary !== undefined) {
    if (typeof data.summary !== "string" || data.summary.trim().length === 0) {
      errors.push("Summary cannot be empty");
    } else if (data.summary.trim().length > 500) {
      errors.push("Summary cannot exceed 500 characters");
    }
  }

  if (data.content !== undefined) {
    if (typeof data.content !== "string" || data.content.trim().length === 0) {
      errors.push("Content cannot be empty");
    }
  }

  if (data.category !== undefined && !Object.values(NewsCategory).includes(data.category)) {
    errors.push(
      `Category must be one of: ${Object.values(NewsCategory).join(", ")}`
    );
  }

  if (data.status !== undefined && !Object.values(NewsStatus).includes(data.status)) {
    errors.push(
      `Status must be one of: ${Object.values(NewsStatus).join(", ")}`
    );
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array of strings");
  }

  return { valid: errors.length === 0, errors };
};
