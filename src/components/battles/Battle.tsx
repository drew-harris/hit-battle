import { BattleWithSong } from "../../types/battle";
import SimpleSong from "../admin/SimpleSong";
import Button from "../input/Button";

interface BattleProps {
  battle: BattleWithSong;
  className?: string;
}

export default function SimpleBattle({ battle, className }: BattleProps) {
  // Things to change:
  // Votes
  return (
    <div className={`rounded-md bg-tan-100 p-2 ${className}`}>
      <div className="flex-gap-2 flex flex-col">
        {battle.songs.map((song) => (
          <SimpleSong song={song} key={song.id}>
            <Button>Vote</Button>
          </SimpleSong>
        ))}
      </div>
    </div>
  );
}
