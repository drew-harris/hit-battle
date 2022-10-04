import { createProtectedRouter } from "./context";

export const battleRouter = createProtectedRouter().query("today", {
  resolve: async ({ ctx }) => {
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
    });

    return battles;

    try {
    } catch (error) {
      throw new Error("Could not get today's battles");
    }
    return null;
  },
});
