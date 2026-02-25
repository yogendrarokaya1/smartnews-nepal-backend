import mongoose from "mongoose";

// ─── Validate newsId param ─────────────────────────────────────────────────

export function validateNewsId(newsId: string): {
  valid: boolean;
  error?: string;
} {
  if (!newsId) {
    return { valid: false, error: "News ID is required" };
  }
  if (!mongoose.Types.ObjectId.isValid(newsId)) {
    return { valid: false, error: "Invalid News ID format" };
  }
  return { valid: true };
}