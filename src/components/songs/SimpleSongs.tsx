import { Song } from "@prisma/client";
import Image from "next/image";

interface SimpleSongProps {
  song: Song;
  className?: string;
  children?: React.ReactNode;
}

export default function SimpleSong({
  song,
  children,
  className,
}: SimpleSongProps) {
  return (
    <div
      key={song.id}
      className={
        "flex items-center justify-between overflow-hidden rounded-md bg-tan-100 p-2 " +
        className
      }
    >
      <div className="flex items-center truncate">
        {song.albumArt && (
          <Image
            alt={song.title}
            src={song.albumArt}
            placeholder="blur"
            loading="lazy"
            blurDataURL={song.loaderAlbumArt || ""}
            height={48}
            width={48}
            className="h-10 w-10 rounded-md"
          />
        )}
        <div className="ml-2 truncate">
          <p className="truncate font-bold">{song.title}</p>
          <p className="text-sm">{song.artist}</p>
        </div>
      </div>
      {children && <div className="ml-4 flex items-center">{children}</div>}
    </div>
  );
}
