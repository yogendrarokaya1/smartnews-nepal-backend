import mongoose, { Document, Schema } from "mongoose";
import { IBookmark } from "../types/bookmark.type";

export interface IBookmarkDocument extends IBookmark, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmarkDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    news: {
      type: Schema.Types.ObjectId,
      ref: "News",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can bookmark a news article only once
BookmarkSchema.index({ user: 1, news: 1 }, { unique: true });

export const BookmarkModel = mongoose.model<IBookmarkDocument>(
  "Bookmark",
  BookmarkSchema
);