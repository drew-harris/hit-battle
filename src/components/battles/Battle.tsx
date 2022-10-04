import { useState } from "react";
import useHasVoted from "../../hooks/useHasVoted";
import { usePreviousVotes } from "../../stores/alreadyVoted";
import { useNotifications } from "../../stores/notifications";
import { BattleWithSong } from "../../types/battle";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import SimpleSong from "../admin/SimpleSong";
import Button from "../input/Button";

interface BattleProps {
  battle: inferQueryOutput<"battles.today">[number];
  className?: string;
}

export default function SimpleBattle({ battle, className }: BattleProps) {
  const addId = usePreviousVotes((state) => state.addId);
  const hasVoted = useHasVoted(battle.id);
  const sendError = useNotifications((state) => state.sendError);
  const client = trpc.useContext();

  const castVoteMutation = trpc.useMutation(["votes.cast-vote"]);
  const { data: votes } = trpc.useQuery(["votes.votes", battle.id]);
  const [totalVotes, setTotalVotes] = useState(battle._count.votes);

  const castVote = async (songId: string) => {
    await castVoteMutation.mutate(
      {
        battleId: battle.id,
        forSongId: songId,
      },
      {
        onSuccess: () => {
          addId(battle.id);
          setTotalVotes((prev) => prev + 1);
          client.invalidateQueries(["votes.votes", battle.id]);
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
            {hasVoted === "voted" && votes ? (
              <PercentDisplay
                count={
                  votes?.find((vote) => vote.forId === song.id)?._count.forId ||
                  0
                }
                total={totalVotes}
              />
            ) : (
              <Button onClick={() => castVote(song.id)}>Vote</Button>
            )}
          </SimpleSong>
        ))}
      </div>
    </div>
  );
}

const PercentDisplay = ({ count, total }: { count: number; total: number }) => {
  return (
    <div className="text-xl">
      {Math.round(((count || 0) / total || 0) * 100)}%
      <div className="text-right text-xs">{count}</div>
    </div>
  );
};
