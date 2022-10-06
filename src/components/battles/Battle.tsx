import { useState } from "react";
import useHasVoted from "../../hooks/useHasVoted";
import { usePreviousVotes } from "../../stores/alreadyVoted";
import { useNotifications } from "../../stores/notifications";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import SimpleSong from "../admin/SimpleSong";
import Button from "../input/Button";

interface BattleProps {
  battle: inferQueryOutput<"battles.today">[number];
  className?: string;
}

export default function SimpleBattle({
  battle: initialBattle,
  className,
}: BattleProps) {
  const addId = usePreviousVotes((state) => state.addId);
  const hasVoted = useHasVoted(initialBattle.id);
  const sendError = useNotifications((state) => state.sendError);

  const [battle, setBattle] = useState(initialBattle);
  const castVoteMutation = trpc.useMutation(["votes.cast-vote"]);

  const castVote = async (songId: string) => {
    // Optimistic Update
    setBattle((prev) => {
      const oldCounts = prev.voteCounts;
      const index = prev.songs.findIndex((song) => song.id === songId);
      oldCounts[index]++;
      return {
        ...prev,
        voteCounts: oldCounts,
      };
    });
    await castVoteMutation.mutate(
      {
        battleId: initialBattle.id,
        forSongId: songId,
      },
      {
        onSuccess: ({ battle }) => {
          addId(battle.id);
          setBattle(battle);
        },
        onError: (err) => {
          sendError(err.message);
        },
      }
    );
  };

  return (
    <div className={`rounded-md bg-tan-100 p-2 ${className}`}>
      <div className="flex-gap-2 flex flex-col">
        {battle.songs.map((song, index) => (
          <SimpleSong song={song} key={song.id}>
            {hasVoted === "voted" && battle.voteCounts ? (
              <PercentDisplay
                count={battle.voteCounts[index] ?? 0}
                total={battle.voteCounts.reduce((a, b) => a + b, 0)}
              />
            ) : (
              <Button onClick={() => castVote(song.id)}>Vote</Button>
            )}
          </SimpleSong>
        ))}
      </div>
      <div className="text-center text-xs text-tan-400">
        {battle.voteCounts.reduce((a, b) => a + b, 0)} Total Votes
      </div>
    </div>
  );
}

const PercentDisplay = ({ count, total }: { count: number; total: number }) => {
  return (
    <div className="text-xl">
      {Math.round(((count || 0) / total || 0) * 100)}%
      {/* <div className="text-right text-xs">{count}</div> */}
    </div>
  );
};
