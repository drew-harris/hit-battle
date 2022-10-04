import { Battle, Song } from "@prisma/client";

export type BattleWithSong = Battle & {
  songs: Song[];
  _count?: {
    _votes: number;
  };
};
