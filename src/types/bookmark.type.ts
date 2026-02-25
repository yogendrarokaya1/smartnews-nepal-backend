import mongoose from "mongoose";

export interface IBookmark {
  user: mongoose.Types.ObjectId;
  news: mongoose.Types.ObjectId;
  createdAt?: Date;
}