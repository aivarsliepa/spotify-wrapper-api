import { RequestHandler } from "express";

import { UserDocument } from "../models/User";
import { getAccessToken, fetchSongInfo } from "../spotify-service";

// save songs to user which are not already in DB
export const getMutlipleSongsInfo: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;

  try {
    const token = await getAccessToken(user);
    const ids = user.songs.slice(0, 50).map(song => song.spotifyId);
    const data = await fetchSongInfo(token, ids);

    res.json(data);
  } catch (error) {
    console.error("error getting song info", error);
    res.status(500).send();
  }
};

export const getSingleSongInfo: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;

  try {
    const token = await getAccessToken(user);
    const data = await fetchSongInfo(token, [req.params.songId]);

    res.json(data);
  } catch (error) {
    console.error("error getting song info", error);
    res.status(500).send();
  }
};
