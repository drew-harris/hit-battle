// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { adminRouter } from "./admin";
import { songRouter } from "./songs";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("admin.", adminRouter)
  .merge("songs.", songRouter)
  .query("my-session", {
    resolve: ({ ctx }) => {
      return ctx.session;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
