import { RequestHandler } from "express";

import { UserDocument, SongData } from "../models/User";
import { getAccessToken, fetchSongInfo, playSong } from "../spotify-service";

// save songs to user which are not already in DB
export const getMutlipleSongsInfo: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;

  const { ids } = req.query;

  try {
    const token = await getAccessToken(user);
    const data = await fetchSongInfo(token, ids);

    res.json(data);
  } catch (error) {
    console.error("error getting song info", error);
    res.status(500).send();
  }
};

export const getSingleSongInfo: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;
  const { songId } = req.params;

  try {
    const token = await getAccessToken(user);
    const data = await fetchSongInfo(token, songId);

    res.json(data);
  } catch (error) {
    console.error("error getting song info", error);
    res.status(500).send();
  }
};

export const getSongs: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;
  const { limit = 50, offset = 0 } = req.query;
  const songs = user.songs.slice(offset, offset + limit);

  const ids: string = songs.map(song => song.spotifyId).join(",");

  const songMap: { [x: string]: SongData } = {};

  for (const song of songs) {
    const { labels, spotifyId }: SongData = song.toObject();
    songMap[spotifyId] = { labels, spotifyId };
  }

  try {
    const token = await getAccessToken(user);
    const data = await fetchSongInfo(token, ids);

    const songRes: ResponseTypes.Song[] = data.tracks.map(track => {
      const artists = track.artists.map(artist => artist.name).join(", ");
      const id = track.linked_from ? track.linked_from.id : track.id;
      const song = songMap[id];

      const { labels, spotifyId } = song;
      return { labels, spotifyId, name: track.name, artists };
    });

    const resBody: ResponseTypes.GetSongsResponse = { songs: songRes };
    res.json(resBody);
  } catch (error) {
    console.error("error getting song info", error);
    res.status(500).send();
  }
};

export const getPlaySong: RequestHandler = async (req, res) => {
  const user = req.user as UserDocument;
  const { songId } = req.params;

  try {
    const token = await getAccessToken(user);
    const data = await fetchSongInfo(token, songId);

    const [song] = data.tracks;
    // song.u
    await playSong(token, song.uri);
    res.send();
  } catch (error) {
    console.error("error getting song info", error);
    res.status(500).send();
  }
};
