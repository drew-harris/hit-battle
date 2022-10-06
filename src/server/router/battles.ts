import { createProtectedRouter } from "./context";

export const battleRouter = createProtectedRouter().query("today", {
  resolve: async ({ ctx }) => {
    try {
      const rightNow = new Date();

      const battles = await ctx.prisma.battle.findMany({
        where: {
          startDate: {
            lt: rightNow,
          },
          endDate: {
            gt: rightNow,
          },
        },
        include: {
          songs: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      return battles;
    } catch (error: unknown) {
      console.log(error);
      throw new Error("Could not get today's battles");
    }
  },
});
