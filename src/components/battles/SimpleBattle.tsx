import { useRouter } from "next/router";
import { BattleWithSong } from "../../types/battle";
import { trpc } from "../../utils/trpc";
import Button from "../input/Button";
import SimpleSong from "../songs/SimpleSongs";

export default function SimpleBattle({
  battle,
  showDate = false,
  className,
  chidren,
}: {
  battle: BattleWithSong;
  showDate?: boolean;
  className?: string;
  chidren?: React.ReactNode;
}) {
  const router = useRouter();
  const addVoteMutation = trpc.useMutation("admin.add-vote");
  const client = trpc.useContext();
  const addVote = async (forSongId: string) => {
    await addVoteMutation.mutate(
      {
        battleId: battle.id,
        forSongId: forSongId,
      },
      {
        onSuccess: () => {
          client.invalidateQueries(["admin.all-battles"]);
          client.invalidateQueries(["songs.song", battle?.songs[0]?.id]);
          client.invalidateQueries(["songs.song", battle?.songs[1]?.id]);
        },
      }
    );
  };
  return (
    <div
      className={
        "flex  flex-col rounded-md border border-white bg-tan-100 p-2 shadow-md " +
        className
      }
    >
      {showDate && (
        <div className="mb-2 text-center">
          {battle.startDate.toLocaleString()}
        </div>
      )}
      {battle.title && (
        <div className="text-center text-2xl font-bold">{battle.title}</div>
      )}
      <div
        className={`flex flex-col md:grid grid-cols-${battle.songs.length} gap-2`}
      >
        {battle.songs.map((song, index) => (
          <SimpleSong
            onClickTitle={() => router.push("/admin/songs/" + song.id)}
            song={song}
            key={song.id}
            className="bg-tan-200"
          >
            <>
              <Button
                disabled={addVoteMutation.isLoading}
                onClick={() => addVote(song.id)}
              >
                Add vote
              </Button>
              <div className="ml-4 mr-2">{battle.voteCounts[index]}</div>
            </>
          </SimpleSong>
        ))}
      </div>
      {chidren && <div className="flex items-center">{chidren}</div>}
    </div>
  );
}
