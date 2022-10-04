import { useEffect, useState } from "react";
import { usePreviousVotes } from "../stores/alreadyVoted";

export type VotedState = "loading" | "voted" | "notyet";

export default function useHasVoted(matchId: string) {
  const battleIds = usePreviousVotes((state) => state.battleIds);
  const [hasVoted, setHasVoted] = useState<VotedState>("loading");

  useEffect(() => {
    if (battleIds !== null) {
      setHasVoted(battleIds.includes(matchId) ? "voted" : "notyet");
    } else {
      setHasVoted("loading");
    }
  }, [battleIds, matchId]);

  return hasVoted;
}
