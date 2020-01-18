import { RequestHandler } from "express";

import { UserDocument, SongData, SongDocument } from "../models/User";
import { getAccessToken, fetchAllUserTracks } from "../spotify-service";

// save songs to user which are not already in DB
export const getSync: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;

  try {
    const token = await getAccessToken(user);
    const tracks = await fetchAllUserTracks(token);

    const songMap: { [x: string]: SongData } = {};
    user.songs.forEach(song => (songMap[song.spotifyId] = song));

    let shouldSave = false;
    tracks.forEach(track => {
      if (!(track.spotifyId in songMap)) {
        user.songs.push(track as SongDocument);
        shouldSave = true;
      }
    });

    if (shouldSave) {
      await user.save();
    }

    res.send();
  } catch (error) {
    console.log("error syncing", error);
    res.status(500).send();
  }
};
