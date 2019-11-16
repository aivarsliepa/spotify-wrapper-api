import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { IUserDocument } from "../models/User";

export const getSpotifyCallback: RequestHandler = (req, res) => {
  const user = req.user as IUserDocument;

  const payload = { spotifyId: user.spotifyId };
  const token = jwt.sign(payload, process.env.SECRET_OR_KEY);

  const expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + 2 * 60 * 1000);

  res.cookie("x-jwt", token, { expires: expiresDate });

  res.redirect(process.env.CLIENT_URI);
};
