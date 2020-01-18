declare namespace ResponseTypes {
  interface Song {
    spotifyId: string;
    labels: string[];
    name: string;
    artists: string;
  }

  interface GetSongsResponse {
    songs: Song[];
  }
}
