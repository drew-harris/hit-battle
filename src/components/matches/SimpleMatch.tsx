import { MatchWithSong } from "../../types/match";
import Image from "next/image";

export default function SimpleMatch({
  match,
  showDate = false,
  className,
  chidren,
}: {
  match: MatchWithSong;
  showDate?: boolean;
  className?: string;
  chidren?: React.ReactNode;
}) {
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
          <div
            key={song.id}
            className="flex items-center gap-2  rounded-md bg-tan-200 p-2 "
          >
            {song.albumArt && (
              <Image
                width={48}
                height={48}
                src={song.albumArt}
                className="rounded-lg"
              ></Image>
            )}
            <div className="flex-shrink truncate">
              <div className=" truncate font-bold">{song.title}</div>
              <div>{song.artist}</div>
            </div>
          </div>
        ))}
      </div>
      {chidren && <div className="flex items-center">{chidren}</div>}
    </div>
  );
}
