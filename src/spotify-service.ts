import { URLSearchParams } from "url";
import fetch from "node-fetch";

import { UserDocument, Song } from "./models/User";
import { plusSeconds } from "./utils/time";
import { wait } from "./utils";

const refreshToken = async (user: UserDocument) => {
  const refresh_token = user.spotifyRefreshToken;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token
  });
  const headers = {
    Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded"
  };

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers,
    body: params
  });

  const { access_token, expires_in } = await res.json();

  user.spotifyToken = access_token;
  user.spotifyTokenExpires = plusSeconds(new Date(), expires_in);

  await user.save();

  return access_token;
};

export const getAccessToken = async (user: UserDocument) => {
  // 1 min window
  if (user.spotifyTokenExpires.getTime() > plusSeconds(new Date(), 60).getTime()) {
    return user.spotifyToken;
  }

  return await refreshToken(user);
};

const fetchData = async <T>(url: string, token: string): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // too many requests code
  if (res.status === 429 && !Number.isNaN(Number(res.headers.get("Retry-After")))) {
    await wait(+res.headers.get("Retry-After"));
    return await fetchData(url, token);
  } else if (res.status !== 200) {
    throw Error(res.statusText);
  }

  return await res.json();
};

const mapSavedTrackToSong = ({ track }: SpotifyApi.SavedTrackObject): Song => ({
  spotifyId: track.id,
  labels: []
});

// UsersSavedTracksResponse
// https://developer.spotify.com/web-api/get-users-saved-tracks/
export const fetchUserSavedTracks = async (token: string): Promise<Song[]> => {
  const allSongs: { [x: string]: Song } = {};

  const params = new URLSearchParams();
  params.append("limit", "50");
  const url = "https://api.spotify.com/v1/me/tracks?" + params.toString();
  const body = await fetchData<SpotifyApi.UsersSavedTracksResponse>(url, token);

  const urls: string[] = [];

  for (let i = 50; i < body.total; i += 50) {
    const params = new URLSearchParams();
    params.append("limit", "50");
    params.append("offset", i.toString());
    urls.push("https://api.spotify.com/v1/me/tracks?" + params.toString());
  }

  const requests = urls.map(async url => {
    const body = await fetchData<SpotifyApi.UsersSavedTracksResponse>(url, token);
    body.items.map(mapSavedTrackToSong).forEach(song => (allSongs[song.spotifyId] = song));
  });

  body.items.map(mapSavedTrackToSong).forEach(song => (allSongs[song.spotifyId] = song));
  await Promise.all(requests);

  return Object.values(allSongs);
};

export const fetchSongsFromAllPlaylists = async (token: string): Promise<Song[]> => {
  const allSongs: Song[] = [];

  const params = new URLSearchParams();
  params.append("limit", "50");
  const url = "https://api.spotify.com/v1/me/playlists?" + params.toString();
  const body = await fetchData<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(url, token);

  const urls: string[] = [];

  for (let i = 50; i < body.total; i += 50) {
    const params = new URLSearchParams();
    params.append("limit", "50");
    params.append("offset", i.toString());
    urls.push("https://api.spotify.com/v1/me/playlists?" + params.toString());
  }

  const requests = urls.map(async url => {
    const body = await fetchData<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(url, token);
    const reqs = body.items.map(async album => {
      const songs = await fetchSongsForPlaylist(token, album.tracks.href);
      allSongs.push(...songs);
    });

    await Promise.all(reqs);
  });

  const reqs = body.items.map(async album => {
    const songs = await fetchSongsForPlaylist(token, album.tracks.href);
    allSongs.push(...songs);
  });

  requests.push(...reqs);

  await Promise.all(requests);

  return allSongs;
};

export const fetchSongsForPlaylist = async (token: string, href: string): Promise<Song[]> => {
  const playlistSongs: Song[] = [];

  const params = new URLSearchParams();
  params.append("limit", "50");
  const url = `${href}?${params.toString()}`;
  const body = await fetchData<SpotifyApi.PlaylistTrackResponse>(url, token);

  const urls: string[] = [];

  for (let i = 50; i < body.total; i += 50) {
    const params = new URLSearchParams();
    params.append("limit", "50");
    params.append("offset", i.toString());
    urls.push(`${href}?${params.toString()}`);
  }

  const requests = urls.map(async url => {
    const body = await fetchData<SpotifyApi.PlaylistTrackResponse>(url, token);
    const songs: Song[] = body.items.map(mapSavedTrackToSong);
    playlistSongs.push(...songs);
  });

  const songs: Song[] = body.items.map(mapSavedTrackToSong);
  playlistSongs.push(...songs);

  await Promise.all(requests);

  return playlistSongs;
};

export const fetchAllUserTracks = async (token: string): Promise<Song[]> => {
  const songs: { [x: string]: Song } = {};

  const saved = await fetchUserSavedTracks(token);
  const playlistTracks = await fetchSongsFromAllPlaylists(token);

  saved.forEach(song => (songs[song.spotifyId] = song));
  playlistTracks.forEach(song => (songs[song.spotifyId] = song));

  return Object.values(songs);
};

export const fetchSongInfo = async (token: string, songIds: string[]) => {
  const params = new URLSearchParams();

  params.append("ids", songIds.join(","));
  params.append("market", "from_token");

  const url = "https://api.spotify.com/v1/tracks?" + params.toString();

  return await fetchData(url, token);
};
