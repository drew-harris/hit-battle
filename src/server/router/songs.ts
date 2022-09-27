import { z } from "zod";
import { createProtectedRouter } from "./context";

export const songRouter = createProtectedRouter()
  .query("search-songs", {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      if (!input) {
        return [];
      }
      try {
        const songs = await ctx.prisma.song.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: input,
                },
              },
              {
                artist: {
                  contains: input,
                },
              },
              {
                album: {
                  contains: input,
                },
              },
            ],
          },
        });
        return songs;
      } catch (error) {
        throw new Error("Could not search songs");
      }
      return;
    },
  })
  .query("song", {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      try {
        const song = await ctx.prisma.song.findUnique({
          where: {
            id: input,
          },
          include: {
            matches: {
              include: {
                songs: true,
              },
            },
            users: true,
            votes: true,
          },
        });

        return song;
      } catch (error) {
        throw new Error("could not get song");
      }
    },
  });
