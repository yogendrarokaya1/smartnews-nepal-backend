import { VideoCategory, VideoStatus } from "../types/video.type";

export interface CreateVideoDto {
  title: string;
  description: string;
  videoUrl: string;
  category: VideoCategory;
  tags?: string[];
  status?: VideoStatus;
  isFeatured?: boolean;
  duration?: number;
}

export interface UpdateVideoDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  category?: VideoCategory;
  tags?: string[];
  status?: VideoStatus;
  isFeatured?: boolean;
  duration?: number;
}

export const validateCreateVideoDto = (
  data: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (data.title.trim().length > 200) {
    errors.push("Title cannot exceed 200 characters");
  }

  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    errors.push("Description is required");
  } else if (data.description.trim().length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  if (!data.videoUrl || typeof data.videoUrl !== "string" || data.videoUrl.trim().length === 0) {
    errors.push("Video URL is required");
  }

  if (!data.category || !Object.values(VideoCategory).includes(data.category)) {
    errors.push(
      `Category must be one of: ${Object.values(VideoCategory).join(", ")}`
    );
  }

  if (data.status && !Object.values(VideoStatus).includes(data.status)) {
    errors.push(
      `Status must be one of: ${Object.values(VideoStatus).join(", ")}`
    );
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array of strings");
  }

  if (data.duration !== undefined && (typeof data.duration !== "number" || data.duration < 0)) {
    errors.push("Duration must be a positive number");
  }

  return { valid: errors.length === 0, errors };
};

export const validateUpdateVideoDto = (
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

  if (data.description !== undefined) {
    if (typeof data.description !== "string" || data.description.trim().length === 0) {
      errors.push("Description cannot be empty");
    } else if (data.description.trim().length > 1000) {
      errors.push("Description cannot exceed 1000 characters");
    }
  }

  if (data.videoUrl !== undefined) {
    if (typeof data.videoUrl !== "string" || data.videoUrl.trim().length === 0) {
      errors.push("Video URL cannot be empty");
    }
  }

  if (data.category !== undefined && !Object.values(VideoCategory).includes(data.category)) {
    errors.push(
      `Category must be one of: ${Object.values(VideoCategory).join(", ")}`
    );
  }

  if (data.status !== undefined && !Object.values(VideoStatus).includes(data.status)) {
    errors.push(
      `Status must be one of: ${Object.values(VideoStatus).join(", ")}`
    );
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array of strings");
  }

  if (data.duration !== undefined && (typeof data.duration !== "number" || data.duration < 0)) {
    errors.push("Duration must be a positive number");
  }

  return { valid: errors.length === 0, errors };
};
