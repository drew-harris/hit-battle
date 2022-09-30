// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { adminRouter } from "./admin";
import { songRouter } from "./songs";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter)
  .merge("admin.", adminRouter)
  .merge("songs.", songRouter)
  .query("my-session", {
    resolve: ({ ctx }) => {
      return ctx.session;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
