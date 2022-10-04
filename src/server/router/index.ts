// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { adminRouter } from "./admin";
import { songRouter } from "./songs";
import { battleRouter } from "./battles";
import { votesRouter } from "./votes";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("admin.", adminRouter)
  .merge("songs.", songRouter)
  .merge("battles.", battleRouter)
  .merge("votes.", votesRouter)
  .query("my-session", {
    resolve: ({ ctx }) => {
      return ctx.session;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
