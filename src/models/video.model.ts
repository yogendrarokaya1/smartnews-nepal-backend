import mongoose, { Document, Schema } from "mongoose";
import { IVideo, VideoCategory, VideoStatus } from "../types/video.type";

const VideoSchema: Schema = new Schema<IVideo>(
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
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    thumbnail: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      enum: Object.values(VideoCategory),
      required: [true, "Category is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VideoStatus),
      default: VideoStatus.DRAFT,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: false,
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
VideoSchema.index({ title: "text", description: "text", tags: "text" });
// Compound indexes
VideoSchema.index({ status: 1, category: 1, publishedAt: -1 });
VideoSchema.index({ status: 1, isFeatured: 1, publishedAt: -1 });
VideoSchema.index({ author: 1, status: 1 });
VideoSchema.index({ slug: 1 });

export interface IVideoDocument extends IVideo, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VideoModel = mongoose.model<IVideoDocument>("Video", VideoSchema);

export default VideoModel;
