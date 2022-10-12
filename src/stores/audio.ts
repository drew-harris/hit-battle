import { Song } from "@prisma/client";
import create from "zustand";

interface AudioState {
  audio: HTMLAudioElement | null;
  start: (song: Song) => void;
  pause: () => void;
  stop: () => void;
  togglePause: () => void;
  currentSong: Song | null;
  showPlayer: boolean;
  paused: boolean;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audio: null,
  currentSong: null,
  paused: true,
  showPlayer: false,

  start(song) {
    console.log("starting");
    const currentAudio = get().audio;
    if (currentAudio) {
      currentAudio.pause();
    }
    if (!song.previewUrl) return;
    const audio = new Audio(song.previewUrl);
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.pause();
      set({ paused: true });
    });
    audio.addEventListener("change", () => set({ paused: audio.paused }));
    audio.load();
    // Play when loaded
    audio.addEventListener("canplaythrough", () => {
      audio.play();
      set({ paused: false });
    });

    set({ audio, currentSong: song, paused: false, showPlayer: true });
  },

  pause() {
    console.log("stopping");
    const audio = get().audio;
    if (audio) {
      audio.pause();
    }
    set({ paused: true });
  },

  togglePause() {
    console.log("stopping");
    const { audio, paused } = get();
    if (audio) {
      if (paused) {
        audio.play();
      } else {
        audio.pause();
      }
      set({ paused: !paused });
    }
  },

  stop() {
    const audio = get().audio;
    if (audio) {
      console.log("stopping");
      audio.pause();
      set({ audio: null, paused: true, showPlayer: false });
      setTimeout(() => {
        set({ currentSong: null });
      }, 300);
    }
  },
}));
