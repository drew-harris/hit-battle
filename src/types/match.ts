import { Match, Song } from "@prisma/client";

export type MatchWithSong = Match & {
  songs: Song[];
};
