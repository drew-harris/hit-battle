import { useRouter } from "next/router";
import { MatchWithSong } from "../../types/match";
import SimpleSong from "../songs/SimpleSongs";

export default function SimpleMatch({
  match,
  showDate = false,
  className,
  chidren,
}: {
  match: MatchWithSong;
  showDate?: boolean;
  className?:       string;
  chidren?: React.ReactNode;
}) {
  const router = useRouter();
  return (

        <div
      className={
        "flex  flex-col rounded-md border border-white bg-tan-100 p-2 shadow-md " +
        className
      }
    >
      {showDate && (
        <div className="mb-2 text-center">
          {match.startDate.toLocaleString()}
        </div>
      )}
      {match.title && (
        <div className="text-center text-2xl font-bold">{match.title}</div>
      )}
      <div
        className={`flex flex-col md:grid grid-cols-${match.songs.length} gap-2`}
      >
        {match.songs.map((song) => (
          <SimpleSong
            onClickTitle={() => router.push("/admin/songs/" + song.id)}
            song={song}
            key={song.id}
            className="bg-tan-200"
          />
        ))}
      </div>
      {chidren && <div className="flex items-center">{chidren}</div>}
    </div>
  );
}
