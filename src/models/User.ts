import { Schema, model, Document } from "mongoose";

export type Song = {
  spotifyId: string;
  labels?: string[];
};

export type UserData = {
  spotifyId: string;
  spotifyToken: string;
  spotifyRefreshToken: string;
  spotifyTokenExpires: Date;
  songs: Song[];
  currentList: Song[];
};

export type UserDocument = UserData & Document;

const userSchema = new Schema({
  spotifyId: { required: true, type: String, unique: true },
  spotifyToken: { required: true, type: String },
  spotifyRefreshToken: { required: true, type: String },
  spotifyTokenExpires: { required: true, type: Date },
  songs: [
    {
      spotifyId: String,
      labels: [String]
    }
  ]
});

const User = model<UserDocument>("User", userSchema);

export default User;
