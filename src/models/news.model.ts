import mongoose, { Document, Schema } from "mongoose";
import { INews, NewsCategory, NewsStatus } from "../types/news.type";

export interface INewsDocument extends INews, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INewsDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      maxlength: [500, "Summary cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    category: {
      type: String,
      enum: Object.values(NewsCategory),
      required: [true, "Category is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      required: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NewsStatus),
      default: NewsStatus.DRAFT,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
NewsSchema.index({ title: "text", summary: "text", content: "text", tags: "text" });
// Compound indexes for common queries
NewsSchema.index({ status: 1, category: 1, publishedAt: -1 });
NewsSchema.index({ status: 1, isFeatured: 1, publishedAt: -1 });
NewsSchema.index({ author: 1, status: 1 });
NewsSchema.index({ slug: 1 });

const NewsModel = mongoose.model<INewsDocument>("News", NewsSchema);

export default NewsModel;