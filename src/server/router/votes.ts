import { z } from "zod";
import { createProtectedRouter } from "./context";

export const votesRouter = createProtectedRouter()
  .query("votes", {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      try {
        const votes = await ctx.prisma.vote.groupBy({
          where: {
            battleId: input,
          },
          by: ["forId"],
          _count: {
            forId: true,
            _all: true,
          },
        });
        return votes;
      } catch (error) {
        throw new Error("Could not get votes");
      }
    },
  })

  .mutation("cast-vote", {
    input: z.object({
      battleId: z.string(),
      forSongId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const addedPromise = ctx.prisma.vote.create({
          data: {
            battle: {
              connect: { id: input.battleId },
            },
            for: {
              connect: { id: input.forSongId },
            },
            user: {
              connect: { id: ctx.session.user.id },
            },
          },
        });

        const latestCountsPromise = ctx.prisma.battle.findFirst({
          where: {
            id: input.battleId,
          },
          select: {
            voteCounts: true,
            songs: {
              select: {
                id: true,
              },
            },
          },
        });

        const [addedVote, latestCounts] = await Promise.all([
          addedPromise,
          latestCountsPromise,
        ]);
        if (!latestCounts || !latestCounts.songs) {
          throw new Error("Error adding vote");
        }

        const newCounts = latestCounts.voteCounts.map((count, i) => {
          if (latestCounts?.songs[i]?.id === input.forSongId) {
            return count + 1;
          }
          return count;
        });

        const updated = await ctx.prisma.battle.update({
          where: { id: input.battleId },
          data: {
            voteCounts: {
              set: newCounts,
            },
          },
          include: {
            songs: true,
          },
        });

        return { addedVote, battle: updated };
      } catch (error) {
        console.error(error);
        throw new Error("Error casting vote");
      }
    },
  });
