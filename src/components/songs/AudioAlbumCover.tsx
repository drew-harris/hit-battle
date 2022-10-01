import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Song } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAudioStore } from "../../stores/audio";

interface AudioAlbumCoverProps {
  song: Song;
}

export default function AudioAlbumCover({ song }: AudioAlbumCoverProps) {
  const start = useAudioStore((state) => state.start);
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setTransitionEnabled(true);
    }, 100);
  });

  return (
    <>
      {song.albumArt && (
        <div className="group relative h-10 w-10 shrink-0 grow overflow-hidden rounded-md">
          <Image
            alt={song.title}
            src={song.albumArt}
            loading="lazy"
            placeholder="blur"
            blurDataURL={song.loaderAlbumArt || " "}
            layout="fill"
            className={`rounded-md ${
              song.previewUrl && transitionEnabled
                ? "transition-all duration-300 group-hover:scale-110"
                : ""
            }`}
          />
          <div
            onClick={() => start(song)}
            className="relative grid h-full w-full cursor-pointer place-items-center rounded-md bg-black/50 opacity-0 transition-all duration-150 group-hover:opacity-100"
          >
            <FontAwesomeIcon color="white" icon={faPlay} size="lg" />
          </div>
        </div>
      )}
    </>
  );
}
