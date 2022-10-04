import { array } from "zod";
import create from "zustand";

interface PreviousVotesState {
  matchIds: string[] | null;
  load: () => void;
  addId: (id: string) => void;
  didVoteAlready: (id: string) => boolean;
}

const loadMatchIds = (): string[] => {
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
  matchIds: null,

  load: () => {
    const ids = loadMatchIds();
    set({
      matchIds: ids,
    });
  },

  addId: (id: string) => {
    set({
      matchIds: [...(get().matchIds || []), id],
    });
    setLocalStorage([...(get().matchIds || []), id]);
  },

  didVoteAlready: (id) => {
    const matchIds = get().matchIds;
    if (matchIds === null) {
      return true;
    }
    return matchIds.includes(id);
  },
}));
