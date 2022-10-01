import { createProtectedRouter } from "./context";

export const matchRouter = createProtectedRouter().query("today", {
  resolve: async ({}) => {
    const rightNow = new Date();
    try {
    } catch (error) {
      throw new Error("Could not get today's battles");
    }
    return null;
  },
});
