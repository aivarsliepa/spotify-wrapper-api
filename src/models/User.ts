import { Schema, model, Document } from "mongoose";

import { songSchema } from "./Song";

export interface IUserDocument extends Document {
  spotifyId: string;
  spotifyToken: string;
  spotifyRefreshToken: string;
  spotifyTokenExpires: Date;
}

const userSchema = new Schema({
  spotifyId: { required: true, type: String, unique: true },
  spotifyToken: { required: true, type: String },
  spotifyRefreshToken: { required: true, type: String },
  spotifyTokenExpires: { required: true, type: Date },
  songs: [songSchema]
});

const User = model<IUserDocument>("User", userSchema);

export default User;
