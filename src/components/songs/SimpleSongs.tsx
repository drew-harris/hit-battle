import { Song } from "@prisma/client";
import Image from "next/image";
import AudioAlbumCover from "./AudioAlbumCover";

interface SimpleSongProps {
  song: Song;
  className?: string;
  children?: React.ReactNode;
  onClickTitle?: () => void;
}

export default function SimpleSong({
  song,
  children,
  onClickTitle,
  className,
}: SimpleSongProps) {
  return (
    <div
      key={song.id}
      className={
        "flex items-center justify-between overflow-hidden truncate rounded-md bg-tan-100 p-2 " +
        className
      }
    >
      <div className="flex items-center overflow-hidden truncate">
        {song.albumArt && <AudioAlbumCover song={song} />}
        <div className="ml-2 truncate">
          <p
            className={`truncate font-bold ${
              onClickTitle ? "cursor-pointer hover:underline" : "null"
            }`}
            onClick={onClickTitle}
          >
            {song.title}
          </p>
          <p className="text-sm">{song.artist}</p>
        </div>
      </div>
      {children && <div className="ml-4 flex items-center">{children}</div>}
    </div>
  );
}
