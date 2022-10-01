import { z } from "zod";
import { createProtectedRouter } from "./context";

export const votesRouter = createProtectedRouter().query("votes", {
  input: z.string(),
  resolve: async ({ ctx, input }) => {
    try {
      const votes = await ctx.prisma.vote.aggregate({
        where: {
          battleId: input,
        },
        _count: {
          forId: true,
        },
      });
      console.log(votes);
      return votes;
    } catch (error) {
      throw new Error("Could not get votes");
    }
  },
});
