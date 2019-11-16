import { Schema, Document } from "mongoose";

export interface ISongDocument extends Document {
  songId: string;
}

export const songSchema = new Schema({
  songId: { required: true, type: String, unique: true }
});
