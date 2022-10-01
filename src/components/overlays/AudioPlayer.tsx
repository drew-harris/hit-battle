import { faPause, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import { useState } from "react";
import { useAudioStore } from "../../stores/audio";

export default function AudioPlayer() {
  const currentSong = useAudioStore((state) => state.currentSong);
  const paused = useAudioStore((state) => state.paused);
  const togglePause = useAudioStore((state) => state.togglePause);
  const stop = useAudioStore((state) => state.stop);
  const showPlayer = useAudioStore((state) => state.showPlayer);

  return (
    <Transition
      className="fixed bottom-0 left-0 right-0 z-50"
      show={showPlayer}
      enter="transition-all ease-out duration-300"
      enterFrom="transform opacity-0 translate-x-[-100%]"
      enterTo="transform opacity-100 translate-x-0"
      leave="transition-all ease-in duration-300"
      leaveTo="transform translate-x-[-100%]"
      leaveFrom="transform translate-x-0"
    >
      <div className="fixed bottom-0 right-0 left-0 flex items-center justify-between gap-3 rounded bg-tan-100 p-2 shadow-lg md:right-auto md:bottom-4 md:left-4">
        <div className="flex gap-3 truncate">
          {currentSong?.albumArt && (
            <div className="relative h-12 w-12 shrink-0 rounded-md">
              <Image
                alt={currentSong?.title}
                src={currentSong?.albumArt || ""}
                loading="lazy"
                placeholder="blur"
                blurDataURL={currentSong?.loaderAlbumArt || " "}
                layout="fill"
                className="rounded-md"
              />
            </div>
          )}
          <div className="truncate">
            <div className="truncate font-bold">{currentSong?.title}</div>
            <div className="">{currentSong?.artist}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <div onClick={togglePause} className="w-8 p-2 pl-3">
            {paused ? (
              <FontAwesomeIcon icon={faPlay} size="lg" />
            ) : (
              <FontAwesomeIcon icon={faPause} size="lg" />
            )}
          </div>
          <div onClick={stop} className="w-8 p-2">
            <FontAwesomeIcon icon={faStop} size="lg" />
          </div>
        </div>
      </div>
    </Transition>
  );
}
