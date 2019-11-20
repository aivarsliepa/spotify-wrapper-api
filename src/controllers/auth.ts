import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { UserDocument } from "../models/User";
import { plusSeconds } from "../utils/time";

export const getSpotifyCallback: RequestHandler = (req, res) => {
  const user = req.user as UserDocument;

  const payload = { spotifyId: user.spotifyId };
  const token = jwt.sign(payload, process.env.SECRET_OR_KEY);

  const expires = plusSeconds(new Date(), 120);

  res.cookie("x-jwt", token, { expires });

  res.redirect(process.env.CLIENT_URI);
};
