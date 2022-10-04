import { array } from "zod";
import create from "zustand";

interface PreviousVotesState {
  battleIds: string[] | null;
  loaded: boolean;
  load: () => void;
  addId: (id: string) => void;
}

const loadBattleIds = (): string[] => {
  if (typeof window !== "undefined") {
    try {
      const arrayString = window.localStorage.getItem("v-ds");
      if (!arrayString) {
        return [];
      }
      const array = JSON.parse(arrayString);
      return array as string[];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const setLocalStorage = (ids: string[]) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("v-ds", JSON.stringify(ids));
  }
};

export const usePreviousVotes = create<PreviousVotesState>((set, get) => ({
  battleIds: null,
  loaded: false,

  load: () => {
    const ids = loadBattleIds();
    set({
      battleIds: ids,
      loaded: true,
    });
  },

  addId: (id: string) => {
    const current = get().battleIds || [];
    set({
      battleIds: [...current, id],
    });
    setLocalStorage([...current, id]);
  },
}));
