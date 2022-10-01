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
    const currentAudio = get().audio;
    if (currentAudio) {
      currentAudio.pause();
    }
    if (!song.previewUrl) return;
    const audio = new Audio(song.previewUrl);
    audio.volume = 0;
    // Fade in
    // TODO: Customize fading
    function fadeIn() {
      console.log(audio.volume);
      if (audio.currentTime < 0.5) {
        audio.volume = audio.currentTime / 0.5;
      } else {
        removeEventListener("timeupdate", fadeIn);
      }
    }

    audio.addEventListener("timeupdate", fadeIn);
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.pause();
      set({ paused: true });
    });
    audio.addEventListener("change", () => set({ paused: audio.paused }));
    audio.play();
    set({ audio, currentSong: song, paused: false, showPlayer: true });
  },

  pause() {
    const audio = get().audio;
    if (audio) {
      audio.pause();
    }
    set({ paused: true });
  },

  togglePause() {
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
      audio.pause();
      audio.currentTime = 0;
      set({ audio: null, paused: true, showPlayer: false });
      setTimeout(() => {
        set({ currentSong: null });
      }, 300);
    }
  },
}));
